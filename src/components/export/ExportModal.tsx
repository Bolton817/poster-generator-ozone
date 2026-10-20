"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PosterDocument } from "@/features/poster/schema";
import { TemplateDefinition } from "@/features/templates/registry";
import {
  EXPORT_PRESETS,
  ExportPresetOption,
  ExportResult,
} from "@/features/export/types";
import {
  generatePosterFileName,
  triggerBlobDownload,
  canWebShareFiles,
  shareOrDownloadPoster,
} from "@/features/export/export-utils";
import { posterExporter } from "@/features/export/exporter-adapter";
import { evaluatePreExportChecklist } from "@/features/preview/checklist";
import {
  Download,
  Share2,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileImage,
  Info,
} from "lucide-react";

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PosterDocument;
  template: TemplateDefinition;
  canvasElement: HTMLElement | null;
}

export function ExportModal({
  isOpen,
  onClose,
  document,
  template,
  canvasElement,
}: ExportModalProps) {
  const [selectedPresetId, setSelectedPresetId] =
    useState<ExportPresetOption["id"]>("png");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showChecklistDetails, setShowChecklistDetails] = useState(false);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  useEffect(() => {
    setSupportsWebShare(canWebShareFiles());
  }, []);

  const selectedPreset = EXPORT_PRESETS[selectedPresetId];

  const evaluation = useMemo(
    () => evaluatePreExportChecklist(document),
    [document]
  );

  if (!isOpen) return null;

  const handleExport = async (action: "download" | "share") => {
    if (!canvasElement || isExporting) return;

    setIsExporting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const fileName = generatePosterFileName({
        day: template.dayLabel,
        templateName: template.name,
        eventTitle: document.content.eventTitle || "Event",
        format: selectedPreset.format,
      });

      const result: ExportResult = await posterExporter.rasterize(canvasElement, {
        format: selectedPreset.format,
        quality: selectedPreset.quality,
        fileName,
      });

      if (action === "share") {
        const mode = await shareOrDownloadPoster(
          result,
          document.content.eventTitle || `${template.name} Poster`
        );
        if (mode === "shared") {
          setSuccessMsg("Shared poster successfully!");
        } else {
          setSuccessMsg(
            `Downloaded ${selectedPreset.format.toUpperCase()} (${(result.byteSize / 1024).toFixed(1)} KB)`
          );
        }
      } else {
        triggerBlobDownload(result.blob, result.fileName);
        setSuccessMsg(
          `Downloaded ${selectedPreset.format.toUpperCase()} (${result.width}×${result.height}px, ${(result.byteSize / 1024).toFixed(1)} KB)`
        );
      }
    } catch (err: unknown) {
      console.error("[ExportModal] Export failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="export-modal-title"
                className="text-sm font-bold text-slate-100"
              >
                Export Event Poster
              </h2>
              <p className="text-xs text-slate-400">
                {template.dayLabel} • {template.name} • 1080 × 1350 px (4:5)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Format Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Output Format & Quality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                Object.values(EXPORT_PRESETS) as ExportPresetOption[]
              ).map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/5 ring-1 ring-amber-500/30"
                        : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? "text-amber-300" : "text-slate-200"
                        }`}
                      >
                        {preset.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {preset.format.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {preset.description}
                    </p>
                    <div className="mt-2 text-[10px] font-medium text-slate-500">
                      Est. size:{" "}
                      <span className="text-slate-400 font-mono">
                        {preset.estimatedSize}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preflight Checklist Advisory Banner */}
          <div
            className={`p-3.5 rounded-xl border transition-colors ${
              evaluation.warningCount === 0
                ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                : "bg-amber-950/25 border-amber-800/50 text-amber-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {evaluation.warningCount === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-semibold">
                    {evaluation.warningCount === 0
                      ? "Pre-Export Inspection: Ready"
                      : `Pre-Export Inspection: ${evaluation.warningCount} Advisory Item${
                          evaluation.warningCount === 1 ? "" : "s"
                        }`}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {evaluation.warningCount === 0
                      ? "All essential event details (title, performers, offers) verified."
                      : "Some event details may be incomplete. You can still export or review details below."}
                  </p>
                </div>
              </div>

              {evaluation.warningCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowChecklistDetails((prev) => !prev)}
                  className="text-xs flex items-center gap-1 font-medium text-amber-400 hover:text-amber-300 shrink-0"
                >
                  <span>{showChecklistDetails ? "Hide" : "Details"}</span>
                  {showChecklistDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Expanded Warning Items */}
            {showChecklistDetails && evaluation.warningCount > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-800/30 space-y-2">
                {evaluation.items
                  .filter((item) => item.status === "warning")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="text-[11px] flex items-start gap-2 text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <div>
                        <strong className="text-amber-200">{item.label}:</strong>{" "}
                        <span className="text-slate-400">{item.detail}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong className="font-semibold">Export Failed:</strong> {error}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileImage className="w-3.5 h-3.5 text-slate-500" />
            <span>Target: 1080 × 1350 px unscaled master</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {supportsWebShare && (
              <button
                type="button"
                onClick={() => handleExport("share")}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Share</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleExport("download")}
              disabled={isExporting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/10 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rasterizing Poster...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {selectedPreset.format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
