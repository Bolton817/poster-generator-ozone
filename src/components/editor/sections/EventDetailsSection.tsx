"use client";

import React from "react";
import { useEditor } from "@/features/editor/editor-context";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Input } from "@/components/ui/Input";
import { Sparkles, AlertTriangle } from "lucide-react";
import { TITLE_WARNING_THRESHOLD } from "@/features/editor/validation";

export function EventDetailsSection() {
  const { state, setTitle, setDraftName, template } = useEditor();
  const { document, warnings } = state;

  const titleWarning = warnings.find((w) => w.field === "eventTitle");
  const titleLength = document.content.eventTitle.length;

  return (
    <CollapsibleSection
      title="Event Details"
      subtitle={`${template.dayLabel} · ${template.eventTitle}`}
      defaultOpen={true}
      icon={<Sparkles className="w-4 h-4" />}
    >
      <div className="space-y-4 p-4">
        {/* Template & Weekday Info Badge */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Assigned Template</span>
            <span className="text-amber-400 font-semibold">{template.name} ({template.dayLabel})</span>
          </div>
          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
            {template.tag}
          </span>
        </div>

        {/* Event Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="editor-event-title" className="text-xs font-medium text-slate-300">
              Event Title <span className="text-amber-400">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                titleLength > TITLE_WARNING_THRESHOLD
                  ? "text-amber-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {titleLength} / {TITLE_WARNING_THRESHOLD} chars
            </span>
          </div>
          <Input
            id="editor-event-title"
            value={document.content.eventTitle}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Old Classics & Sundowners"
            aria-describedby={titleWarning ? "event-title-warning" : undefined}
          />
          {titleWarning && (
            <div
              id="event-title-warning"
              className="flex items-center gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{titleWarning.message}</span>
            </div>
          )}
        </div>

        {/* Draft Name */}
        <div className="space-y-1.5">
          <Input
            id="editor-draft-name"
            label="Draft Name (Internal)"
            value={document.name}
            onChange={(e) => setDraftName(e.target.value)}
            helperText="Used to identify this poster recipe in your saved drafts list"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
