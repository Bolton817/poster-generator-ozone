/**
 * Canonical Poster Editor Reducer
 *
 * Implements TDD Stage 08 (Pages 74-75):
 * - Pure immutable state updates
 * - Clear separation: transient UI state (activeSection, activeField) NEVER dirties or mutates document
 * - Real-time dirty detection via baseline comparison
 * - Automatic validation warning recalculation
 */

import { PosterDocument } from "../poster/schema";
import { EditorAction, EditorState } from "./types";
import { validatePosterDocument } from "./validation";

function areDocumentsEqual(a: PosterDocument, b: PosterDocument): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function createInitialEditorState(
  initialDocument: PosterDocument,
  defaultSection: string | null = "event"
): EditorState {
  const clonedDoc = JSON.parse(JSON.stringify(initialDocument)) as PosterDocument;
  return {
    document: clonedDoc,
    initialDocument: JSON.parse(JSON.stringify(initialDocument)) as PosterDocument,
    isDirty: false,
    warnings: validatePosterDocument(clonedDoc),
    activeSection: defaultSection,
    activeField: null,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  let nextDoc: PosterDocument = state.document;

  switch (action.type) {
    case "SET_TITLE": {
      nextDoc = {
        ...state.document,
        content: {
          ...state.document.content,
          eventTitle: action.title,
        },
      };
      break;
    }

    case "SET_DRAFT_NAME": {
      nextDoc = {
        ...state.document,
        name: action.name,
      };
      break;
    }

    case "SET_CONTENT_FIELD": {
      nextDoc = {
        ...state.document,
        content: {
          ...state.document.content,
          [action.field]: action.value,
        },
      };
      break;
    }

    case "ADD_LINEUP_ITEM": {
      const field = action.role === "dj" ? "djNames" : "hostNames";
      const currentList = state.document.content[field];
      nextDoc = {
        ...state.document,
        content: {
          ...state.document.content,
          [field]: [...currentList, action.name],
        },
      };
      break;
    }

    case "REMOVE_LINEUP_ITEM": {
      const field = action.role === "dj" ? "djNames" : "hostNames";
      const currentList = state.document.content[field];
      nextDoc = {
        ...state.document,
        content: {
          ...state.document.content,
          [field]: currentList.filter((_, idx) => idx !== action.index),
        },
      };
      break;
    }

    case "UPDATE_LINEUP_ITEM": {
      const field = action.role === "dj" ? "djNames" : "hostNames";
      const currentList = [...state.document.content[field]];
      if (action.index >= 0 && action.index < currentList.length) {
        currentList[action.index] = action.name;
        nextDoc = {
          ...state.document,
          content: {
            ...state.document.content,
            [field]: currentList,
          },
        };
      }
      break;
    }

    case "SET_PALETTE": {
      nextDoc = {
        ...state.document,
        styling: {
          ...state.document.styling,
          paletteId: action.paletteId,
        },
      };
      break;
    }

    case "SET_TYPOGRAPHY_PRESET": {
      nextDoc = {
        ...state.document,
        styling: {
          ...state.document.styling,
          typographyPresetId: action.presetId,
        },
      };
      break;
    }

    case "SET_LAYOUT_OPTION": {
      nextDoc = {
        ...state.document,
        styling: {
          ...state.document.styling,
          layoutOptionId: action.optionId,
        },
      };
      break;
    }

    case "SET_ASSET": {
      if (action.slot === "logo") {
        nextDoc = {
          ...state.document,
          assets: { ...state.document.assets, logoAssetId: action.assetId },
        };
      } else if (action.slot === "background") {
        nextDoc = {
          ...state.document,
          assets: { ...state.document.assets, backgroundAssetId: action.assetId },
        };
      } else if (action.slot === "secondary") {
        nextDoc = {
          ...state.document,
          assets: {
            ...state.document.assets,
            secondaryAssetIds: action.assetId ? [action.assetId] : [],
          },
        };
      }
      break;
    }

    case "SET_FOCAL_POINT": {
      const currentPoints = state.document.styling.focalPoints || {};
      nextDoc = {
        ...state.document,
        styling: {
          ...state.document.styling,
          focalPoints: {
            ...currentPoints,
            [action.slot]: action.point,
          },
        },
      };
      break;
    }

    case "SET_DECORATION_OPTION": {
      nextDoc = {
        ...state.document,
        styling: {
          ...state.document.styling,
          decorationOptions: {
            ...state.document.styling.decorationOptions,
            [action.key]: action.value,
          },
        },
      };
      break;
    }

    // Transient UI Actions (DO NOT alter document or dirty state)
    case "SET_ACTIVE_SECTION": {
      return {
        ...state,
        activeSection: action.sectionId,
      };
    }

    case "SET_ACTIVE_FIELD": {
      return {
        ...state,
        activeField: action.fieldName,
      };
    }

    // Lifecycle Actions
    case "RESET_TO_DEFAULTS": {
      const resetDoc = JSON.parse(JSON.stringify(state.initialDocument)) as PosterDocument;
      return {
        ...state,
        document: resetDoc,
        isDirty: false,
        warnings: validatePosterDocument(resetDoc),
      };
    }

    case "LOAD_DOCUMENT": {
      const loadedDoc = JSON.parse(JSON.stringify(action.document)) as PosterDocument;
      return {
        ...state,
        document: loadedDoc,
        initialDocument: JSON.parse(JSON.stringify(action.document)) as PosterDocument,
        isDirty: false,
        warnings: validatePosterDocument(loadedDoc),
      };
    }

    case "MARK_SAVED": {
      return {
        ...state,
        initialDocument: JSON.parse(JSON.stringify(state.document)) as PosterDocument,
        isDirty: false,
      };
    }

    default:
      return state;
  }

  // Calculate dirty flag & warnings for document-modifying actions
  const isDirty = !areDocumentsEqual(nextDoc, state.initialDocument);
  const warnings = validatePosterDocument(nextDoc);

  return {
    ...state,
    document: nextDoc,
    isDirty,
    warnings,
  };
}
