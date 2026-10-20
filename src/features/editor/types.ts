/**
 * Editor State & Action Type Definitions
 *
 * Implements TDD Stage 08 (Pages 74-75):
 * - Strongly typed actions for content, palette, typography, assets, and focal points
 * - Clear boundary separating persistent PosterDocument from transient UI state
 * - Non-blocking validation warning contracts
 */

import {
  PosterDocument,
  PosterContent,
  FocalPoint,
} from "../poster/schema";

export interface ValidationWarning {
  field: string;
  message: string;
  severity: "warning" | "info";
}

export type EditorAction =
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_DRAFT_NAME"; name: string }
  | { type: "SET_CONTENT_FIELD"; field: keyof PosterContent; value: string | string[] }
  | { type: "ADD_LINEUP_ITEM"; role: "dj" | "host"; name: string }
  | { type: "REMOVE_LINEUP_ITEM"; role: "dj" | "host"; index: number }
  | { type: "UPDATE_LINEUP_ITEM"; role: "dj" | "host"; index: number; name: string }
  | { type: "SET_PALETTE"; paletteId: string }
  | { type: "SET_TYPOGRAPHY_PRESET"; presetId: string }
  | { type: "SET_LAYOUT_OPTION"; optionId: string }
  | { type: "SET_ASSET"; slot: "logo" | "background" | "secondary"; assetId: string | null }
  | { type: "SET_FOCAL_POINT"; slot: string; point: FocalPoint }
  | { type: "SET_DECORATION_OPTION"; key: string; value: string | number | boolean }
  | { type: "SET_ACTIVE_SECTION"; sectionId: string | null }
  | { type: "SET_ACTIVE_FIELD"; fieldName: string | null }
  | { type: "RESET_TO_DEFAULTS" }
  | { type: "LOAD_DOCUMENT"; document: PosterDocument }
  | { type: "MARK_SAVED" };

export interface EditorState {
  /** The canonical serializable poster design state */
  document: PosterDocument;
  /** Baseline document snapshot used to calculate dirty state */
  initialDocument: PosterDocument;
  /** True if current document diverges from initialDocument */
  isDirty: boolean;
  /** Active validation warnings & character guidance */
  warnings: ValidationWarning[];
  /** Transient UI: ID of currently expanded accordion section */
  activeSection: string | null;
  /** Transient UI: name of currently focused field */
  activeField: string | null;
}
