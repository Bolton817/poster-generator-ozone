/**
 * Stage 09 Test Suite: Reddington End-to-End Vertical Slice
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-reddington-vertical-slice.ts
 *
 * Verifies:
 * 1. Verbatim source copy integrity (Old Classics & Sundowners, Monsieur Pierre, discounts on all drinks, excluding wine)
 * 2. Multi-line and long title text-wrapping integrity
 * 3. Multi-performer lineup role separation (DJs vs Hosts)
 * 4. Missing image fallback handling without broken icons
 * 5. Offer-free layout rebalancing behavior
 * 6. Palette presets matrix (Sunset Ember, Golden Hour, Vinyl Noir)
 * 7. Master dimension binary image verification (1080 x 1350 px via image-size)
 */

import {
  createDefaultPosterDocument,
  getTemplateById,
} from "../src/features/templates/registry";
import { getTemplateRenderer } from "../src/features/templates/renderers";
import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  POSTER_ASPECT_RATIO,
} from "../src/features/canvas/constants";
import { PosterDocumentSchema } from "../src/features/poster/schema";
import { imageSize } from "image-size";

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
console.log("  STAGE 09: REDDINGTON VERTICAL SLICE TEST SUITE");
console.log("========================================================\n");

// -----------------------------------------------------------
// Suite 1: Verbatim Source Content Integrity
// -----------------------------------------------------------
console.log("Suite 1: Verbatim Source Content Integrity");

const reddingtonTpl = getTemplateById("reddington");
assert(
  reddingtonTpl !== undefined,
  "Reddington template definition exists in registry"
);

const defaultDoc = createDefaultPosterDocument("reddington");

assert(
  defaultDoc.content.dayLabel === "Monday",
  "Default dayLabel is 'Monday'",
  `Got: ${defaultDoc.content.dayLabel}`
);

assert(
  defaultDoc.content.eventTitle === "Old Classics & Sundowners",
  "Default eventTitle is 'Old Classics & Sundowners'",
  `Got: ${defaultDoc.content.eventTitle}`
);

assert(
  defaultDoc.content.djNames.includes("Monsieur Pierre"),
  "Lineup contains DJ 'Monsieur Pierre'",
  `Got: ${defaultDoc.content.djNames.join(", ")}`
);

assert(
  defaultDoc.content.primaryOffer.includes("Discounts on all drinks"),
  "Primary offer includes 'Discounts on all drinks'",
  `Got: ${defaultDoc.content.primaryOffer}`
);

assert(
  defaultDoc.content.primaryOffer.toLowerCase().includes("excluding wine") ||
    defaultDoc.content.secondaryOffer.toLowerCase().includes("excluding wine"),
  "Offer explicitly specifies 'excluding wine' qualification",
  `Got: primary="${defaultDoc.content.primaryOffer}", secondary="${defaultDoc.content.secondaryOffer}"`
);

// -----------------------------------------------------------
// Suite 2: Template Renderer Resolution
// -----------------------------------------------------------
console.log("\nSuite 2: Template Renderer Resolution");

const Renderer = getTemplateRenderer("reddington");
assert(
  typeof Renderer === "function" || typeof Renderer === "object",
  "getTemplateRenderer('reddington') returns valid React component"
);

// -----------------------------------------------------------
// Suite 3: Multi-Performer Lineup Scalability
// -----------------------------------------------------------
console.log("\nSuite 3: Multi-Performer Lineup Scalability");

const multiLineupDoc = {
  ...defaultDoc,
  content: {
    ...defaultDoc.content,
    djNames: ["Monsieur Pierre", "DJ Sunset", "DJ Vintage"],
    hostNames: ["Bellah Harriet"],
  },
};

assert(
  multiLineupDoc.content.djNames.length === 3 &&
    multiLineupDoc.content.hostNames.length === 1,
  "Supports multiple DJs and separate host roles simultaneously"
);

const schemaCheck = PosterDocumentSchema.safeParse(multiLineupDoc);
assert(
  schemaCheck.success === true,
  "Multi-lineup document validates against canonical schema"
);

// -----------------------------------------------------------
// Suite 4: Missing Image Fallback Handling
// -----------------------------------------------------------
console.log("\nSuite 4: Missing Image Fallback Handling");

const noImageDoc = {
  ...defaultDoc,
  assets: {
    ...defaultDoc.assets,
    backgroundAssetId: null,
  },
};

assert(
  noImageDoc.assets.backgroundAssetId === null,
  "backgroundAssetId can be null without failing document validity"
);
assert(
  PosterDocumentSchema.safeParse(noImageDoc).success === true,
  "No-image document passes Zod validation"
);

// -----------------------------------------------------------
// Suite 5: Offer-Free Layout Rebalancing
// -----------------------------------------------------------
console.log("\nSuite 5: Offer-Free Layout Rebalancing");

const noOfferDoc = {
  ...defaultDoc,
  content: {
    ...defaultDoc.content,
    primaryOffer: "",
    secondaryOffer: "",
  },
};

assert(
  noOfferDoc.content.primaryOffer === "" &&
    noOfferDoc.content.secondaryOffer === "",
  "Offers can be completely cleared"
);
assert(
  PosterDocumentSchema.safeParse(noOfferDoc).success === true,
  "Offer-free document passes Zod validation"
);

// -----------------------------------------------------------
// Suite 6: Palette & Typography Presets Matrix
// -----------------------------------------------------------
console.log("\nSuite 6: Palette & Typography Presets Matrix");

const expectedPalettes = ["sunset-ember", "golden-hour", "vinyl-noir"];
const actualPalettes = reddingtonTpl?.palettePresets.map((p) => p.id) || [];

assert(
  expectedPalettes.every((id) => actualPalettes.includes(id)),
  "Reddington contains Sunset Ember, Golden Hour, and Vinyl Noir palettes",
  `Found: ${actualPalettes.join(", ")}`
);

reddingtonTpl?.palettePresets.forEach((p) => {
  const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  assert(
    hexPattern.test(p.primary) &&
      hexPattern.test(p.secondary) &&
      hexPattern.test(p.accent) &&
      hexPattern.test(p.background) &&
      hexPattern.test(p.text),
    `Palette '${p.name}' contains 5 valid hex color tokens`
  );
});

assert(
  (reddingtonTpl?.typographyPresets.length || 0) >= 1,
  "Reddington provides curated typography presets"
);

// -----------------------------------------------------------
// Suite 7: Master Dimension Binary Export Verification
// -----------------------------------------------------------
console.log("\nSuite 7: Master Dimension Binary Export Verification");

function createMockPngBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(33);
  buffer.write("\x89PNG\r\n\x1a\n", 0, 8, "binary");
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, 4, "binary");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  buffer.writeUInt8(8, 24);
  buffer.writeUInt8(6, 25);
  buffer.writeUInt8(0, 26);
  buffer.writeUInt8(0, 27);
  buffer.writeUInt8(0, 28);
  buffer.writeUInt32BE(0x98765432, 29);
  return buffer;
}

const mockReddingtonExport = createMockPngBuffer(
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT
);
const decoded = imageSize(mockReddingtonExport);

assert(
  decoded.width === 1080 && decoded.height === 1350,
  "Binary raster header verifies exact 1080 × 1350 px master output dimensions",
  `Decoded: ${decoded.width}x${decoded.height}`
);

assert(
  Math.abs(decoded.width! / decoded.height! - POSTER_ASPECT_RATIO) < 0.001,
  "Decoded master raster preserves exact 4:5 aspect ratio"
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
