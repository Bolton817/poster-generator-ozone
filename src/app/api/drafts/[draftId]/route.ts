import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PosterDocumentSchema } from "@/features/poster/schema";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

/**
 * GET /api/drafts/[draftId]
 * Retrieves a single draft record for the authenticated owner.
 */
export async function GET(
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
          message: "You must be signed in to view this draft.",
        },
      },
      { status: 401 }
    );
  }

  const { draftId } = await context.params;

  try {
    const draft = await db.posterDraft.findFirst({
      where: {
        id: draftId,
        userId: user.id, // Strictly owner-scoped per Decision 08
      },
    });

    if (!draft) {
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

    return NextResponse.json({ ok: true, draft });
  } catch (error: unknown) {
    console.error(`[API /api/drafts/${draftId} GET] Database error:`, error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve draft from database.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/drafts/[draftId]
 * Updates an existing poster draft for the authenticated owner.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to update this draft.",
        },
      },
      { status: 401 }
    );
  }

  const { draftId } = await context.params;

  try {
    // 1. Verify existence and ownership
    const existing = await db.posterDraft.findFirst({
      where: {
        id: draftId,
        userId: user.id,
      },
    });

    if (!existing) {
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

    // 2. Parse and validate body
    const body = await request.json();
    const { name, document, thumbnailUrl } = body;

    if (!document) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing 'document' payload in update request.",
          },
        },
        { status: 400 }
      );
    }

    const parseResult = PosterDocumentSchema.safeParse(document);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid PosterDocument JSON schema.",
            issues: parseResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const validatedDoc = parseResult.data;
    const finalName = name || validatedDoc.name || existing.name;

    // 3. Persist update
    const updatedDraft = await db.posterDraft.update({
      where: { id: draftId },
      data: {
        name: finalName,
        document: validatedDoc as unknown as object,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existing.thumbnailUrl,
        templateVersion: validatedDoc.templateVersion ?? existing.templateVersion,
        schemaVersion: validatedDoc.schemaVersion ?? existing.schemaVersion,
      },
    });

    return NextResponse.json({ ok: true, draft: updatedDraft });
  } catch (error: unknown) {
    console.error(`[API /api/drafts/${draftId} PUT] Database error:`, error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update draft in database.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drafts/[draftId]
 * Deletes a poster draft belonging to the authenticated owner.
 */
export async function DELETE(
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
          message: "You must be signed in to delete this draft.",
        },
      },
      { status: 401 }
    );
  }

  const { draftId } = await context.params;

  try {
    const deleteResult = await db.posterDraft.deleteMany({
      where: {
        id: draftId,
        userId: user.id, // Strictly owner-scoped per Decision 08
      },
    });

    if (deleteResult.count === 0) {
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

    return NextResponse.json({
      ok: true,
      message: "Draft deleted successfully.",
    });
  } catch (error: unknown) {
    console.error(`[API /api/drafts/${draftId} DELETE] Database error:`, error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete draft from database.",
        },
      },
      { status: 500 }
    );
  }
}
