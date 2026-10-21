import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PosterDocumentSchema } from "@/features/poster/schema";
import { logger } from "@/lib/logger";

/**
 * GET /api/drafts
 * Lists all saved poster drafts belonging to the authenticated operator.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to view drafts.",
        },
      },
      { status: 401 }
    );
  }

  try {
    const drafts = await db.posterDraft.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        templateId: true,
        templateVersion: true,
        schemaVersion: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, drafts });
  } catch (error: unknown) {
    logger.error("drafts", "Failed to retrieve drafts from database", error, { userId: user.id });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve drafts from database.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drafts
 * Creates a new poster draft for the authenticated operator.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to create drafts.",
        },
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, templateId, templateVersion, schemaVersion, document, thumbnailUrl } =
      body;

    if (!document) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing 'document' payload in draft creation request.",
          },
        },
        { status: 400 }
      );
    }

    // Validate PosterDocument structure
    const parseResult = PosterDocumentSchema.safeParse(document);
    if (!parseResult.success) {
      logger.warn("drafts", "Draft creation schema validation failed", {
        userId: user.id,
        issues: parseResult.error.issues,
      });
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
    const finalTemplateId = templateId || validatedDoc.templateId;
    const finalName = name || validatedDoc.name || `${validatedDoc.content.dayLabel} Poster`;

    const draft = await db.posterDraft.create({
      data: {
        name: finalName,
        templateId: finalTemplateId,
        templateVersion: templateVersion ?? validatedDoc.templateVersion ?? 1,
        schemaVersion: schemaVersion ?? validatedDoc.schemaVersion ?? 1,
        document: validatedDoc as unknown as object,
        thumbnailUrl: thumbnailUrl ?? null,
        userId: user.id,
      },
    });

    logger.info("drafts", "Draft created successfully", {
      draftId: draft.id,
      templateId: draft.templateId,
      name: draft.name,
      userId: user.id,
    });

    return NextResponse.json({ ok: true, draft }, { status: 201 });
  } catch (error: unknown) {
    logger.error("drafts", "Failed to create draft in database", error, { userId: user.id });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create draft record in database.",
        },
      },
      { status: 500 }
    );
  }
}
