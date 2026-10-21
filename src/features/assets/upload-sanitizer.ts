import path from "path";

/**
 * Validates that binary header bytes match the declared image format.
 * Prevents MIME-spoofing attacks (e.g. uploading an executable disguised as image/jpeg).
 */
export function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  if (mimeType === "image/jpeg") {
    // JPEG magic bytes: FF D8 FF
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

/**
 * Sanitizes an uploaded filename to prevent directory traversal,
 * control character injection, and null byte exploits.
 */
export function sanitizeFilename(rawName: string): string {
  // Remove null bytes and control chars
  let cleaned = rawName.replace(/[\x00-\x1f\x7f]/g, "");
  // Remove directory traversal characters
  cleaned = cleaned.replace(/\.\.+[/\\]/g, "");
  // Take only the basename
  cleaned = path.basename(cleaned);
  // Keep only safe characters: alphanumeric, dash, underscore, dot
  cleaned = cleaned.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Ensure non-empty
  if (!cleaned || cleaned === ".") {
    cleaned = `upload_${Date.now()}.bin`;
  }
  // Cap length
  if (cleaned.length > 100) {
    const ext = path.extname(cleaned);
    const base = path.basename(cleaned, ext).slice(0, 90);
    cleaned = `${base}${ext}`;
  }
  return cleaned;
}
