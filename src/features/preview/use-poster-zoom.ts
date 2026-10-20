"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomState } from "./types";
import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
} from "../canvas/constants";

export interface UsePosterZoomOptions {
  padding?: number;
  minZoomMultiplier?: number;
  maxZoomMultiplier?: number;
  onClose?: () => void;
}

export function usePosterZoom(options: UsePosterZoomOptions = {}) {
  const {
    padding = 24,
    minZoomMultiplier = 0.5,
    maxZoomMultiplier = 4.0,
    onClose,
  } = options;

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [viewportDimensions, setViewportDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [zoomMultiplier, setZoomMultiplier] = useState(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ref tracking for live gesture events to avoid stale closures
  const activePointers = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartMultiplier = useRef<number>(1.0);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef<number>(0);

  // Measure container viewport on mount and resize
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    measure();
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Compute pure base Fit scale
  const computeBaseFitScale = useCallback(
    (vw: number, vh: number): number => {
      if (vw <= 0 || vh <= 0) return 0.25;
      const availW = Math.max(10, vw - padding * 2);
      const availH = Math.max(10, vh - padding * 2);
      return Math.min(availW / POSTER_MASTER_WIDTH, availH / POSTER_MASTER_HEIGHT);
    },
    [padding]
  );

  const baseFitScale = computeBaseFitScale(
    viewportDimensions.width,
    viewportDimensions.height
  );

  const effectiveScale = baseFitScale * zoomMultiplier;
  const isFit = Math.abs(zoomMultiplier - 1.0) < 0.02;
  const is100Percent = Math.abs(effectiveScale - 1.0) < 0.02;
  const percentage = Math.round(effectiveScale * 100);

  // Clamp pan boundaries so poster doesn't drift off screen
  const clampPan = useCallback(
    (
      newPan: { x: number; y: number },
      targetMultiplier: number
    ): { x: number; y: number } => {
      if (targetMultiplier <= 1.0) {
        return { x: 0, y: 0 };
      }

      const scaledW = POSTER_MASTER_WIDTH * baseFitScale * targetMultiplier;
      const scaledH = POSTER_MASTER_HEIGHT * baseFitScale * targetMultiplier;

      const maxPanX = Math.max(0, (scaledW - viewportDimensions.width + padding * 2) / 2);
      const maxPanY = Math.max(0, (scaledH - viewportDimensions.height + padding * 2) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, newPan.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newPan.y)),
      };
    },
    [baseFitScale, viewportDimensions, padding]
  );

  // Accessible Zoom controls actions
  const zoomIn = useCallback(() => {
    setZoomMultiplier((prev) => {
      const next = Math.min(maxZoomMultiplier, prev * 1.25);
      setPan((p) => clampPan(p, next));
      return next;
    });
  }, [maxZoomMultiplier, clampPan]);

  const zoomOut = useCallback(() => {
    setZoomMultiplier((prev) => {
      const next = Math.max(minZoomMultiplier, prev / 1.25);
      if (next <= 1.0) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((p) => clampPan(p, next));
      }
      return next;
    });
  }, [minZoomMultiplier, clampPan]);

  const resetToFit = useCallback(() => {
    setZoomMultiplier(1.0);
    setPan({ x: 0, y: 0 });
  }, []);

  const toggle100Percent = useCallback(() => {
    if (is100Percent || zoomMultiplier > 1.1) {
      resetToFit();
    } else {
      if (baseFitScale > 0) {
        const targetMultiplier = Math.min(
          maxZoomMultiplier,
          Math.max(minZoomMultiplier, 1.0 / baseFitScale)
        );
        setZoomMultiplier(targetMultiplier);
        setPan({ x: 0, y: 0 });
      }
    }
  }, [is100Percent, zoomMultiplier, baseFitScale, maxZoomMultiplier, minZoomMultiplier, resetToFit]);

  // Pointer gesture handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only capture primary or touch pointers
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1) {
      lastPanPoint.current = { x: e.clientX, y: e.clientY };

      // Double tap detection
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        toggle100Percent();
        lastTapTime.current = 0;
      } else {
        lastTapTime.current = now;
      }
    } else if (activePointers.current.size === 2) {
      // Begin pinch
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartDistance.current = dist;
      pinchStartMultiplier.current = zoomMultiplier;
      lastPanPoint.current = null;
    }
  }, [zoomMultiplier, toggle100Percent]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activePointers.current.has(e.pointerId)) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Handle 2-finger pinch
      if (
        activePointers.current.size === 2 &&
        pinchStartDistance.current !== null &&
        pinchStartDistance.current > 0
      ) {
        const pts = Array.from(activePointers.current.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const ratio = currentDist / pinchStartDistance.current;
        const targetMultiplier = Math.max(
          minZoomMultiplier,
          Math.min(maxZoomMultiplier, pinchStartMultiplier.current * ratio)
        );

        setZoomMultiplier(targetMultiplier);
        if (targetMultiplier <= 1.0) {
          setPan({ x: 0, y: 0 });
        } else {
          setPan((p) => clampPan(p, targetMultiplier));
        }
        return;
      }

      // Handle 1-finger pan if zoomed in
      if (activePointers.current.size === 1 && zoomMultiplier > 1.0 && lastPanPoint.current) {
        const dx = e.clientX - lastPanPoint.current.x;
        const dy = e.clientY - lastPanPoint.current.y;
        lastPanPoint.current = { x: e.clientX, y: e.clientY };

        setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }, zoomMultiplier));
      }
    },
    [zoomMultiplier, minZoomMultiplier, maxZoomMultiplier, clampPan]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      pinchStartDistance.current = null;
    }
    if (activePointers.current.size === 1) {
      const remaining = Array.from(activePointers.current.values())[0];
      lastPanPoint.current = remaining;
    } else if (activePointers.current.size === 0) {
      lastPanPoint.current = null;
    }
  }, []);

  // Mouse wheel handler with passive: false to prevent document zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.85;

      setZoomMultiplier((prev) => {
        const next = Math.max(
          minZoomMultiplier,
          Math.min(maxZoomMultiplier, prev * factor)
        );
        if (next <= 1.0) {
          setPan({ x: 0, y: 0 });
        } else {
          setPan((p) => clampPan(p, next));
        }
        return next;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [minZoomMultiplier, maxZoomMultiplier, clampPan]);

  // Keyboard shortcut listeners (Escape, +, -, 0)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetToFit();
      } else if (e.key === "1") {
        e.preventDefault();
        toggle100Percent();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, zoomIn, zoomOut, resetToFit, toggle100Percent]);

  const state: ZoomState = {
    zoomMultiplier,
    baseFitScale,
    effectiveScale,
    panX: pan.x,
    panY: pan.y,
    isFit,
    is100Percent,
    percentage,
  };

  return {
    viewportRef,
    state,
    zoomIn,
    zoomOut,
    resetToFit,
    toggle100Percent,
    setZoomMultiplier,
    gestureHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
