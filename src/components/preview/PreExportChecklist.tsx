"use client";

import React from "react";
import { PreExportEvaluation } from "@/features/preview/types";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface PreExportChecklistProps {
  evaluation: PreExportEvaluation;
  isOpen: boolean;
  onClose: () => void;
}

export function PreExportChecklist({
  evaluation,
  isOpen,
  onClose,
}: PreExportChecklistProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checklist-title"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div>
            <h2 id="checklist-title" className="text-sm font-bold text-slate-100">
              Pre-Export Inspection Checklist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {evaluation.warningCount === 0
                ? "All essential event details verified"
                : `${evaluation.warningCount} advisory item${evaluation.warningCount === 1 ? "" : "s"} noticed`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checklist"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of checked items */}
        <div className="p-5 overflow-y-auto space-y-3">
          {evaluation.items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-start gap-3 ${
                item.status === "ready"
                  ? "bg-slate-800/40 border-slate-800"
                  : item.status === "warning"
                  ? "bg-amber-950/20 border-amber-800/40"
                  : "bg-slate-800/20 border-slate-800/60"
              }`}
            >
              {item.status === "ready" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {item.status === "warning" && (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              {item.status === "info" && (
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                      item.status === "ready"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : item.status === "warning"
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Advisories do not prevent master export
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
