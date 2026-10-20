/**
 * Stage 10: Full-Screen Poster Preview and Touch Zoom Type Definitions
 *
 * Implements Invariant 11.4:
 * Preview zoom is a display transform only. Base coordinates and dimensions
 * remain strictly unchanged at all zoom levels.
 */

export interface ZoomState {
  /** Multiplier relative to Fit scale (1.0 = Fit) */
  zoomMultiplier: number;
  /** Scale factor that fits 1080x1350 within the viewport without cropping */
  baseFitScale: number;
  /** Effective CSS scale factor: baseFitScale * zoomMultiplier */
  effectiveScale: number;
  /** Horizontal pan offset in pixels */
  panX: number;
  /** Vertical pan offset in pixels */
  panY: number;
  /** Whether the view is currently at default Fit */
  isFit: boolean;
  /** Whether the view is currently at 100% actual master pixel scale (effectiveScale = 1.0) */
  is100Percent: boolean;
  /** Human-readable display percentage (e.g. 42 for 42%) */
  percentage: number;
}

export type ChecklistItemStatus = "ready" | "warning" | "info";

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  detail: string;
}

export interface PreExportEvaluation {
  items: ChecklistItem[];
  isReadyForExport: boolean;
  readyCount: number;
  warningCount: number;
}
