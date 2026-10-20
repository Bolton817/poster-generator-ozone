import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { getTemplateById } from "@/features/templates/registry";
import { EditorProvider } from "@/features/editor/editor-context";
import { PosterEditor } from "@/components/editor/PosterEditor";
import { TemplateId, PosterDocument } from "@/features/poster/schema";

interface DraftEditorPageProps {
  params: Promise<{
    draftId: string;
  }>;
}

export async function generateMetadata({ params }: DraftEditorPageProps) {
  const { draftId } = await params;
  const user = await requireAuth();
  const draft = await db.posterDraft.findFirst({
    where: { id: draftId, userId: user.id },
    select: { name: true },
  });

  if (!draft) {
    return { title: "Draft Not Found — Ozone Lounge" };
  }

  return {
    title: `Edit ${draft.name} — Ozone Lounge Poster Generator`,
    description: "Resume editing your saved poster draft.",
  };
}

export default async function DraftEditorPage({ params }: DraftEditorPageProps) {
  const user = await requireAuth();
  const { draftId } = await params;

  const draft = await db.posterDraft.findFirst({
    where: {
      id: draftId,
      userId: user.id, // Strictly owner-scoped per Decision 08
    },
  });

  if (!draft) {
    notFound();
  }

  const template = getTemplateById(draft.templateId as TemplateId);
  if (!template) {
    notFound();
  }

  const initialDocument = draft.document as unknown as PosterDocument;

  return (
    <EditorProvider initialDocument={initialDocument}>
      <PosterEditor draftId={draft.id} initialDraftName={draft.name} />
    </EditorProvider>
  );
}
