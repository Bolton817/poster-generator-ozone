/**
 * Export Utility Helpers: Filename Sanitization, Blob Downloads, Web Share & Dimension Inspection
 */

import { ExportFormat, ExportResult, JpegQualityPreset } from "./types";

export interface FileNameParams {
  day?: string;
  templateName?: string;
  eventTitle?: string;
  format?: ExportFormat;
}

/**
 * Generates a clean, sanitized poster export filename according to Production Decision 09:
 * Ozone-Lounge-[Day]-[Template]-[Title].[ext]
 */
export function generatePosterFileName({
  day = "Event",
  templateName = "Template",
  eventTitle = "Poster",
  format = "png",
}: FileNameParams): string {
  const sanitize = (text: string): string => {
    return text
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const sDay = sanitize(day) || "Event";
  const sTemplate = sanitize(templateName) || "Template";
  const sTitle = sanitize(eventTitle) || "Poster";
  const ext = format === "jpeg" ? "jpg" : "png";

  return `Ozone-Lounge-${sDay}-${sTemplate}-${sTitle}.${ext}`;
}

/**
 * Generates a standardized batch weekly zip archive filename:
 * Ozone-Lounge-Weekly-Posters-YYYY-MM-DD.zip
 */
export function generateBatchZipFileName(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `Ozone-Lounge-Weekly-Posters-${yyyy}-${mm}-${dd}.zip`;
}

/**
 * Maps a JPEG quality preset to a numeric compression factor (0.1 - 1.0).
 */
export function getQualityForPreset(preset: JpegQualityPreset): number {
  switch (preset) {
    case "maximum":
      return 0.95;
    case "high":
      return 0.85;
    case "compact":
      return 0.75;
    default:
      return 0.95;
  }
}

/**
 * Triggers a client-side browser file download from a Blob with safe URL revocation.
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  if (typeof window === "undefined") return;

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    // Revoke object URL after a short delay so mobile browser download managers can complete read
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 2000);
  }
}

/**
 * Checks if the W3C Web Share API is available and capable of sharing files on this device.
 */
export function canWebShareFiles(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") {
    return false;
  }

  try {
    // Test with a dummy file representation
    const testFile = new File(["test"], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Attempts to share the exported poster using the native mobile share sheet (WhatsApp, Stories, AirDrop).
 * If the Web Share API is not supported, cancelled, or fails, gracefully falls back to downloading the file.
 */
export async function shareOrDownloadPoster(
  result: ExportResult,
  title?: string
): Promise<"shared" | "downloaded"> {
  if (typeof window === "undefined") {
    return "downloaded";
  }

  if (canWebShareFiles()) {
    try {
      const file = new File([result.blob], result.fileName, {
        type: result.mimeType,
      });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title || result.fileName,
          text: `Ozone Lounge Event Poster — ${title || result.fileName}`,
        });
        return "shared";
      }
    } catch (err: unknown) {
      // User cancellation (AbortError) should not trigger fallback download
      if (err instanceof Error && err.name === "AbortError") {
        return "shared";
      }
      console.warn("[shareOrDownloadPoster] Web Share API failed, falling back to download:", err);
    }
  }

  // Fallback: standard browser file download
  triggerBlobDownload(result.blob, result.fileName);
  return "downloaded";
}

/**
 * Inspects a client-side Blob to verify its decoded raster dimensions.
 */
export function inspectBlobDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("inspectBlobDimensions is only available in browser environments"));
      return;
    }

    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const result = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image blob for dimension inspection"));
    };

    img.src = url;
  });
}
