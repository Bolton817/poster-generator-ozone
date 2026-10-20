"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  calculateCanvasScale,
  DEFAULT_CANVAS_PADDING,
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  MIN_CANVAS_SCALE,
  MAX_CANVAS_SCALE,
} from "./constants";

export interface UseResponsiveCanvasOptions {
  padding?: number;
  zoomMultiplier?: number;
  masterWidth?: number;
  masterHeight?: number;
}

export interface ResponsiveCanvasState {
  scale: number;
  baseScale: number;
  displayWidth: number;
  displayHeight: number;
  containerWidth: number;
  containerHeight: number;
  isReady: boolean;
}

/**
 * Hook for responsive poster scaling using ResizeObserver.
 * Computes uniform scale factor that fits 1080x1350 canvas within the container element.
 */
export function useResponsiveCanvas(options: UseResponsiveCanvasOptions = {}) {
  const {
    padding = DEFAULT_CANVAS_PADDING,
    zoomMultiplier = 1.0,
    masterWidth = POSTER_MASTER_WIDTH,
    masterHeight = POSTER_MASTER_HEIGHT,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<ResponsiveCanvasState>({
    scale: 0.25,
    baseScale: 0.25,
    displayWidth: Math.round(masterWidth * 0.25),
    displayHeight: Math.round(masterHeight * 0.25),
    containerWidth: 0,
    containerHeight: 0,
    isReady: false,
  });

  const updateDimensions = useCallback(
    (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;

      const calc = calculateCanvasScale({
        containerWidth: width,
        containerHeight: height,
        padding,
        masterWidth,
        masterHeight,
      });

      const effectiveScale = Math.max(
        MIN_CANVAS_SCALE,
        Math.min(MAX_CANVAS_SCALE, calc.scale * zoomMultiplier)
      );

      setState({
        scale: effectiveScale,
        baseScale: calc.scale,
        displayWidth: Math.round(masterWidth * effectiveScale),
        displayHeight: Math.round(masterHeight * effectiveScale),
        containerWidth: width,
        containerHeight: height,
        isReady: true,
      });
    },
    [padding, zoomMultiplier, masterWidth, masterHeight]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial measurement
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      updateDimensions(rect.width, rect.height);
    }

    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // Use requestAnimationFrame to avoid ResizeObserver loop limit exceeded
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const { width, height } = entry.contentRect;
        updateDimensions(width, height);
      });
    });

    observer.observe(el);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [updateDimensions]);

  const recalculate = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      updateDimensions(rect.width, rect.height);
    }
  }, [updateDimensions]);

  return {
    containerRef,
    ...state,
    recalculate,
  };
}
