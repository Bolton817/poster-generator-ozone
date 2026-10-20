"use client";

import React, { useEffect } from "react";
import { useResponsiveCanvas, UseResponsiveCanvasOptions } from "./use-responsive-canvas";
import { POSTER_MASTER_WIDTH, POSTER_MASTER_HEIGHT } from "./constants";

export interface CanvasViewportProps extends UseResponsiveCanvasOptions {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  showBadge?: boolean;
  onScaleChange?: (scale: number) => void;
  exportRootRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Two-tier responsive viewport wrapper for the master poster canvas.
 *
 * Tier 1: Outer layout box reserves displayWidth x displayHeight in document flow.
 * Tier 2: Inner container applies transform: scale(s) from origin (0, 0).
 *
 * Prevents horizontal scrolling on narrow screens while maintaining pixel-perfect
 * master coordinate geometry (1080x1350) for editing and raster export.
 */
export function CanvasViewport({
  children,
  className = "",
  viewportClassName = "",
  padding,
  zoomMultiplier,
  showBadge = false,
  onScaleChange,
}: CanvasViewportProps) {
  const {
    containerRef,
    scale,
    displayWidth,
    displayHeight,
    isReady,
  } = useResponsiveCanvas({
    padding,
    zoomMultiplier,
    masterWidth: POSTER_MASTER_WIDTH,
    masterHeight: POSTER_MASTER_HEIGHT,
  });

  useEffect(() => {
    if (onScaleChange && isReady) {
      onScaleChange(scale);
    }
  }, [scale, isReady, onScaleChange]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden p-2 select-none ${viewportClassName}`}
      data-testid="canvas-viewport-container"
    >
      {/* Tier 1: Reserved layout box matching the visual footprint */}
      <div
        className={`relative transition-all duration-75 shadow-2xl rounded-sm ${className}`}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
        data-testid="canvas-tier-1-layout-box"
      >
        {/* Tier 2: Scaled inner viewport */}
        <div
          style={{
            width: `${POSTER_MASTER_WIDTH}px`,
            height: `${POSTER_MASTER_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          data-testid="canvas-tier-2-transform-wrapper"
        >
          {children}
        </div>

        {/* Informational badge (Always outside scaled DOM) */}
        {showBadge && (
          <div
            className="absolute -bottom-7 right-0 px-2 py-0.5 text-[10px] font-mono tracking-wider rounded bg-zinc-900/80 text-zinc-400 border border-zinc-800 pointer-events-none"
            data-testid="canvas-dimensions-badge"
          >
            {POSTER_MASTER_WIDTH}×{POSTER_MASTER_HEIGHT} ({(scale * 100).toFixed(1)}%)
          </div>
        )}
      </div>
    </div>
  );
}
