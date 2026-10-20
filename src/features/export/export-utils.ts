/**
 * Export Utility Helpers: Filename Sanitization, Blob Downloads & Dimension Inspection
 */

import { ExportFormat } from "./types";

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
