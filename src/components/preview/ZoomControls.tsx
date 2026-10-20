"use client";

import React from "react";
import { ZoomState } from "@/features/preview/types";
import { Plus, Minus, Maximize2 } from "lucide-react";

export interface ZoomControlsProps {
  zoomState: ZoomState;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetToFit: () => void;
  onToggle100Percent: () => void;
  className?: string;
}

export function ZoomControls({
  zoomState,
  onZoomIn,
  onZoomOut,
  onResetToFit,
  onToggle100Percent,
  className = "",
}: ZoomControlsProps) {
  const { isFit, is100Percent, percentage } = zoomState;

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md shadow-2xl rounded-2xl p-1.5 text-slate-200 select-none ${className}`}
      role="toolbar"
      aria-label="Poster zoom controls"
      data-testid="zoom-controls-toolbar"
    >
      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoomState.zoomMultiplier <= 0.55}
        aria-label="Zoom out"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Interactive Zoom Percentage Display */}
      <button
        type="button"
        onClick={onResetToFit}
        title="Click to reset to Fit"
        aria-label={`Current zoom: ${isFit ? "Fit" : `${percentage}%`}. Click to reset to Fit.`}
        className="px-3 h-10 flex items-center justify-center rounded-xl text-xs font-mono font-semibold tracking-wider bg-slate-800/40 hover:bg-slate-700/60 transition-colors"
      >
        {isFit ? (
          <span className="text-amber-400">Fit ({percentage}%)</span>
        ) : is100Percent ? (
          <span className="text-emerald-400 font-bold">100%</span>
        ) : (
          <span>{percentage}%</span>
        )}
      </button>

      {/* Zoom In Button */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoomState.zoomMultiplier >= 3.95}
        aria-label="Zoom in"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-700/80 mx-1 shrink-0" />

      {/* Fit to Screen Button */}
      <button
        type="button"
        onClick={onResetToFit}
        aria-label="Fit poster to screen"
        className={`px-3 h-10 flex items-center gap-1.5 rounded-xl text-xs font-medium transition-colors ${
          isFit
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            : "bg-slate-800/60 hover:bg-slate-700/80 text-slate-300"
        }`}
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Fit</span>
      </button>

      {/* 100% Inspection Button */}
      <button
        type="button"
        onClick={onToggle100Percent}
        aria-label="Inspect at 1:1 pixel resolution"
        className={`px-3 h-10 flex items-center justify-center rounded-xl text-xs font-mono font-medium transition-colors ${
          is100Percent
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            : "bg-slate-800/60 hover:bg-slate-700/80 text-slate-300"
        }`}
      >
        100%
      </button>
    </div>
  );
}
