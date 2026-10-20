/**
 * Poster Export Service Boundary & Adapter Contracts
 *
 * Implements TDD Part II Section "Export service boundary" (Page 35) & Stage 07 POC:
 * - Decouples rendering technology (html-to-image or server-side) from editor/preview state
 * - Provides strict typing for format, quality, result metadata, and diagnostic errors
 */

export type ExportFormat = "png" | "jpeg";

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
