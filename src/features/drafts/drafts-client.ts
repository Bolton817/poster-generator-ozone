/**
 * Client-Side API Helper for Poster Drafts
 *
 * Implements Stage 11 draft lifecycle operations:
 * - listDrafts, getDraft, createDraft, updateDraft, deleteDraft, duplicateDraft
 */

import {
  DraftSummary,
  DraftDetail,
  CreateDraftPayload,
  UpdateDraftPayload,
} from "./types";

export class DraftApiError extends Error {
  code: string;
  issues?: unknown;

  constructor(message: string, code = "DRAFT_API_ERROR", issues?: unknown) {
    super(message);
    this.name = "DraftApiError";
    this.code = code;
    this.issues = issues;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    throw new DraftApiError(`Server error (${res.status}): Non-JSON response`, "NON_JSON_RESPONSE");
  }

  if (!res.ok || !data.ok) {
    const errorInfo = (data.error || {}) as { message?: string; code?: string; issues?: unknown };
    throw new DraftApiError(
      errorInfo.message || `Request failed with status ${res.status}`,
      errorInfo.code || `HTTP_${res.status}`,
      errorInfo.issues
    );
  }

  return data as unknown as T;
}

export async function listDrafts(): Promise<DraftSummary[]> {
  const res = await fetch("/api/drafts", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = await handleResponse<{ ok: boolean; drafts: DraftSummary[] }>(res);
  return data.drafts;
}

export async function getDraft(draftId: string): Promise<DraftDetail> {
  const res = await fetch(`/api/drafts/${draftId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = await handleResponse<{ ok: boolean; draft: DraftDetail }>(res);
  return data.draft;
}

export async function createDraft(payload: CreateDraftPayload): Promise<DraftDetail> {
  const res = await fetch("/api/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ ok: boolean; draft: DraftDetail }>(res);
  return data.draft;
}

export async function updateDraft(
  draftId: string,
  payload: UpdateDraftPayload
): Promise<DraftDetail> {
  const res = await fetch(`/api/drafts/${draftId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ ok: boolean; draft: DraftDetail }>(res);
  return data.draft;
}

export async function deleteDraft(draftId: string): Promise<boolean> {
  const res = await fetch(`/api/drafts/${draftId}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  const data = await handleResponse<{ ok: boolean; message: string }>(res);
  return data.ok;
}

export async function duplicateDraft(draftId: string): Promise<DraftDetail> {
  const res = await fetch(`/api/drafts/${draftId}/duplicate`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const data = await handleResponse<{ ok: boolean; draft: DraftDetail }>(res);
  return data.draft;
}
