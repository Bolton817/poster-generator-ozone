export interface StorageUploadResult {
  storageKey: string;
  publicUrl: string;
  byteSize: number;
}

export interface StorageService {
  upload(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    userId: string
  ): Promise<StorageUploadResult>;
  delete(storageKey: string): Promise<void>;
  getUrl(storageKey: string): string;
}
