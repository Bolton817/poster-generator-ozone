if (typeof window !== "undefined") {
  throw new Error("SupabaseStorageService cannot be imported in client-side code.");
}
import crypto from "crypto";
import path from "path";
import { StorageService, StorageUploadResult } from "./types";
import { logger } from "@/lib/logger";

export interface SupabaseStorageConfig {
  supabaseUrl?: string;
  serviceRoleKey?: string;
  bucketName?: string;
}

export class SupabaseStorageService implements StorageService {
  private supabaseUrl: string;
  private serviceRoleKey: string;
  private bucketName: string;

  constructor(config?: SupabaseStorageConfig) {
    this.supabaseUrl = (
      config?.supabaseUrl ||
      process.env.SUPABASE_URL ||
      ""
    ).replace(/\/+$/, "");
    this.serviceRoleKey =
      config?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    this.bucketName =
      config?.bucketName || process.env.STORAGE_BUCKET || "ozone-poster-assets";
  }

  isConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.serviceRoleKey);
  }

  async upload(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    userId: string
  ): Promise<StorageUploadResult> {
    if (!this.isConfigured()) {
      throw new Error(
        "Supabase Storage is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
      );
    }

    const ext = this.getExtension(originalFilename, mimeType);
    const safeKey = `${userId}/${crypto.randomUUID()}${ext}`;

    const uploadEndpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${safeKey}`;

    try {
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          "Content-Type": mimeType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Supabase storage upload failed (HTTP ${response.status}): ${errorText}`
        );
      }

      const publicUrl = this.getUrl(safeKey);

      logger.info("storage", "File successfully uploaded to Supabase Storage", {
        bucket: this.bucketName,
        storageKey: safeKey,
        byteSize: buffer.length,
        userId,
      });

      return {
        storageKey: safeKey,
        publicUrl,
        byteSize: buffer.length,
      };
    } catch (err) {
      logger.error("storage", "Failed to upload file to Supabase Storage", err, {
        bucket: this.bucketName,
        storageKey: safeKey,
        userId,
      });
      throw err;
    }
  }

  async delete(storageKey: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error(
        "Supabase Storage is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
      );
    }

    const deleteEndpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}`;

    try {
      const response = await fetch(deleteEndpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefixes: [storageKey],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Supabase storage delete failed (HTTP ${response.status}): ${errorText}`
        );
      }

      logger.info("storage", "File deleted from Supabase Storage", {
        bucket: this.bucketName,
        storageKey,
      });
    } catch (err) {
      logger.error("storage", "Failed to delete file from Supabase Storage", err, {
        bucket: this.bucketName,
        storageKey,
      });
      throw err;
    }
  }

  getUrl(storageKey: string): string {
    if (!this.supabaseUrl) {
      return `/storage-placeholder/${storageKey}`;
    }
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storageKey}`;
  }

  private getExtension(fileName: string, mimeType: string): string {
    const ext = path.extname(fileName).toLowerCase();
    if (ext && [".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return ext;
    }

    switch (mimeType) {
      case "image/jpeg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/webp":
        return ".webp";
      default:
        return ".bin";
    }
  }
}
