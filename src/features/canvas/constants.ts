/**
 * Master Poster Canvas Constants & Pure Scaling Calculations
 *
 * Implements Stage 07 fixed-coordinate contracts:
 * - Master dimensions: 1080 × 1350 px (4:5 social-feed aspect ratio)
 * - Pure scaling math based on available container dimensions and padding
 * - Strict clamping to ensure valid numeric scale factors
 */

export const POSTER_MASTER_WIDTH = 1080;
export const POSTER_MASTER_HEIGHT = 1350;
export const POSTER_ASPECT_RATIO = 4 / 5;
export const DEFAULT_CANVAS_PADDING = 16;
export const MIN_CANVAS_SCALE = 0.05;
export const MAX_CANVAS_SCALE = 2.0;

export interface ScaleCalculationInput {
  containerWidth: number;
  containerHeight: number;
  padding?: number;
  masterWidth?: number;
  masterHeight?: number;
}

export interface ScaleCalculationResult {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  padding: number;
  availableWidth: number;
  availableHeight: number;
}

/**
 * Computes uniform scale factor and reserved layout footprint for the master poster canvas.
 *
 * Per TDD page 28:
 * scale = Math.min((availableWidth - padding * 2) / masterWidth, (availableHeight - padding * 2) / masterHeight)
 * displayWidth = Math.round(masterWidth * scale)
 * displayHeight = Math.round(masterHeight * scale)
 */
export function calculateCanvasScale(input: ScaleCalculationInput): ScaleCalculationResult {
  const padding = typeof input.padding === "number" ? Math.max(0, input.padding) : DEFAULT_CANVAS_PADDING;
  const masterWidth = input.masterWidth ?? POSTER_MASTER_WIDTH;
  const masterHeight = input.masterHeight ?? POSTER_MASTER_HEIGHT;

  const availableWidth = Math.max(0, input.containerWidth - padding * 2);
  const availableHeight = Math.max(0, input.containerHeight - padding * 2);

  if (availableWidth <= 0 || availableHeight <= 0 || masterWidth <= 0 || masterHeight <= 0) {
    const fallbackScale = MIN_CANVAS_SCALE;
    return {
      scale: fallbackScale,
      displayWidth: Math.round(masterWidth * fallbackScale),
      displayHeight: Math.round(masterHeight * fallbackScale),
      padding,
      availableWidth,
      availableHeight,
    };
  }

  const rawScale = Math.min(availableWidth / masterWidth, availableHeight / masterHeight);
  // Clamp between safe bounds
  const scale = Math.max(MIN_CANVAS_SCALE, Math.min(MAX_CANVAS_SCALE, rawScale));

  const displayWidth = Math.round(masterWidth * scale);
  const displayHeight = Math.round(masterHeight * scale);

  return {
    scale,
    displayWidth,
    displayHeight,
    padding,
    availableWidth,
    availableHeight,
  };
}
