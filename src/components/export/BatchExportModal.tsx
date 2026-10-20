"use client";

import React, { useState, useRef } from "react";
import {
  BatchExportItem,
  BatchExportProgress,
  BatchExportResult,
  ExportFormat,
  JpegQualityPreset,
} from "@/features/export/types";
import {
  triggerBlobDownload,
  getQualityForPreset,
} from "@/features/export/export-utils";
import { runBatchExport, BatchRenderExecutor } from "@/features/export/batch-export-service";
import { BatchRenderHarness } from "./BatchRenderHarness";
import { PosterDocument } from "@/features/poster/schema";
import {
  Archive,
  CheckCircle2,
  X,
  Loader2,
  FileArchive,
  Download,
  AlertCircle,
} from "lucide-react";

export interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: BatchExportItem[];
}

export function BatchExportModal({
  isOpen,
  onClose,
  availableItems,
}: BatchExportModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(availableItems.map((item) => item.id))
  );
  const [format, setFormat] = useState<ExportFormat>("png");
  const [qualityPreset, setQualityPreset] =
    useState<JpegQualityPreset>("maximum");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchExportProgress | null>(null);
  const [result, setResult] = useState<BatchExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Harness ref and active rendering document
  const harnessNodeRef = useRef<HTMLDivElement>(null);
  const [harnessDoc, setHarnessDoc] = useState<PosterDocument | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.size === availableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableItems.map((item) => item.id)));
    }
  };

  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleStartBatch = async () => {
    const itemsToExport = availableItems.filter((item) =>
      selectedIds.has(item.id)
    );

    if (itemsToExport.length === 0) {
      setError("Please select at least one poster to export.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Define render executor that swaps harnessDoc and waits for DOM mount
    const executor: BatchRenderExecutor = {
      renderDocument: async (item: BatchExportItem): Promise<HTMLElement> => {
        setHarnessDoc(item.document);

        // Wait for React to commit harnessDoc into DOM and fonts to settle
        await new Promise((resolve) => setTimeout(resolve, 150));

        const node = harnessNodeRef.current;
        if (!node) {
          throw new Error("Render harness element not found in DOM");
        }
        return node;
      },
    };

    try {
      const batchResult = await runBatchExport({
        items: itemsToExport,
        format,
        quality: format === "jpeg" ? getQualityForPreset(qualityPreset) : undefined,
        executor,
        onProgress: (p) => setProgress(p),
        signal: controller.signal,
      });

      setResult(batchResult);
      triggerBlobDownload(batchResult.zipBlob, batchResult.fileName);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("cancelled")) {
        setError("Batch export was cancelled.");
      } else {
        console.error("[BatchExportModal] Batch failed:", err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    } finally {
      setIsProcessing(false);
      setHarnessDoc(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (isProcessing && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  };

  return (
    <>
      {/* Hidden Batch Render Canvas */}
      <BatchRenderHarness ref={harnessNodeRef} document={harnessDoc} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-export-modal-title"
      >
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="batch-export-modal-title"
                  className="text-sm font-bold text-slate-100"
                >
                  Weekly Batch Export (.ZIP)
                </h2>
                <p className="text-xs text-slate-400">
                  Bundle multiple posters into a single organized archive
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close batch modal"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Format Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("png")}
                  disabled={isProcessing}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    format === "png"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20"
                      : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="font-bold">Lossless PNG</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Crisp vectors (~2MB per poster)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("jpeg")}
                  disabled={isProcessing}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    format === "jpeg"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20"
                      : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="font-bold">Optimized JPEG</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Compact size (~300KB per poster)
                  </div>
                </button>
              </div>

              {format === "jpeg" && (
                <div className="mt-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] pl-1 font-medium">JPEG Quality:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQualityPreset("maximum")}
                      disabled={isProcessing}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        qualityPreset === "maximum"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Maximum (95%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQualityPreset("high")}
                      disabled={isProcessing}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        qualityPreset === "high"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Social (85%)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Poster Item Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Select Posters ({selectedIds.size} of {availableItems.length})
                </label>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={isProcessing}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  {selectedIds.size === availableItems.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableItems.map((item) => {
                  const isChecked = selectedIds.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-colors ${
                        isChecked
                          ? "bg-slate-800/60 border-slate-700/80 text-slate-100"
                          : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:bg-slate-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          disabled={isProcessing}
                          className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-950"
                        />
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700 shrink-0">
                          {item.dayLabel}
                        </span>
                        <span className="font-semibold truncate">
                          {item.title || item.templateId}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0 capitalize">
                        {item.templateId}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Active Progress Bar */}
            {isProcessing && progress && (
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {progress.phase === "rendering"
                      ? `Rasterizing [${progress.current}/${progress.total}]: ${progress.dayLabel}`
                      : progress.phase === "zipping"
                      ? "Assembling ZIP Archive..."
                      : "Finalizing..."}
                  </span>
                  <span className="font-mono text-slate-400 font-bold">
                    {progress.percent}%
                  </span>
                </div>
                {/* Progress bar line */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Current: {progress.currentTitle}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <strong className="font-semibold">Batch Error:</strong> {error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {result && !isProcessing && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Successfully packaged {result.totalFiles} posters (
                    {(result.byteSize / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerBlobDownload(result.zipBlob, result.fileName)
                  }
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold text-[11px] flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3 h-3" /> Save Again
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <FileArchive className="w-3.5 h-3.5 text-slate-500" />
              <span>Packaging: Deflate Level 6</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                {result ? "Done" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleStartBatch}
                disabled={isProcessing || selectedIds.size === 0}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/10 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Package {selectedIds.size} Posters (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
