/**
 * Stage 08 Test Suite: Shared Editor State & Mobile Control Framework
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-editor-framework.ts
 *
 * Verifies:
 * 1. Reducer action immutability and document state updates
 * 2. Transient UI state separation (activeSection, activeField never dirty document)
 * 3. Dirty state lifecycle (initial clean -> edited dirty -> reset clean)
 * 4. Validation rules & non-blocking text guidance (long copy, focal points, Friday empty offer)
 * 5. Full serialization invariance through PosterDocumentSchema
 */

import {
  createDefaultPosterDocument,
  getTemplateById,
} from "../src/features/templates/registry";
import {
  editorReducer,
  createInitialEditorState,
} from "../src/features/editor/editor-reducer";
import { validatePosterDocument } from "../src/features/editor/validation";
import { PosterDocumentSchema } from "../src/features/poster/schema";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
  }
}

console.log("\n========================================================");
console.log("  STAGE 08: SHARED EDITOR STATE & CONTROLS TEST SUITE");
console.log("========================================================\n");

// -----------------------------------------------------------
// Suite 1: Reducer Action Immutability & Document Updates
// -----------------------------------------------------------
console.log("Suite 1: Reducer Action Immutability & Document Updates");

const reddingtonDoc = createDefaultPosterDocument("reddington");
let state = createInitialEditorState(reddingtonDoc, "event");

assert(
  state.isDirty === false,
  "Initial editor state is clean (isDirty === false)"
);

assert(
  state.activeSection === "event",
  "Default active section set to 'event'"
);

// 1.1 SET_TITLE
state = editorReducer(state, {
  type: "SET_TITLE",
  title: "Updated Sunset Classics",
});

assert(
  state.document.content.eventTitle === "Updated Sunset Classics",
  "SET_TITLE updates eventTitle in document"
);
assert(state.isDirty === true, "SET_TITLE flags state as dirty");
assert(
  state.initialDocument.content.eventTitle !== "Updated Sunset Classics",
  "SET_TITLE preserves initialDocument immutably"
);

// 1.2 Lineup Actions (Separate DJ and Host Roles)
state = editorReducer(state, {
  type: "ADD_LINEUP_ITEM",
  role: "dj",
  name: "DJ Sunset",
});
assert(
  state.document.content.djNames.includes("DJ Sunset"),
  "ADD_LINEUP_ITEM adds DJ to djNames"
);

state = editorReducer(state, {
  type: "ADD_LINEUP_ITEM",
  role: "host",
  name: "Host Sarah",
});
assert(
  state.document.content.hostNames.includes("Host Sarah"),
  "ADD_LINEUP_ITEM adds Host to hostNames without mixing roles"
);

const djIdx = state.document.content.djNames.indexOf("DJ Sunset");
state = editorReducer(state, {
  type: "UPDATE_LINEUP_ITEM",
  role: "dj",
  index: djIdx,
  name: "DJ Sunset Deluxe",
});
assert(
  state.document.content.djNames[djIdx] === "DJ Sunset Deluxe",
  "UPDATE_LINEUP_ITEM updates specific performer by index"
);

state = editorReducer(state, {
  type: "REMOVE_LINEUP_ITEM",
  role: "dj",
  index: djIdx,
});
assert(
  !state.document.content.djNames.includes("DJ Sunset Deluxe"),
  "REMOVE_LINEUP_ITEM removes specific performer"
);

// 1.3 SET_PALETTE & SET_TYPOGRAPHY_PRESET
state = editorReducer(state, {
  type: "SET_PALETTE",
  paletteId: "golden-hour",
});
assert(
  state.document.styling.paletteId === "golden-hour",
  "SET_PALETTE updates styling paletteId"
);

state = editorReducer(state, {
  type: "SET_TYPOGRAPHY_PRESET",
  presetId: "classic-serif",
});
assert(
  state.document.styling.typographyPresetId === "classic-serif",
  "SET_TYPOGRAPHY_PRESET updates styling typographyPresetId"
);

// 1.4 SET_ASSET & SET_FOCAL_POINT
state = editorReducer(state, {
  type: "SET_ASSET",
  slot: "logo",
  assetId: "custom-logo-123",
});
assert(
  state.document.assets.logoAssetId === "custom-logo-123",
  "SET_ASSET updates logoAssetId"
);

state = editorReducer(state, {
  type: "SET_FOCAL_POINT",
  slot: "background",
  point: { x: 0.75, y: 0.25 },
});
assert(
  state.document.styling.focalPoints?.background?.x === 0.75 &&
    state.document.styling.focalPoints?.background?.y === 0.25,
  "SET_FOCAL_POINT updates normalized coordinates"
);

// -----------------------------------------------------------
// Suite 2: Transient State Separation Invariant
// -----------------------------------------------------------
console.log("\nSuite 2: Transient State Separation Invariant");

// Reset to clean state
state = createInitialEditorState(reddingtonDoc, "event");
const docBeforeTransient = JSON.stringify(state.document);

state = editorReducer(state, {
  type: "SET_ACTIVE_SECTION",
  sectionId: "colours",
});

assert(
  state.activeSection === "colours",
  "SET_ACTIVE_SECTION updates activeSection"
);
assert(
  state.isDirty === false,
  "SET_ACTIVE_SECTION does NOT dirty the editor state"
);
assert(
  JSON.stringify(state.document) === docBeforeTransient,
  "SET_ACTIVE_SECTION does NOT alter document content"
);

state = editorReducer(state, {
  type: "SET_ACTIVE_FIELD",
  fieldName: "eventTitle",
});

assert(
  state.activeField === "eventTitle",
  "SET_ACTIVE_FIELD updates activeField"
);
assert(
  state.isDirty === false,
  "SET_ACTIVE_FIELD does NOT dirty the editor state"
);

// -----------------------------------------------------------
// Suite 3: Dirty-State Detection & Reset Lifecycle
// -----------------------------------------------------------
console.log("\nSuite 3: Dirty-State Detection & Reset Lifecycle");

// Modify title
state = editorReducer(state, {
  type: "SET_TITLE",
  title: "Dirty Test Title",
});
assert(state.isDirty === true, "Document modification marks state as dirty");

// Reset to defaults
state = editorReducer(state, { type: "RESET_TO_DEFAULTS" });
assert(
  state.isDirty === false,
  "RESET_TO_DEFAULTS resets isDirty to false"
);
assert(
  state.document.content.eventTitle === reddingtonDoc.content.eventTitle,
  "RESET_TO_DEFAULTS restores original title"
);

// Load external document
const lannisterDoc = createDefaultPosterDocument("lannister");
state = editorReducer(state, {
  type: "LOAD_DOCUMENT",
  document: lannisterDoc,
});
assert(
  state.isDirty === false,
  "LOAD_DOCUMENT sets isDirty to false"
);
assert(
  state.document.templateId === "lannister",
  "LOAD_DOCUMENT updates active templateId"
);

// -----------------------------------------------------------
// Suite 4: Validation Rules & Non-blocking Text Guidance
// -----------------------------------------------------------
console.log("\nSuite 4: Validation Rules & Text Guidance");

// Test long event title
const longTitleDoc = {
  ...reddingtonDoc,
  content: {
    ...reddingtonDoc.content,
    eventTitle: "A Super Incredibly Long Title That Will Wrap Across Way Too Many Lines In The Poster",
  },
};
const titleWarnings = validatePosterDocument(longTitleDoc);
assert(
  titleWarnings.some((w) => w.field === "eventTitle" && w.severity === "warning"),
  "Generates warning for event title exceeding threshold (> 45 chars)"
);

// Test long lineup name
const longLineupDoc = {
  ...reddingtonDoc,
  content: {
    ...reddingtonDoc.content,
    djNames: ["DJ ExceptionallyLongStageNameThatExceedsLimits"],
  },
};
const lineupWarnings = validatePosterDocument(longLineupDoc);
assert(
  lineupWarnings.some((w) => w.field.startsWith("djNames") && w.severity === "warning"),
  "Generates warning for DJ name exceeding threshold (> 28 chars)"
);

// Test long offer copy
const longOfferDoc = {
  ...reddingtonDoc,
  content: {
    ...reddingtonDoc.content,
    primaryOffer: "Discounts on all domestic and imported beers, cocktails, whiskeys, rums, and sodas between 4pm and 9pm daily",
  },
};
const offerWarnings = validatePosterDocument(longOfferDoc);
assert(
  offerWarnings.some((w) => w.field === "primaryOffer" && w.severity === "warning"),
  "Generates warning for offer copy exceeding threshold (> 60 chars)"
);

// Test Friday empty offer notice
const fridayDoc = createDefaultPosterDocument("lothbrok");
const fridayWarnings = validatePosterDocument(fridayDoc);
assert(
  fridayWarnings.some((w) => w.field === "offer" && w.severity === "info"),
  "Generates info notice for Friday Flight Fridays empty offer policy"
);

// Test out-of-bounds focal point
const badFocalDoc = {
  ...reddingtonDoc,
  styling: {
    ...reddingtonDoc.styling,
    focalPoints: {
      background: { x: 1.5, y: -0.2 },
    },
  },
};
const focalWarnings = validatePosterDocument(badFocalDoc);
assert(
  focalWarnings.some((w) => w.field.startsWith("focalPoints") && w.severity === "warning"),
  "Generates warning for out-of-bounds focal point coordinates"
);

// -----------------------------------------------------------
// Suite 5: Serialization Invariance
// -----------------------------------------------------------
console.log("\nSuite 5: Serialization Invariance");

// Ensure modified document survives JSON serialization and conforms to PosterDocumentSchema
const jsonString = JSON.stringify(state.document);
const parsedObj = JSON.parse(jsonString);
const schemaValidation = PosterDocumentSchema.safeParse(parsedObj);

assert(
  schemaValidation.success === true,
  "Modified editor state serializes and passes PosterDocumentSchema validation"
);

// Verify no transient UI fields leaked into PosterDocument
assert(
  !("activeSection" in (parsedObj as any)),
  "Transient 'activeSection' is absent from serializable PosterDocument"
);
assert(
  !("isDirty" in (parsedObj as any)),
  "Transient 'isDirty' is absent from serializable PosterDocument"
);

// -----------------------------------------------------------
// Summary
// -----------------------------------------------------------
console.log("\n========================================================");
console.log(`  RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log("========================================================\n");

if (failedTests > 0) {
  process.exit(1);
}
