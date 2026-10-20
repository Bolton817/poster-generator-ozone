/**
 * Poster Export Service Boundary & Adapter Contracts
 *
 * Implements TDD Part II Section "Export service boundary" (Page 35),
 * Stage 07 POC & Stage 12 Multi-Format / Batch Packaging:
 * - Decouples rendering technology (html-to-image or server-side) from editor/preview state
 * - Provides strict typing for format, quality presets, result metadata, and diagnostic errors
 * - Supports batch weekly packaging contracts
 */

import { PosterDocument } from "../poster/schema";

export type ExportFormat = "png" | "jpeg";

export type JpegQualityPreset = "maximum" | "high" | "compact";

export interface ExportPresetOption {
  id: "png" | "jpeg-max" | "jpeg-high" | "jpeg-compact";
  format: ExportFormat;
  quality?: number;
  label: string;
  description: string;
  estimatedSize: string;
  isDefault?: boolean;
}

export const EXPORT_PRESETS: Record<ExportPresetOption["id"], ExportPresetOption> = {
  png: {
    id: "png",
    format: "png",
    label: "Master Lossless PNG",
    description: "Crisp vector text and graphics; best for official print & high-res screens.",
    estimatedSize: "~1.5 – 3.5 MB",
    isDefault: true,
  },
  "jpeg-max": {
    id: "jpeg-max",
    format: "jpeg",
    quality: 0.95,
    label: "Maximum Fidelity JPEG (95%)",
    description: "Minimal compression artifacts with reduced file size for social sharing.",
    estimatedSize: "~400 – 800 KB",
  },
  "jpeg-high": {
    id: "jpeg-high",
    format: "jpeg",
    quality: 0.85,
    label: "Social & WhatsApp JPEG (85%)",
    description: "Optimized for fast mobile messaging, statuses, and feed uploads.",
    estimatedSize: "~150 – 300 KB",
  },
  "jpeg-compact": {
    id: "jpeg-compact",
    format: "jpeg",
    quality: 0.75,
    label: "Compact Mobile JPEG (75%)",
    description: "Ultra-compact payload for low-bandwidth cellular environments.",
    estimatedSize: "~100 – 200 KB",
  },
};

export interface ExportOptions {
  /** Target image format. Default: "png" */
  format?: ExportFormat;
  /** JPEG quality compression factor between 0.1 and 1.0. Default: 0.95 */
  quality?: number;
  /** Custom output filename (without extension). If omitted, generated from document metadata */
  fileName?: string;
  /** Scaling multiplier for output canvas. Default 1.0 (exact master 1080x1350) */
  pixelRatio?: number;
  /** Optional timeout in milliseconds before failing. Default: 15000 */
  timeoutMs?: number;
}

export interface ExportResult {
  /** The generated binary Blob */
  blob: Blob;
  /** Fully sanitized filename including extension */
  fileName: string;
  /** Output pixel width (should equal master width, e.g. 1080) */
  width: number;
  /** Output pixel height (should equal master height, e.g. 1350) */
  height: number;
  /** Output MIME type ("image/png" | "image/jpeg") */
  mimeType: string;
  /** Exact binary size in bytes */
  byteSize: number;
  /** Time taken to rasterize in milliseconds */
  durationMs: number;
}

export type ExportErrorCode =
  | "TARGET_NOT_FOUND"
  | "DIMENSION_MISMATCH"
  | "FONTS_NOT_READY"
  | "RASTERIZE_FAILED"
  | "TIMEOUT"
  | "CORRUPT_OUTPUT";

export class ExportError extends Error {
  readonly code: ExportErrorCode;
  readonly details?: unknown;

  constructor(message: string, code: ExportErrorCode, details?: unknown) {
    super(message);
    this.name = "ExportError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Interface that all export implementations must satisfy.
 */
export interface PosterExporter {
  rasterize(element: HTMLElement, options?: ExportOptions): Promise<ExportResult>;
}

/**
 * Batch packaging definitions
 */
export interface BatchExportItem {
  id: string;
  title: string;
  templateId: string;
  dayLabel: string;
  document: PosterDocument;
}

export type BatchPhase = "idle" | "rendering" | "zipping" | "complete" | "error";

export interface BatchExportProgress {
  total: number;
  current: number;
  currentTitle: string;
  dayLabel: string;
  phase: BatchPhase;
  percent: number;
  errorMsg?: string;
}

export interface BatchExportResult {
  zipBlob: Blob;
  fileName: string;
  totalFiles: number;
  byteSize: number;
  durationMs: number;
}
