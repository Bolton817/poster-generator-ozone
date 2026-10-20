"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ImageSlotKey, LocalPreviewState, UploadedMediaAsset } from "./types";
import { validateFileForSlot } from "./slot-policy";

interface UseImageUploadReturn {
  state: LocalPreviewState;
  handleFileSelect: (file: File, slotKey: ImageSlotKey) => Promise<UploadedMediaAsset | null>;
  reset: () => void;
  isDurable: boolean;
}

export function useImageUpload(initialDurableUrl: string | null = null, initialAssetId: string | null = null): UseImageUploadReturn {
  const [state, setState] = useState<LocalPreviewState>({
    file: null,
    objectUrl: null,
    durableUrl: initialDurableUrl,
    assetId: initialAssetId,
    isUploading: false,
    error: null,
  });

  const activeBlobUrlRef = useRef<string | null>(null);

  const cleanupBlob = useCallback(() => {
    if (activeBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      } catch {
        // Ignore revocation errors
      }
      activeBlobUrlRef.current = null;
    }
  }, []);

  // Ensure blob cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupBlob();
    };
  }, [cleanupBlob]);

  const reset = useCallback(() => {
    cleanupBlob();
    setState({
      file: null,
      objectUrl: null,
      durableUrl: null,
      assetId: null,
      isUploading: false,
      error: null,
    });
  }, [cleanupBlob]);

  const handleFileSelect = async (
    file: File,
    slotKey: ImageSlotKey
  ): Promise<UploadedMediaAsset | null> => {
    // 1. Client-Side Preflight Validation
    const validation = validateFileForSlot(file, slotKey);
    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        error: validation.error || "File validation failed.",
      }));
      return null;
    }

    // 2. Revoke previous blob URL if any
    cleanupBlob();

    // 3. Generate new Object URL for zero-latency preview
    const newBlobUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = newBlobUrl;

    setState({
      file,
      objectUrl: newBlobUrl,
      durableUrl: null, // Pending upload
      assetId: null,
      isUploading: true,
      error: null,
    });

    // 4. Perform Background Upload
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slotKey", slotKey);

      const response = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error?.message || `Upload failed with status ${response.status}`);
      }

      const mediaAsset: UploadedMediaAsset = result.data;

      setState({
        file,
        objectUrl: newBlobUrl,
        durableUrl: mediaAsset.publicUrl,
        assetId: mediaAsset.id,
        isUploading: false,
        error: null,
      });

      return mediaAsset;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload asset.";
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      return null;
    }
  };

  return {
    state,
    handleFileSelect,
    reset,
    isDurable: Boolean(state.durableUrl && state.assetId && !state.isUploading),
  };
}
