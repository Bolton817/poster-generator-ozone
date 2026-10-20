"use client";

import React, { forwardRef } from "react";
import { POSTER_MASTER_WIDTH, POSTER_MASTER_HEIGHT } from "./constants";

export interface PosterCanvasProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

/**
 * Fixed 1080 × 1350 px master coordinate canvas.
 * This element is the absolute source of truth for all template renderers and the target for raster export.
 */
export const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  function PosterCanvas({ children, className = "", style = {}, id = "poster-artwork-root" }, ref) {
    return (
      <div
        ref={ref}
        id={id}
        data-poster-canvas="true"
        style={{
          width: `${POSTER_MASTER_WIDTH}px`,
          height: `${POSTER_MASTER_HEIGHT}px`,
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          backgroundColor: "#0d0f14", // Neutral dark default canvas backing
          color: "#ffffff",
          // Reset CSS inheritance so app UI theme does not recolour the poster
          lineHeight: 1.2,
          fontSmooth: "always",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          ...style,
        }}
        className={`poster-canvas-root select-none ${className}`}
      >
        {children}
      </div>
    );
  }
);
