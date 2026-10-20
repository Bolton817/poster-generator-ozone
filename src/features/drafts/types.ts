/**
 * Stage 11: Draft Persistence & Management Types
 *
 * Implements Blueprint Section 8.3 & Decision 08:
 * - Owner-scoped drafts (userId = session.user.id)
 * - Serialized canonical PosterDocument JSON
 */

import { PosterDocument } from "../poster/schema";

export interface DraftSummary {
  id: string;
  name: string;
  templateId: string;
  templateVersion: number;
  schemaVersion: number;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftDetail extends DraftSummary {
  document: PosterDocument;
}

export interface CreateDraftPayload {
  name: string;
  templateId: string;
  templateVersion?: number;
  schemaVersion?: number;
  document: PosterDocument;
  thumbnailUrl?: string | null;
}

export interface UpdateDraftPayload {
  name?: string;
  document: PosterDocument;
  thumbnailUrl?: string | null;
}

export type AutoSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface AutoSaveState {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
}
