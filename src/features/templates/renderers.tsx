/**
 * Template Renderer Registry & Resolver
 *
 * Implements Stage 09 & Blueprint Section 5.3:
 * - Maps TemplateId to specialized template compositions
 * - Resolves ReddingtonTemplate for Monday
 * - Provides graceful fallback for remaining templates during active stage development
 */

import React from "react";
import { TemplateId, PosterDocument } from "../poster/schema";
import { ReddingtonTemplate } from "@/components/poster/templates/ReddingtonTemplate";

export type TemplateRendererComponent = React.ComponentType<{
  document: PosterDocument;
  className?: string;
  style?: React.CSSProperties;
}>;

/**
 * Fallback renderer for templates pending their dedicated development stage.
 */
function PlaceholderTemplateRenderer({ document }: { document: PosterDocument }) {
  return (
    <div className="w-[1080px] h-[1350px] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-16 text-center select-none">
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-[600px] space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
          {document.templateId.toUpperCase()} TEMPLATE
        </span>
        <h2 className="text-4xl font-bold font-mono tracking-tight">{document.content.eventTitle}</h2>
        <p className="text-sm text-zinc-400">
          Dedicated composition scheduled in upcoming stages.
        </p>
      </div>
    </div>
  );
}

const TEMPLATE_RENDERERS: Record<TemplateId, TemplateRendererComponent> = {
  reddington: ReddingtonTemplate,
  saint: PlaceholderTemplateRenderer,
  lannister: PlaceholderTemplateRenderer,
  shelby: PlaceholderTemplateRenderer,
  lothbrok: PlaceholderTemplateRenderer,
  escobar: PlaceholderTemplateRenderer,
  pinkman: PlaceholderTemplateRenderer,
};

/**
 * Resolves the visual renderer component for a given template ID.
 */
export function getTemplateRenderer(templateId: TemplateId): TemplateRendererComponent {
  return TEMPLATE_RENDERERS[templateId] || PlaceholderTemplateRenderer;
}
