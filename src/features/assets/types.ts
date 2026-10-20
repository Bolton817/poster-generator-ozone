export type ImageSlotKey = "heroBackground" | "logo" | "secondaryImage" | "texture";

export interface ImageSlotPolicy {
  key: ImageSlotKey;
  label: string;
  description: string;
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  recommendedWidth: number;
  recommendedHeight: number;
  isRequired: boolean;
}

export interface UploadedMediaAsset {
  id: string;
  storageKey: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  userId: string;
  createdAt: Date | string;
}

export interface LocalPreviewState {
  file: File | null;
  objectUrl: string | null;
  durableUrl: string | null;
  assetId: string | null;
  isUploading: boolean;
  error: string | null;
}
