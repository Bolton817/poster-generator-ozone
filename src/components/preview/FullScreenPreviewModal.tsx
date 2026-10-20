"use client";

import React, { useState, useMemo } from "react";
import { PosterDocument } from "@/features/poster/schema";
import { TemplateDefinition } from "@/features/templates/registry";
import { getTemplateRenderer } from "@/features/templates/renderers";
import { usePosterZoom } from "@/features/preview/use-poster-zoom";
import { evaluatePreExportChecklist } from "@/features/preview/checklist";
import { ZoomControls } from "./ZoomControls";
import { PreExportChecklist } from "./PreExportChecklist";
import {
  X,
  Download,
  ClipboardCheck,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

export interface FullScreenPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PosterDocument;
  template: TemplateDefinition;
  onExport: (format: "png" | "jpeg") => Promise<void>;
  onOpenExportModal?: () => void;
  isExporting: boolean;
  exportSuccessMsg?: string | null;
  exportError?: string | null;
}

export function FullScreenPreviewModal({
  isOpen,
  onClose,
  document,
  template,
  onExport,
  onOpenExportModal,
  isExporting,
  exportSuccessMsg,
  exportError,
}: FullScreenPreviewModalProps) {
  const [showChecklist, setShowChecklist] = useState(false);

  const {
    viewportRef,
    state: zoomState,
    zoomIn,
    zoomOut,
    resetToFit,
    toggle100Percent,
    gestureHandlers,
  } = usePosterZoom({
    padding: 32,
    minZoomMultiplier: 0.5,
    maxZoomMultiplier: 4.0,
    onClose,
  });

  const evaluation = useMemo(
    () => evaluatePreExportChecklist(document),
    [document]
  );

  const Renderer = getTemplateRenderer(template.id);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen poster preview"
      data-testid="fullscreen-preview-modal"
    >
      {/* ----------------------------------------------------
          TOP NAVIGATION & ACTION BAR
         ---------------------------------------------------- */}
      <header className="h-16 px-4 md:px-6 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview and return to editor"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="h-5 w-px bg-slate-800 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              {template.dayLabel}
            </span>
            <span className="text-sm font-bold text-slate-100 truncate">
              {template.name}
            </span>
            <span className="hidden md:inline text-xs text-slate-400 truncate">
              — {document.content.eventTitle || "Draft Preview"}
            </span>
          </div>
        </div>

        {/* Action Controls & Export Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pre-export Checklist Trigger */}
          <button
            type="button"
            onClick={() => setShowChecklist(true)}
            aria-label="Open pre-export checklist"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              evaluation.warningCount === 0
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">
              {evaluation.warningCount === 0
                ? "Checklist Ready"
                : `${evaluation.warningCount} Advisories`}
            </span>
          </button>

          {/* Export Action */}
          {onOpenExportModal ? (
            <button
              type="button"
              onClick={onOpenExportModal}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/10"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export Poster</span>
            </button>
          ) : (
            <>
              {/* Export PNG */}
              <button
                type="button"
                onClick={() => onExport("png")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/10"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Export PNG</span>
              </button>

              {/* Export JPEG */}
              <button
                type="button"
                onClick={() => onExport("jpeg")}
                disabled={isExporting}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700/80 disabled:opacity-50 transition-colors"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>JPEG</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------
          EXPORT NOTIFICATION BANNERS
         ---------------------------------------------------- */}
      {exportSuccessMsg && (
        <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2 z-20 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {exportError && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 text-xs text-rose-300 flex items-center gap-2 z-20 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{exportError}</span>
        </div>
      )}

      {/* ----------------------------------------------------
          GESTURE & ZOOM STAGE VIEWPORT
         ---------------------------------------------------- */}
      <main
        ref={viewportRef}
        {...gestureHandlers}
        className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center touch-none select-none ${
          zoomState.zoomMultiplier > 1.05
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        }`}
        data-testid="preview-gesture-surface"
      >
        {/* Transform Container: Applies live translation and scaling */}
        <div
          style={{
            transform: `translate3d(${zoomState.panX}px, ${zoomState.panY}px, 0) scale(${zoomState.effectiveScale})`,
            transformOrigin: "center center",
            transition:
              zoomState.zoomMultiplier === 1.0 && zoomState.panX === 0
                ? "transform 0.15s ease-out"
                : "none",
          }}
          className="will-change-transform shrink-0"
        >
          {/* Master 1080x1350 Composition Node */}
          <div
            className="w-[1080px] h-[1350px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden shrink-0 rounded-sm"
            data-testid="preview-unscaled-master-node"
          >
            <Renderer document={document} />
          </div>
        </div>

        {/* Floating Zoom Controls Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <ZoomControls
            zoomState={zoomState}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetToFit={resetToFit}
            onToggle100Percent={toggle100Percent}
          />
        </div>
      </main>

      {/* Pre-Export Checklist Modal */}
      <PreExportChecklist
        evaluation={evaluation}
        isOpen={showChecklist}
        onClose={() => setShowChecklist(false)}
      />
    </div>
  );
}
