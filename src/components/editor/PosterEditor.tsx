"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/features/editor/editor-context";
import { EditorSectionList } from "./EditorSectionList";
import { CanvasViewport } from "@/features/canvas/CanvasViewport";
import { PosterCanvas } from "@/features/canvas/PosterCanvas";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowLeft,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function PosterEditor() {
  const router = useRouter();
  const { state, template, resetToDefaults } = useEditor();
  const { document, isDirty, warnings } = state;

  // Mobile tab state: "controls" or "preview"
  const [mobileTab, setMobileTab] = useState<"controls" | "preview">("controls");

  // Confirmation dialogs
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Active palette tokens for live preview
  const activePalette =
    template.palettePresets.find((p) => p.id === document.styling.paletteId) ||
    template.palettePresets[0];

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

          {/* Diagnostic POC Link */}
          <Link href="/diagnostic/canvas-poc" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export POC</span>
            </Button>
          </Link>
        </div>
      </header>

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
              <PosterCanvas>
                {/* Live Responsive Render of Current Document State */}
                <div
                  className="w-full h-full relative flex flex-col justify-between p-16 select-none"
                  style={{
                    backgroundColor: activePalette?.background || "#120a02",
                    color: activePalette?.text || "#ffffff",
                  }}
                >
                  {/* Decorative background glow using active palette tokens */}
                  <div
                    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${activePalette?.primary || "#f59e0b"}40 0%, transparent 70%)`,
                      filter: "blur(50px)",
                    }}
                  />

                  {/* Header / Brand */}
                  <div
                    className="relative z-10 flex items-center justify-between pb-8"
                    style={{ borderBottom: `1px solid ${activePalette?.primary || "#f59e0b"}30` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl tracking-tighter"
                        style={{
                          backgroundColor: `${activePalette?.primary || "#f59e0b"}20`,
                          border: `1px solid ${activePalette?.primary || "#f59e0b"}50`,
                          color: activePalette?.primary || "#f59e0b",
                        }}
                      >
                        OZ
                      </div>
                      <div>
                        <span
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          className="text-4xl tracking-wider block"
                          style-color={activePalette?.primary}
                        >
                          {document.content.venueName || "OZONE LOUNGE"}
                        </span>
                        <span
                          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                          className="text-sm font-semibold tracking-widest uppercase opacity-75"
                        >
                          {template.tag}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        className="text-3xl tracking-wider block"
                      >
                        {template.dayLabel.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Source Sans 3', sans-serif",
                          color: activePalette?.accent || "#fbbf24",
                        }}
                        className="text-sm font-bold tracking-wider uppercase"
                      >
                        {template.name}
                      </span>
                    </div>
                  </div>

                  {/* Body / Lineup / Headline */}
                  <div className="relative z-10 my-auto text-center flex flex-col items-center">
                    <div
                      className="inline-block px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6"
                      style={{
                        backgroundColor: `${activePalette?.primary || "#f59e0b"}15`,
                        border: `1px solid ${activePalette?.primary || "#f59e0b"}40`,
                        color: activePalette?.primary || "#f59e0b",
                      }}
                    >
                      {template.dayLabel} Session
                    </div>

                    <h1
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "92px",
                        lineHeight: "0.95",
                        letterSpacing: "0.03em",
                        color: activePalette?.primary || "#f59e0b",
                      }}
                      className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-6 max-w-[900px]"
                    >
                      {document.content.eventTitle || "UNTITLED EVENT"}
                    </h1>

                    {/* Lineup Block */}
                    {(document.content.djNames.length > 0 || document.content.hostNames.length > 0) && (
                      <div className="flex flex-col items-center gap-3 mt-4">
                        {document.content.djNames.length > 0 && (
                          <div className="text-center">
                            <span
                              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                              className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-0.5"
                            >
                              Featured DJs
                            </span>
                            <span
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              className="text-4xl tracking-wide"
                            >
                              {document.content.djNames.join(" & ")}
                            </span>
                          </div>
                        )}

                        {document.content.hostNames.length > 0 && (
                          <div className="text-center mt-1">
                            <span
                              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                              className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-0.5"
                            >
                              Hosted By
                            </span>
                            <span
                              style={{ fontFamily: "'Inter', sans-serif" }}
                              className="text-lg font-medium opacity-90"
                            >
                              {document.content.hostNames.join(" & ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Offer Panel (Omitted cleanly if empty) */}
                    {(document.content.primaryOffer || document.content.secondaryOffer) && (
                      <div
                        className="mt-10 w-full max-w-[760px] p-7 rounded-2xl shadow-2xl backdrop-blur-md"
                        style={{
                          backgroundColor: "rgba(10, 10, 12, 0.85)",
                          border: `1px solid ${activePalette?.primary || "#f59e0b"}40`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <span
                              style={{
                                fontFamily: "'Source Sans 3', sans-serif",
                                color: activePalette?.accent || "#fbbf24",
                              }}
                              className="text-xs font-bold uppercase tracking-wider block"
                            >
                              Special Offer
                            </span>
                            <span
                              style={{ fontFamily: "'Inter', sans-serif" }}
                              className="text-2xl font-semibold text-slate-100 block mt-1"
                            >
                              {document.content.primaryOffer}
                            </span>
                          </div>
                          {document.content.secondaryOffer && (
                            <div
                              className="px-4 py-2 rounded-lg"
                              style={{
                                backgroundColor: `${activePalette?.primary || "#f59e0b"}20`,
                                border: `1px solid ${activePalette?.primary || "#f59e0b"}40`,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  color: activePalette?.secondary || "#fdba74",
                                }}
                                className="text-xs font-bold uppercase tracking-widest"
                              >
                                {document.content.secondaryOffer}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer / Practical Details */}
                  <div
                    className="relative z-10 flex items-center justify-between pt-8 text-xs opacity-75"
                    style={{ borderTop: `1px solid ${activePalette?.primary || "#f59e0b"}30` }}
                  >
                    <div style={{ fontFamily: "'Inter', sans-serif" }}>
                      {document.content.dateText || "Date TBD"}
                      {document.content.startTime && ` · ${document.content.startTime}`}
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif" }}>
                      {document.content.locationText || "Ozone Lounge"}
                      {document.content.socialHandle && ` · ${document.content.socialHandle}`}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Source Sans 3', sans-serif",
                        color: activePalette?.accent || "#fbbf24",
                      }}
                      className="tracking-widest uppercase font-semibold"
                    >
                      1080 × 1350
                    </div>
                  </div>
                </div>
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
