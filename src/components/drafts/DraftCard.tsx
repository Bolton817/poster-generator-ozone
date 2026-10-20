"use client";

import React from "react";
import Link from "next/link";
import { DraftSummary } from "@/features/drafts/types";
import { Clock, Copy, Trash2, ArrowRight, Loader2 } from "lucide-react";

export interface DraftCardProps {
  draft: DraftSummary;
  onDuplicate: (draftId: string) => Promise<void>;
  onDeleteRequest: (draft: DraftSummary) => void;
  isDuplicating: boolean;
}

export function DraftCard({
  draft,
  onDuplicate,
  onDeleteRequest,
  isDuplicating,
}: DraftCardProps) {
  const formattedDate = new Date(draft.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700/80 hover:bg-slate-900 transition-all flex flex-col justify-between group shadow-lg"
      data-testid={`draft-card-${draft.id}`}
    >
      <div className="space-y-3">
        {/* Top Badges & Time */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
            {draft.templateId}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Draft Title */}
        <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
          {draft.name}
        </h3>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Secondary Utility Actions (Duplicate & Delete) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(draft.id)}
            disabled={isDuplicating}
            title="Duplicate this draft"
            aria-label={`Duplicate ${draft.name}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 active:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isDuplicating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onDeleteRequest(draft)}
            title="Delete this draft"
            aria-label={`Delete ${draft.name}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 active:bg-rose-900/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Action: Open in Editor */}
        <Link
          href={`/app/drafts/${draft.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 hover:border-amber-500/40 transition-colors"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
