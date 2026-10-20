import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PosterDocument } from "@/features/poster/schema";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

/**
 * POST /api/drafts/[draftId]/duplicate
 * Clones an existing draft into a new draft record for the authenticated owner.
 */
export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to duplicate this draft.",
        },
      },
      { status: 401 }
    );
  }

  const { draftId } = await context.params;

  try {
    const original = await db.posterDraft.findFirst({
      where: {
        id: draftId,
        userId: user.id, // Strictly owner-scoped per Decision 08
      },
    });

    if (!original) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: `Draft with ID "${draftId}" not found or unauthorized.`,
          },
        },
        { status: 404 }
      );
    }

    // Clone the canonical document JSON and prefix the name
    const clonedName = `Copy of ${original.name}`;
    const rawDoc = original.document as unknown as PosterDocument;
    const clonedDoc: PosterDocument = {
      ...rawDoc,
      name: clonedName,
    };

    const duplicate = await db.posterDraft.create({
      data: {
        name: clonedName,
        templateId: original.templateId,
        templateVersion: original.templateVersion,
        schemaVersion: original.schemaVersion,
        document: clonedDoc as unknown as object,
        thumbnailUrl: original.thumbnailUrl,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, draft: duplicate }, { status: 201 });
  } catch (error: unknown) {
    console.error(`[API /api/drafts/${draftId}/duplicate POST] Database error:`, error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to duplicate draft in database.",
        },
      },
      { status: 500 }
    );
  }
}
