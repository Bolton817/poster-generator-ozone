/**
 * Stage 12 Test Suite: Multi-Format Export Engine and Batch Packaging
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-batch-export.ts
 *
 * Verifies:
 * 1. Master export dimension invariants (1080 x 1350, 4:5 ratio)
 * 2. Multi-format preset definitions and compression factor mapping
 * 3. File naming sanitization per Production Decision 09 and batch zip naming
 * 4. Preflight inspection evaluation before export
 * 5. JSZip archive creation, magic byte signature (PK\x03\x04), and entry extraction
 * 6. Canonical weekly template batch items factory (7 days)
 * 7. Batch export orchestrator execution, progress callbacks, and abort cancellation
 * 8. Web Share API detection and fallback behavior
 */

import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  POSTER_ASPECT_RATIO,
} from "../src/features/canvas/constants";
import {
  EXPORT_PRESETS,
  ExportOptions,
  ExportResult,
  PosterExporter,
  BatchExportItem,
  BatchExportProgress,
} from "../src/features/export/types";
import {
  generatePosterFileName,
  generateBatchZipFileName,
  getQualityForPreset,
  canWebShareFiles,
  shareOrDownloadPoster,
} from "../src/features/export/export-utils";
import {
  createPosterZipArchive,
  inspectZipEntries,
  PosterFileEntry,
} from "../src/features/export/zip-bundler";
import {
  runBatchExport,
  getWeeklyTemplateBatchItems,
  BatchRenderExecutor,
} from "../src/features/export/batch-export-service";
import { evaluatePreExportChecklist } from "../src/features/preview/checklist";
import { createDefaultPosterDocument } from "../src/features/templates/registry";
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

async function runTests() {
  console.log("\n========================================================");
  console.log("  STAGE 12: MULTI-FORMAT EXPORT & BATCH PACKAGING SUITE");
  console.log("========================================================\n");

  // -----------------------------------------------------------
  // Suite 1: Master Coordinate & Format Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Master Coordinate & Format Invariants");

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
    Math.abs(POSTER_ASPECT_RATIO - 0.8) < 0.001,
    "Master canvas aspect ratio is strictly 4:5 (0.80)"
  );

  assert(
    EXPORT_PRESETS.png.format === "png" && EXPORT_PRESETS.png.isDefault === true,
    "PNG preset is default master lossless format"
  );

  assert(
    EXPORT_PRESETS["jpeg-max"].quality === 0.95,
    "Maximum fidelity JPEG preset configured at 0.95 quality"
  );

  assert(
    EXPORT_PRESETS["jpeg-high"].quality === 0.85,
    "Social/WhatsApp JPEG preset configured at 0.85 quality"
  );

  assert(
    EXPORT_PRESETS["jpeg-compact"].quality === 0.75,
    "Compact JPEG preset configured at 0.75 quality"
  );

  assert(
    getQualityForPreset("maximum") === 0.95 &&
      getQualityForPreset("high") === 0.85 &&
      getQualityForPreset("compact") === 0.75,
    "Quality mapping helper returns accurate numeric compression factors"
  );

  // -----------------------------------------------------------
  // Suite 2: Filename Sanitization & Date-Stamped ZIP Names
  // -----------------------------------------------------------
  console.log("\nSuite 2: Filename Sanitization & Date-Stamped ZIP Names");

  const cleanName = generatePosterFileName({
    day: "Monday",
    templateName: "Reddington",
    eventTitle: "Old Classics & Sundowners",
    format: "png",
  });
  assert(
    cleanName === "Ozone-Lounge-Monday-Reddington-Old-Classics-Sundowners.png",
    "Generates clean standard PNG filename per Decision 09",
    `Got: ${cleanName}`
  );

  const sanitizedSpecial = generatePosterFileName({
    day: "Wednesday",
    templateName: "Lannister",
    eventTitle: "Groovy! 2-for-1 Cocktail Special @ Ozone Lounge #Party",
    format: "jpeg",
  });
  assert(
    sanitizedSpecial ===
      "Ozone-Lounge-Wednesday-Lannister-Groovy-2-for-1-Cocktail-Special-Ozone-Lounge-Party.jpg",
    "Strips non-alphanumeric punctuation and sets .jpg extension for jpeg",
    `Got: ${sanitizedSpecial}`
  );

  const fallbackTitle = generatePosterFileName({
    day: "Friday",
    templateName: "Lothbrok",
    eventTitle: "",
    format: "png",
  });
  assert(
    fallbackTitle === "Ozone-Lounge-Friday-Lothbrok-Poster.png",
    "Uses 'Poster' fallback when event title is empty string",
    `Got: ${fallbackTitle}`
  );

  const testDate = new Date("2026-10-25T12:00:00Z");
  const zipFileName = generateBatchZipFileName(testDate);
  assert(
    zipFileName === "Ozone-Lounge-Weekly-Posters-2026-10-25.zip",
    "Generates date-stamped batch zip archive name: Ozone-Lounge-Weekly-Posters-YYYY-MM-DD.zip",
    `Got: ${zipFileName}`
  );

  // -----------------------------------------------------------
  // Suite 3: Preflight Inspection Evaluation
  // -----------------------------------------------------------
  console.log("\nSuite 3: Preflight Inspection Evaluation");

  const defaultReddington = createDefaultPosterDocument("reddington");
  const defaultEval = evaluatePreExportChecklist(defaultReddington);
  assert(
    defaultEval.warningCount === 2 &&
      defaultEval.items.some((i) => i.id === "date" && i.status === "warning") &&
      defaultEval.items.some((i) => i.id === "time" && i.status === "warning"),
    "Default Reddington document triggers exactly 2 advisory notices for omitted date/time per Decision 04"
  );

  // Fully specified document
  const fullySpecifiedDoc = {
    ...defaultReddington,
    content: {
      ...defaultReddington.content,
      dateText: "Monday, 20 Oct 2026",
      startTime: "4:00 PM",
    },
  };
  const fullySpecifiedEval = evaluatePreExportChecklist(fullySpecifiedDoc);
  assert(
    fullySpecifiedEval.warningCount === 0,
    "Fully specified document with date and time passes all preflight checks with 0 warnings"
  );

  // Document with missing title
  const missingTitleDoc = {
    ...defaultReddington,
    content: {
      ...defaultReddington.content,
      eventTitle: "   ",
    },
  };
  const missingTitleEval = evaluatePreExportChecklist(missingTitleDoc);
  assert(
    missingTitleEval.warningCount >= 1 &&
      missingTitleEval.items.some((i) => i.id === "title" && i.status === "warning"),
    "Flags missing event title with preflight warning advisory"
  );

  // Document with missing lineup
  const missingLineupDoc = {
    ...defaultReddington,
    content: {
      ...defaultReddington.content,
      djNames: [],
      hostNames: [],
    },
  };
  const missingLineupEval = evaluatePreExportChecklist(missingLineupDoc);
  assert(
    missingLineupEval.items.some((i) => i.id === "lineup" && i.status === "warning"),
    "Flags empty performer lineup with preflight warning advisory"
  );

  // Friday Flight Fridays policy check
  const lothbrokDoc = createDefaultPosterDocument("lothbrok");
  const lothbrokEval = evaluatePreExportChecklist(lothbrokDoc);
  assert(
    lothbrokEval.items.some(
      (i) => i.id === "offer" && i.status === "ready" && i.detail.includes("Flight Fridays")
    ),
    "Enforces Decision 06: Friday Flight Fridays policy is ready without promotional offers"
  );

  // -----------------------------------------------------------
  // Suite 4: JSZip Archive Packaging & Integrity
  // -----------------------------------------------------------
  console.log("\nSuite 4: JSZip Archive Packaging & Integrity");

  // Create mock PNG and JPEG blobs
  const mockPngData = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
  const mockJpegData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 1, 2, 3]);

  const testFiles: PosterFileEntry[] = [
    {
      fileName: "Ozone-Lounge-Monday-Reddington.png",
      blob: new Blob([mockPngData], { type: "image/png" }),
    },
    {
      fileName: "Ozone-Lounge-Tuesday-Saint.jpg",
      blob: new Blob([mockJpegData], { type: "image/jpeg" }),
    },
    {
      fileName: "Ozone-Lounge-Wednesday-Lannister.png",
      blob: new Blob([mockPngData], { type: "image/png" }),
    },
  ];

  const zipBlob = await createPosterZipArchive(testFiles, {
    comment: "Test Ozone Archive",
  });

  assert(
    zipBlob instanceof Blob && zipBlob.size > 0,
    "Creates non-empty Blob instance for ZIP archive",
    `Size: ${zipBlob.size} bytes`
  );

  assert(
    zipBlob.type === "application/zip",
    "Sets correct MIME type: application/zip",
    `Got: ${zipBlob.type}`
  );

  // Validate ZIP magic bytes: PK\x03\x04
  const zipArrayBuffer = await zipBlob.arrayBuffer();
  const zipHeader = new Uint8Array(zipArrayBuffer.slice(0, 4));
  const isZipMagic =
    zipHeader[0] === 0x50 &&
    zipHeader[1] === 0x4b &&
    zipHeader[2] === 0x03 &&
    zipHeader[3] === 0x04;

  assert(
    isZipMagic,
    "ZIP archive has valid PK\\x03\\x04 zip header signature"
  );

  // Validate table of contents using inspectZipEntries
  const entries = await inspectZipEntries(zipBlob);
  assert(
    entries.length === 3,
    "ZIP archive contains exactly 3 entries",
    `Found: ${entries.join(", ")}`
  );

  assert(
    entries.includes("Ozone-Lounge-Monday-Reddington.png") &&
      entries.includes("Ozone-Lounge-Tuesday-Saint.jpg") &&
      entries.includes("Ozone-Lounge-Wednesday-Lannister.png"),
    "All file entries match expected sanitized poster file names"
  );

  // Subfolder packaging test
  const folderZipBlob = await createPosterZipArchive(testFiles, {
    folderName: "Posters-Week-42",
  });
  const folderEntries = await inspectZipEntries(folderZipBlob);
  assert(
    folderEntries.every((e) => e.startsWith("Posters-Week-42/")),
    "Packages entries inside designated subfolder when requested"
  );

  // -----------------------------------------------------------
  // Suite 5: Weekly Template Batch Items Factory
  // -----------------------------------------------------------
  console.log("\nSuite 5: Weekly Template Batch Items Factory");

  const weeklyItems = await getWeeklyTemplateBatchItems();
  assert(
    weeklyItems.length === 7,
    "Weekly template batch factory generates exactly 7 days (Monday–Sunday)",
    `Count: ${weeklyItems.length}`
  );

  const days = weeklyItems.map((item) => item.dayLabel);
  assert(
    days.includes("Monday") &&
      days.includes("Tuesday") &&
      days.includes("Wednesday") &&
      days.includes("Thursday") &&
      days.includes("Friday") &&
      days.includes("Saturday") &&
      days.includes("Sunday"),
    "Weekly batch items cover all 7 days of the week"
  );

  let allSchemasValid = true;
  for (const item of weeklyItems) {
    const parseRes = PosterDocumentSchema.safeParse(item.document);
    if (!parseRes.success) {
      allSchemasValid = false;
      console.error(`Invalid document in batch item ${item.id}:`, parseRes.error);
    }
  }
  assert(
    allSchemasValid,
    "Every weekly template batch item satisfies canonical PosterDocumentSchema"
  );

  // -----------------------------------------------------------
  // Suite 6: Batch Export Orchestrator & Progress Callbacks
  // -----------------------------------------------------------
  console.log("\nSuite 6: Batch Export Orchestrator & Progress Callbacks");

  // Mock exporter implementation
  const mockExporter: PosterExporter = {
    rasterize: async (el: HTMLElement, opts?: ExportOptions): Promise<ExportResult> => {
      const format = opts?.format ?? "png";
      const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
      const blob = new Blob([new Uint8Array([1, 2, 3, 4, 5])], { type: mimeType });
      return {
        blob,
        fileName: opts?.fileName ?? "test.png",
        width: 1080,
        height: 1350,
        mimeType,
        byteSize: blob.size,
        durationMs: 12,
      };
    },
  };

  // Mock DOM render executor
  const mockExecutor: BatchRenderExecutor = {
    renderDocument: async (item: BatchExportItem): Promise<HTMLElement> => {
      // In node environment, return a dummy element
      return {} as HTMLElement;
    },
  };

  const progressUpdates: BatchExportProgress[] = [];

  const batchItemsToRun = weeklyItems.slice(0, 3); // Test with 3 items
  const batchResult = await runBatchExport({
    items: batchItemsToRun,
    format: "png",
    exporter: mockExporter,
    executor: mockExecutor,
    onProgress: (p) => {
      progressUpdates.push({ ...p });
    },
  });

  assert(
    batchResult.totalFiles === 3,
    "Batch export result reports 3 exported files",
    `Got: ${batchResult.totalFiles}`
  );

  assert(
    batchResult.zipBlob.size > 0 && batchResult.zipBlob.type === "application/zip",
    "Batch export yields valid non-empty application/zip blob"
  );

  assert(
    progressUpdates.length >= 4,
    "Emitted sequential progress callbacks for each item and zipping phase",
    `Updates count: ${progressUpdates.length}`
  );

  const hasRenderingPhase = progressUpdates.some((p) => p.phase === "rendering");
  const hasZippingPhase = progressUpdates.some((p) => p.phase === "zipping");
  const hasCompletePhase = progressUpdates.some((p) => p.phase === "complete" && p.percent === 100);

  assert(
    hasRenderingPhase && hasZippingPhase && hasCompletePhase,
    "Progress transitions through rendering, zipping, and complete phases"
  );

  // Abort cancellation test
  const abortCtrl = new AbortController();
  abortCtrl.abort(); // Immediately aborted

  let abortCaught = false;
  try {
    await runBatchExport({
      items: batchItemsToRun,
      format: "png",
      exporter: mockExporter,
      executor: mockExecutor,
      signal: abortCtrl.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("cancelled")) {
      abortCaught = true;
    }
  }

  assert(
    abortCaught,
    "Batch export respects AbortSignal and aborts immediately when cancelled"
  );

  // -----------------------------------------------------------
  // Suite 7: Web Share API Detection & Fallback Logic
  // -----------------------------------------------------------
  console.log("\nSuite 7: Web Share API Detection & Fallback Logic");

  const canShareInNode = canWebShareFiles();
  assert(
    canShareInNode === false,
    "canWebShareFiles correctly evaluates to false in non-browser Node environments"
  );

  // Test fallback in shareOrDownloadPoster:
  // In Node environment, without window, returns "downloaded" safely without throwing
  const fallbackResult = await shareOrDownloadPoster({
    blob: new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }),
    fileName: "Ozone-Test.png",
    width: 1080,
    height: 1350,
    mimeType: "image/png",
    byteSize: 3,
    durationMs: 10,
  });

  assert(
    fallbackResult === "downloaded",
    "shareOrDownloadPoster safely falls back to download when Web Share API is unavailable"
  );

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  STAGE 12 VERIFICATION COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
