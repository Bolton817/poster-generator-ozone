import { ImageSlotKey, ImageSlotPolicy } from "./types";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const IMAGE_SLOT_POLICIES: Record<ImageSlotKey, ImageSlotPolicy> = {
  heroBackground: {
    key: "heroBackground",
    label: "Hero Background Image",
    description: "Main atmospheric background or performer visual (4:5 portrait)",
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxSizeBytes: MAX_UPLOAD_SIZE_BYTES,
    recommendedWidth: 1080,
    recommendedHeight: 1350,
    isRequired: true,
  },
  logo: {
    key: "logo",
    label: "Lounge Brand Logo",
    description: "Official transparent Ozone Lounge brand mark",
    allowedMimeTypes: ["image/png", "image/webp"],
    maxSizeBytes: 5 * 1024 * 1024,
    recommendedWidth: 400,
    recommendedHeight: 160,
    isRequired: true,
  },
  secondaryImage: {
    key: "secondaryImage",
    label: "Secondary Visual",
    description: "Performer headshot, cocktail badge, or stage microphone detail",
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxSizeBytes: 5 * 1024 * 1024,
    recommendedWidth: 600,
    recommendedHeight: 600,
    isRequired: false,
  },
  texture: {
    key: "texture",
    label: "Overlay Texture",
    description: "Vinyl groove, film grain, or lighting flare overlay",
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    maxSizeBytes: 5 * 1024 * 1024,
    recommendedWidth: 1080,
    recommendedHeight: 1350,
    isRequired: false,
  },
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates a client-side File against a slot's security and dimension policy.
 */
export function validateFileForSlot(file: File, slotKey: ImageSlotKey): FileValidationResult {
  const policy = IMAGE_SLOT_POLICIES[slotKey];
  if (!policy) {
    return { valid: false, error: `Unknown image slot: "${slotKey}"` };
  }

  // 1. MIME Type Check
  if (!policy.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type || "unknown"}". Allowed formats: JPEG, PNG, WebP.`,
    };
  }

  // 2. File Size Check
  if (file.size > policy.maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = (policy.maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is ${limitMb} MB.`,
    };
  }

  return { valid: true };
}
