if (typeof window !== "undefined") {
  throw new Error("Storage service cannot be imported in client-side code.");
}
import { StorageService } from "./types";
import { LocalFileStorageService } from "./local-storage";

function createStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "local":
    default:
      return new LocalFileStorageService();
  }
}

export const storageService = createStorageService();
export * from "./types";
