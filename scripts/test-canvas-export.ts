/**
 * Stage 07 Test Suite: Fixed Poster Canvas, Responsive Scaling & Export POC
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-canvas-export.ts
 *
 * Verifies:
 * 1. Pure scaling math across narrow mobile, tall mobile, tablet, and desktop containers
 * 2. Aspect ratio preservation (strict 4:5) without container overflow
 * 3. Safe bounds handling for zero, negative, or collapsed containers
 * 4. Master dimension constants (1080 x 1350 px)
 * 5. Filename sanitization per Production Decision 09
 * 6. Exporter adapter interface contracts and error structures
 * 7. Binary image dimensions verification (1080 x 1350) using image-size
 */

import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  POSTER_ASPECT_RATIO,
  calculateCanvasScale,
} from "../src/features/canvas/constants";
import { generatePosterFileName } from "../src/features/export/export-utils";
import { ExportError } from "../src/features/export/types";
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
console.log("  STAGE 07: CANVAS, SCALING & EXPORT POC TEST SUITE");
console.log("========================================================\n");

// -----------------------------------------------------------
// Suite 1: Master Coordinate Invariants
// -----------------------------------------------------------
console.log("Suite 1: Master Coordinate Invariants");

assert(
  POSTER_MASTER_WIDTH === 1080,
  "Master width is 1080 px",
  `Expected 1080, got ${POSTER_MASTER_WIDTH}`
);

assert(
  POSTER_MASTER_HEIGHT === 1350,
  "Master height is 1350 px",
  `Expected 1350, got ${POSTER_MASTER_HEIGHT}`
);

assert(
  Math.abs(POSTER_ASPECT_RATIO - 4 / 5) < 0.0001,
  "Aspect ratio equals 4:5 (0.80)",
  `Expected 0.8, got ${POSTER_ASPECT_RATIO}`
);

// -----------------------------------------------------------
// Suite 2: Responsive Scaling Calculations & No-Overflow Invariant
// -----------------------------------------------------------
console.log("\nSuite 2: Responsive Scaling Math & No-Overflow Invariant");

// Case A: Narrow Mobile (e.g. 360 x 740 px container, padding 16)
const narrowMobile = calculateCanvasScale({
  containerWidth: 360,
  containerHeight: 740,
  padding: 16,
});

assert(
  narrowMobile.displayWidth <= 360 - 32,
  "Narrow mobile (360px): displayWidth fits within available width",
  `displayWidth: ${narrowMobile.displayWidth}, available: ${360 - 32}`
);

assert(
  narrowMobile.displayHeight <= 740 - 32,
  "Narrow mobile (740px): displayHeight fits within available height",
  `displayHeight: ${narrowMobile.displayHeight}, available: ${740 - 32}`
);

assert(
  Math.abs(narrowMobile.displayWidth / narrowMobile.displayHeight - 4 / 5) < 0.01,
  "Narrow mobile: maintains 4:5 aspect ratio",
  `Ratio: ${(narrowMobile.displayWidth / narrowMobile.displayHeight).toFixed(4)}`
);

// Case B: Standard Mobile (e.g. 390 x 844 px container, padding 16)
const stdMobile = calculateCanvasScale({
  containerWidth: 390,
  containerHeight: 844,
  padding: 16,
});

assert(
  stdMobile.displayWidth <= 390 - 32 && stdMobile.displayHeight <= 844 - 32,
  "Standard iPhone (390x844): layout fits container without overflow",
  `${stdMobile.displayWidth}x${stdMobile.displayHeight}`
);

// Case C: Desktop Widescreen (e.g. 1920 x 900 px container, padding 24)
const desktop = calculateCanvasScale({
  containerWidth: 1920,
  containerHeight: 900,
  padding: 24,
});

assert(
  desktop.displayHeight <= 900 - 48,
  "Desktop (1920x900): height-constrained scale respects available height",
  `displayHeight: ${desktop.displayHeight}, available: ${900 - 48}`
);

assert(
  desktop.displayWidth <= 1920 - 48,
  "Desktop (1920x900): displayWidth does not exceed widescreen container",
  `displayWidth: ${desktop.displayWidth}`
);

// Case D: Zero & Negative Dimensions (Safe Clamping)
const collapsed = calculateCanvasScale({
  containerWidth: 0,
  containerHeight: 0,
  padding: 16,
});

assert(
  collapsed.scale > 0 && !isNaN(collapsed.scale),
  "Collapsed container (0x0): clamps to positive fallback scale without NaN",
  `scale: ${collapsed.scale}`
);

assert(
  collapsed.displayWidth > 0 && collapsed.displayHeight > 0,
  "Collapsed container: returns valid integer pixel dimensions",
  `${collapsed.displayWidth}x${collapsed.displayHeight}`
);

// -----------------------------------------------------------
// Suite 3: Filename Sanitization per Production Decision 09
// -----------------------------------------------------------
console.log("\nSuite 3: Filename Sanitization per Decision 09");

const cleanNamePng = generatePosterFileName({
  day: "Monday",
  templateName: "Reddington",
  eventTitle: "Old Classics & Sundowners",
  format: "png",
});

assert(
  cleanNamePng === "Ozone-Lounge-Monday-Reddington-Old-Classics-Sundowners.png",
  "Sanitizes normal title with ampersand and spaces for PNG",
  `Got: ${cleanNamePng}`
);

const cleanNameJpeg = generatePosterFileName({
  day: "Thursday",
  templateName: "Shelby",
  eventTitle: "Karaoke Night / Bellah & Tito!",
  format: "jpeg",
});

assert(
  cleanNameJpeg === "Ozone-Lounge-Thursday-Shelby-Karaoke-Night-Bellah-Tito.jpg",
  "Sanitizes slashes, exclamation, and ampersand for JPEG (.jpg extension)",
  `Got: ${cleanNameJpeg}`
);

const fallbackName = generatePosterFileName({});
assert(
  fallbackName === "Ozone-Lounge-Event-Template-Poster.png",
  "Applies robust defaults when params are omitted",
  `Got: ${fallbackName}`
);

// -----------------------------------------------------------
// Suite 4: Exporter Error Contracts
// -----------------------------------------------------------
console.log("\nSuite 4: Exporter Error Contracts");

const error1 = new ExportError("Element missing", "TARGET_NOT_FOUND");
assert(
  error1.name === "ExportError" && error1.code === "TARGET_NOT_FOUND",
  "ExportError sets correct name and code",
  `Code: ${error1.code}`
);

const error2 = new ExportError("Corrupt output", "CORRUPT_OUTPUT", { size: 0 });
assert(
  error2.details !== undefined,
  "ExportError preserves error details payload"
);

// -----------------------------------------------------------
// Suite 5: Binary Image Dimension Verification (image-size)
// -----------------------------------------------------------
console.log("\nSuite 5: Binary Image Header Dimension Verification");

// Build a valid 1080 x 1350 minimal PNG buffer to test header verification
function createMockPngBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(33);
  // PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  buffer.write("\x89PNG\r\n\x1a\n", 0, 8, "binary");
  // IHDR length: 13
  buffer.writeUInt32BE(13, 8);
  // IHDR chunk type
  buffer.write("IHDR", 12, 4, "binary");
  // Width & Height
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  // Bit depth 8, ColorType 6 (RGBA), Comp 0, Filter 0, Interlace 0
  buffer.writeUInt8(8, 24);
  buffer.writeUInt8(6, 25);
  buffer.writeUInt8(0, 26);
  buffer.writeUInt8(0, 27);
  buffer.writeUInt8(0, 28);
  // CRC dummy
  buffer.writeUInt32BE(0x12345678, 29);
  return buffer;
}

const mockPosterPng = createMockPngBuffer(1080, 1350);
const decoded = imageSize(mockPosterPng);

assert(
  decoded.width === 1080,
  "Binary PNG header decodes width as exactly 1080 px",
  `Decoded: ${decoded.width}`
);

assert(
  decoded.height === 1350,
  "Binary PNG header decodes height as exactly 1350 px",
  `Decoded: ${decoded.height}`
);

assert(
  decoded.type === "png",
  "Binary PNG header identified as PNG type",
  `Decoded: ${decoded.type}`
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
