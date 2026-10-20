import { notFound } from "next/navigation";
import { getTemplateById, getTemplatesInOrder } from "@/features/templates/registry";
import { createDefaultPosterDocument } from "@/features/templates/registry";
import { EditorProvider } from "@/features/editor/editor-context";
import { PosterEditor } from "@/components/editor/PosterEditor";
import { TemplateId } from "@/features/poster/schema";

interface TemplateEditorPageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export async function generateStaticParams() {
  const templates = getTemplatesInOrder();
  return templates.map((t) => ({
    templateId: t.id,
  }));
}

export async function generateMetadata({ params }: TemplateEditorPageProps) {
  const { templateId } = await params;
  const template = getTemplateById(templateId as TemplateId);
  if (!template) {
    return { title: "Template Not Found" };
  }
  return {
    title: `${template.name} (${template.dayLabel}) Editor — Ozone Lounge`,
    description: `Customize the ${template.dayLabel} ${template.eventTitle} poster with curated palettes and typography.`,
  };
}

export default async function TemplateEditorPage({ params }: TemplateEditorPageProps) {
  const { templateId } = await params;
  const template = getTemplateById(templateId as TemplateId);

  if (!template) {
    notFound();
  }

  const initialDocument = createDefaultPosterDocument(template.id);

  return (
    <EditorProvider initialDocument={initialDocument}>
      <PosterEditor />
    </EditorProvider>
  );
}
