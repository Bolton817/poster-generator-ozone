if (typeof window !== "undefined") {
  throw new Error("LocalFileStorageService cannot be imported in client-side code.");
}
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { StorageService, StorageUploadResult } from "./types";

export class LocalFileStorageService implements StorageService {
  private uploadDir: string;
  private publicPrefix: string;

  constructor(uploadDir?: string, publicPrefix: string = "/uploads") {
    this.uploadDir = uploadDir || path.join(process.cwd(), "public", "uploads");
    this.publicPrefix = publicPrefix;
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (err) {
      console.error("[LocalStorage] Failed to create upload directory:", err);
    }
  }

  async upload(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    _userId: string
  ): Promise<StorageUploadResult> {
    void _userId;
    await this.ensureDir();

    // Sanitize extension from MIME type or original filename
    const ext = this.getExtension(originalFilename, mimeType);
    const randomKey = `${crypto.randomUUID()}${ext}`;
    const destinationPath = path.join(this.uploadDir, randomKey);

    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `${this.publicPrefix}/${randomKey}`;

    return {
      storageKey: randomKey,
      publicUrl,
      byteSize: buffer.length,
    };
  }

  async delete(storageKey: string): Promise<void> {
    // Prevent directory traversal attacks
    const safeKey = path.basename(storageKey);
    const targetPath = path.join(this.uploadDir, safeKey);

    try {
      await fs.unlink(targetPath);
    } catch (err) {
      // If already deleted or missing, resolve gracefully
      console.warn(`[LocalStorage] File ${safeKey} could not be unlinked:`, err);
    }
  }

  getUrl(storageKey: string): string {
    const safeKey = path.basename(storageKey);
    return `${this.publicPrefix}/${safeKey}`;
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
