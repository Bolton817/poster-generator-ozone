/**
 * Poster Exporter Adapter (html-to-image implementation)
 *
 * Implements TDD Page 35 & 72:
 * - Rasterizes the unscaled master canvas (1080x1350)
 * - Strips viewport CSS scaling transforms
 * - Excludes app chrome or elements marked with data-export-ignore="true"
 * - Verifies font readiness before rasterization
 * - Returns structured ExportResult with Blob, dimensions, MIME, and duration
 */

import { toBlob } from "html-to-image";
import { POSTER_MASTER_WIDTH, POSTER_MASTER_HEIGHT } from "../canvas/constants";
import { generatePosterFileName } from "./export-utils";
import {
  PosterExporter,
  ExportOptions,
  ExportResult,
  ExportError,
} from "./types";

export class HtmlToImagePosterExporter implements PosterExporter {
  async rasterize(
    element: HTMLElement,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();

    if (!element) {
      throw new ExportError(
        "Target element for poster rasterization was not provided or not mounted",
        "TARGET_NOT_FOUND"
      );
    }

    // Preflight: Ensure fonts in document are loaded
    if (typeof window !== "undefined" && "fonts" in document) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn("[PosterExporter] Font readiness wait warning:", fontErr);
      }
    }

    const format = options.format ?? "png";
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = options.quality ?? 0.95;
    const pixelRatio = options.pixelRatio ?? 1;
    const width = POSTER_MASTER_WIDTH;
    const height = POSTER_MASTER_HEIGHT;

    const fileName =
      options.fileName ??
      generatePosterFileName({
        format,
        eventTitle: "Poster",
      });

    // Timeout guard
    const timeoutMs = options.timeoutMs ?? 20000;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new ExportError(
            `Poster rasterization timed out after ${timeoutMs}ms`,
            "TIMEOUT"
          )
        );
      }, timeoutMs);
    });

    const rasterizePromise = (async (): Promise<Blob> => {
      try {
        const blob = await toBlob(element, {
          width,
          height,
          canvasWidth: width,
          canvasHeight: height,
          pixelRatio,
          type: mimeType,
          quality: format === "jpeg" ? quality : undefined,
          style: {
            transform: "none",
            transformOrigin: "0 0",
            margin: "0",
            left: "0",
            top: "0",
          },
          filter: (node: HTMLElement) => {
            // Exclude anything marked for omission during export
            if (node.dataset && node.dataset.exportIgnore === "true") {
              return false;
            }
            return true;
          },
        });

        if (!blob || blob.size === 0) {
          throw new ExportError(
            "Rasterization resulted in an empty (0 byte) image blob",
            "CORRUPT_OUTPUT"
          );
        }

        return blob;
      } catch (err: unknown) {
        if (err instanceof ExportError) {
          throw err;
        }
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new ExportError(
          `Failed to rasterize poster canvas: ${errorMsg}`,
          "RASTERIZE_FAILED",
          err
        );
      }
    })();

    try {
      const blob = await Promise.race([rasterizePromise, timeoutPromise]);
      const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();

      return {
        blob,
        fileName,
        width,
        height,
        mimeType,
        byteSize: blob.size,
        durationMs: Math.round(endTime - startTime),
      };
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }
}

/**
 * Singleton instance of the default exporter adapter.
 */
export const posterExporter: PosterExporter = new HtmlToImagePosterExporter();
