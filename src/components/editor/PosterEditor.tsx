"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/features/editor/editor-context";
import { EditorSectionList } from "./EditorSectionList";
import { CanvasViewport } from "@/features/canvas/CanvasViewport";
import { PosterCanvas } from "@/features/canvas/PosterCanvas";
import { getTemplateRenderer } from "@/features/templates/renderers";
import { posterExporter } from "@/features/export/exporter-adapter";
import {
  triggerBlobDownload,
  generatePosterFileName,
} from "@/features/export/export-utils";
import { injectFontFace, waitForFontsReady } from "@/features/fonts/font-loader";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowLeft,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function PosterEditor() {
  const router = useRouter();
  const { state, template, resetToDefaults } = useEditor();
  const { document, isDirty, warnings } = state;

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Mobile tab state: "controls" or "preview"
  const [mobileTab, setMobileTab] = useState<"controls" | "preview">("controls");

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Confirmation dialogs
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Preload and inject template fonts on mount
  useEffect(() => {
    injectFontFace("bebas-neue");
    injectFontFace("source-sans-3");
    injectFontFace("inter");
    waitForFontsReady(["bebas-neue", "source-sans-3", "inter"]);
  }, []);

  // Dynamically resolve template renderer component
  const Renderer = getTemplateRenderer(template.id);

  const handleBackClick = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setShowLeaveDialog(true);
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveDialog(false);
    router.push("/app/templates");
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setShowResetDialog(false);
  };

  const handleExport = async (format: "png" | "jpeg") => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    setExportError(null);
    setExportSuccessMsg(null);

    try {
      const fileName = generatePosterFileName({
        day: template.dayLabel,
        templateName: template.name,
        eventTitle: document.content.eventTitle || "Event",
        format,
      });

      const result = await posterExporter.rasterize(canvasRef.current, {
        format,
        quality: 0.95,
        fileName,
      });

      triggerBlobDownload(result.blob, result.fileName);
      setExportSuccessMsg(
        `Exported ${format.toUpperCase()} (${result.width}×${result.height}px, ${(result.byteSize / 1024).toFixed(1)} KB)`
      );

      // Auto-clear success message after 4 seconds
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err: unknown) {
      console.error("[PosterEditor] Export error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setExportError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Editor Toolbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app/templates"
            onClick={handleBackClick}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              {template.dayLabel}
            </span>
            <span className="text-sm font-bold text-slate-100 truncate">
              {template.name}
            </span>
          </div>

          {/* Dirty State Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            {isDirty ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved edits
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                In sync
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setMobileTab("controls")}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors ${
                mobileTab === "controls"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" /> Controls
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors ${
                mobileTab === "preview"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>

          {/* Reset Action */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            disabled={!isDirty}
            title="Reset to template defaults"
            className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport("png")}
              className="text-xs flex items-center gap-1.5"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport("jpeg")}
              className="text-xs hidden sm:flex items-center gap-1 border-slate-800 text-slate-300 hover:text-white"
            >
              <span>JPEG</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Export Feedback Toasts / Banners */}
      {exportSuccessMsg && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccessMsg(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {exportError && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{exportError}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left / Mobile Preview Viewport */}
        <div
          className={`flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-hidden ${
            mobileTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="w-full h-full max-w-2xl max-h-[95%] flex items-center justify-center">
            <CanvasViewport showBadge={true} padding={16}>
              <PosterCanvas ref={canvasRef}>
                <Renderer document={document} />
              </PosterCanvas>
            </CanvasViewport>
          </div>
        </div>

        {/* Desktop Right / Mobile Controls Panel */}
        <div
          className={`w-full lg:w-[460px] xl:w-[480px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden ${
            mobileTab === "controls" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Header of Section List */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Editor Controls</h2>
              <p className="text-xs text-slate-400">
                Configure content, lineup, imagery, and design presets
              </p>
            </div>

            {warnings.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                {warnings.length} {warnings.length === 1 ? "guidance" : "guidances"}
              </span>
            )}
          </div>

          {/* Scrollable Accordion Section List */}
          <div className="flex-1 overflow-y-auto p-4">
            <EditorSectionList />
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        title="Reset to Template Defaults?"
        description="Are you sure you want to discard your edits? This will restore the original title, lineup, and promotional content from the template brief."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowResetDialog(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmReset}
            className="bg-rose-600 hover:bg-rose-500 text-white"
          >
            Confirm Reset
          </Button>
        </div>
      </Dialog>

      {/* Unsaved Changes Leave Dialog */}
      <Dialog
        open={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        title="Unsaved Changes"
        description="You have unsaved changes in this poster. If you leave now, your current in-memory edits will be discarded."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowLeaveDialog(false)}
          >
            Stay in Editor
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmLeave}
            className="bg-amber-600 hover:bg-amber-500 text-white"
          >
            Discard & Leave
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
