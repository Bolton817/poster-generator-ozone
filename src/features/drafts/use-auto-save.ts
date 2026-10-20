"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PosterDocument } from "@/features/poster/schema";
import { DraftDetail, AutoSaveStatus } from "./types";
import { createDraft, updateDraft } from "./drafts-client";

export interface UseAutoSaveOptions {
  document: PosterDocument;
  isDirty: boolean;
  initialDraftId?: string | null;
  debounceMs?: number;
  onDraftCreated?: (draft: DraftDetail) => void;
  onSaveSuccess?: (draft: DraftDetail) => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  document,
  isDirty,
  initialDraftId = null,
  debounceMs = 2000,
  onDraftCreated,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [status, setStatus] = useState<AutoSaveStatus>(
    initialDraftId ? "saved" : "idle"
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialDraftId ? new Date() : null
  );
  const [error, setError] = useState<string | null>(null);

  const isSavingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const docRef = useRef(document);
  docRef.current = document;

  const saveNow = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setStatus("saving");
    setError(null);

    const docToSave = docRef.current;

    try {
      if (draftId) {
        // Update existing draft
        const updated = await updateDraft(draftId, {
          name: docToSave.name || `${docToSave.content.dayLabel} Poster`,
          document: docToSave,
        });
        setLastSavedAt(new Date());
        setStatus("saved");
        setError(null);
        onSaveSuccess?.(updated);
      } else {
        // Create initial draft record
        const created = await createDraft({
          name: docToSave.name || `${docToSave.content.dayLabel} Poster`,
          templateId: docToSave.templateId,
          document: docToSave,
        });
        setDraftId(created.id);
        setLastSavedAt(new Date());
        setStatus("saved");
        setError(null);
        onDraftCreated?.(created);
        onSaveSuccess?.(created);
      }
    } catch (err: unknown) {
      console.error("[useAutoSave] Save error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setError(msg);
      onSaveError?.(err instanceof Error ? err : new Error(msg));
    } finally {
      isSavingRef.current = false;
    }
  }, [draftId, onDraftCreated, onSaveSuccess, onSaveError]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isDirty) return;

    setStatus("dirty");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [document, isDirty, debounceMs, saveNow]);

  return {
    draftId,
    status,
    lastSavedAt,
    error,
    saveNow,
    isSaving: status === "saving",
  };
}
