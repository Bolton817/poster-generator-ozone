if (typeof window !== "undefined") {
  throw new Error("Storage service cannot be imported in client-side code.");
}
import { StorageService } from "./types";
import { LocalFileStorageService } from "./local-storage";
import { SupabaseStorageService } from "./supabase-storage";
import { logger } from "@/lib/logger";

function createStorageService(): StorageService {
  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  switch (provider) {
    case "supabase": {
      const supabaseStorage = new SupabaseStorageService();
      if (!supabaseStorage.isConfigured()) {
        logger.warn(
          "storage",
          "STORAGE_PROVIDER=supabase requested but credentials are missing. Falling back to local storage.",
          { provider }
        );
        return new LocalFileStorageService();
      }
      return supabaseStorage;
    }
    case "local":
    default:
      return new LocalFileStorageService();
  }
}

export const storageService = createStorageService();
export { LocalFileStorageService } from "./local-storage";
export { SupabaseStorageService } from "./supabase-storage";
export * from "./types";
