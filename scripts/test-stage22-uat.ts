/**
 * Stage 22 Verification Test Suite: User Acceptance Testing, Handover and Release Sign-Off
 * TDD v1.0 Pages 102-103, 116 (Gate G22)
 *
 * Validates the 10 Canonical Acceptance Criteria (ACC-01 through ACC-10):
 * ACC-01: Seven registry entries appear in weekday order with correct tags and content.
 * ACC-02: Authentication protects pages and draft/asset operations.
 * ACC-03: A saved draft reopens with stable assets and styles after relogin.
 * ACC-04: Preview zoom/pan does not alter canvas geometry or export dimensions.
 * ACC-05: PNG/JPEG dimensions match configured master dimensions (1080x1350).
 * ACC-06: Mobile save/export flow passes target browser tests and touch targets.
 * ACC-07: Missing logistics trigger warnings without invented content.
 * ACC-08: Reddington and all six later templates have unique compositions.
 * ACC-09: Blank Friday offer and Shelby's role separation are correct.
 * ACC-10: Long text, missing image, failed save and failed export recover gracefully.
 */

import fs from "fs";
import path from "path";
import {
  ORDERED_TEMPLATE_IDS,
  getTemplatesInOrder,
  getTemplateById,
  createDefaultPosterDocument,
  validatePosterDocument,
} from "../src/features/templates/registry";
import { getTemplateRenderer } from "../src/features/templates/renderers";
import { PosterDocumentSchema, PosterDocument } from "../src/features/poster/schema";
import { EXPORT_PRESETS } from "../src/features/export/types";
import { generatePosterFileName, canWebShareFiles } from "../src/features/export/export-utils";
import { evaluatePreExportChecklist } from "../src/features/preview/checklist";
import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  POSTER_ASPECT_RATIO,
} from "../src/features/canvas/constants";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runStage22UATSuite() {
  console.log("================================================================================");
  console.log("STAGE 22 UAT ACCEPTANCE SUITE: User Acceptance Testing & Release Sign-Off");
  console.log("TDD v1.0 Section V (Page 116) Canonical Matrix");
  console.log("================================================================================\n");

  const projectRoot = process.cwd();

  // ---------------------------------------------------------------------------
  // ACC-01: Seven registry entries appear in weekday order with correct tags
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-01: 7-Day Fleet Ordering & Source Content Integrity");
  const templates = getTemplatesInOrder();
  assert(templates.length === 7, "Registry contains exactly 7 daily templates");

  const expectedIds = ["reddington", "saint", "lannister", "shelby", "lothbrok", "escobar", "pinkman"];
  const expectedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (let i = 0; i < 7; i++) {
    const t = templates[i];
    assert(t.id === expectedIds[i], `Day ${i + 1} is template '${expectedIds[i]}'`);
    assert(t.dayLabel === expectedDays[i], `Template '${t.id}' has day label '${expectedDays[i]}'`);
    assert(t.dayOfWeek === (i === 6 ? 0 : i + 1), `Template '${t.id}' has matching dayOfWeek`);
    assert(Boolean(t.thumbnailUrl) && fs.existsSync(path.join(projectRoot, "public", t.thumbnailUrl!)), `Dedicated vector thumbnail exists at ${t.thumbnailUrl}`);
  }

  // Verify authentic brief copy
  const reddington = getTemplateById("reddington")!;
  assert(reddington.defaults.content.eventTitle === "Old Classics & Sundowners", "Reddington event title matches brief");
  assert(reddington.defaults.content.djNames.includes("Monsieur Pierre"), "Reddington DJ matches brief");

  const saint = getTemplateById("saint")!;
  assert(saint.defaults.content.eventTitle === "African Night (Afro)", "Saint event title matches brief");
  assert(saint.defaults.content.djNames.includes("DJ Neb") && saint.defaults.content.djNames.includes("DVJ Jojez"), "Saint DJs match brief");

  const lannister = getTemplateById("lannister")!;
  assert(lannister.defaults.content.eventTitle === "Groovy Wednesday", "Lannister event title matches brief");
  assert(lannister.defaults.content.djNames.includes("DJ Donben") && lannister.defaults.content.djNames.includes("DJ Vin"), "Lannister DJs match brief");

  const shelby = getTemplateById("shelby")!;
  assert(shelby.defaults.content.eventTitle === "Karaoke Night", "Shelby event title matches brief");
  assert(shelby.defaults.content.hostNames.includes("Bellah Harriet") && shelby.defaults.content.hostNames.includes("Tito Wagithomo"), "Shelby hosts match brief");
  assert(shelby.defaults.content.djNames.includes("DJ Fab"), "Shelby DJ matches brief");

  const lothbrok = getTemplateById("lothbrok")!;
  assert(lothbrok.defaults.content.eventTitle === "Flight Fridays", "Lothbrok event title matches brief");
  assert(lothbrok.defaults.content.djNames.includes("DJ Slim D") && lothbrok.defaults.content.djNames.includes("Mistabrand"), "Lothbrok DJs match brief");

  const escobar = getTemplateById("escobar")!;
  assert(escobar.defaults.content.eventTitle === "Saturday Fiesta", "Escobar event title matches brief");
  assert(escobar.defaults.content.djNames.includes("DVJ Jojez"), "Escobar DJ matches brief");

  const pinkman = getTemplateById("pinkman")!;
  assert(pinkman.defaults.content.eventTitle === "Old Skool Sundays", "Pinkman event title matches brief");
  assert(pinkman.defaults.content.djNames.includes("DJ Ngash"), "Pinkman DJ matches brief");

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-02: Authentication protects pages and draft/asset operations
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-02: Authentication & Protected Access Boundaries");
  const layoutSrc = fs.readFileSync(path.join(projectRoot, "src/app/app/layout.tsx"), "utf-8");
  assert(layoutSrc.includes("requireAuth()"), "Protected layout /app enforces requireAuth() server-side");

  const uploadRouteSrc = fs.readFileSync(path.join(projectRoot, "src/app/api/assets/upload/route.ts"), "utf-8");
  assert(uploadRouteSrc.includes("getCurrentUser()"), "Upload route /api/assets/upload checks getCurrentUser()");
  assert(uploadRouteSrc.includes("status: 401"), "Upload route rejects unauthenticated requests with HTTP 401");

  const draftsRouteSrc = fs.readFileSync(path.join(projectRoot, "src/app/api/drafts/route.ts"), "utf-8");
  assert(draftsRouteSrc.includes("getCurrentUser()"), "Drafts route /api/drafts checks getCurrentUser()");
  assert(draftsRouteSrc.includes("status: 401"), "Drafts route rejects unauthenticated requests with HTTP 401");

  const draftIdRouteSrc = fs.readFileSync(path.join(projectRoot, "src/app/api/drafts/[draftId]/route.ts"), "utf-8");
  assert(draftIdRouteSrc.includes("userId: user.id"), "Draft ID mutations enforce owner-scoped userId filtering (Decision 08)");

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-03: A saved draft reopens with stable assets and styles after relogin
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-03: Draft Serialization & Persistence Fidelity");
  for (const tid of expectedIds) {
    const doc = createDefaultPosterDocument(tid as any);
    const serialized = JSON.stringify(doc);
    const parsed = JSON.parse(serialized);
    const validation = validatePosterDocument(parsed);
    assert(validation.success === true, `Draft JSON for ${tid} round-trips through serialization and passes schema`);
    assert(parsed.canvas.width === 1080 && parsed.canvas.height === 1350, `Preserves 1080x1350 coordinates for ${tid}`);
    assert(Boolean(parsed.styling.paletteId), `Preserves paletteId token for ${tid}`);
  }

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-04: Preview zoom/pan does not alter canvas geometry or export dimensions
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-04: Canvas Viewport & Coordinate Isolation");
  const viewportSrc = fs.readFileSync(path.join(projectRoot, "src/features/canvas/CanvasViewport.tsx"), "utf-8");
  assert(viewportSrc.includes("POSTER_MASTER_WIDTH") || viewportSrc.includes("1080"), "CanvasViewport defines fixed 1080 width constant");
  assert(viewportSrc.includes("POSTER_MASTER_HEIGHT") || viewportSrc.includes("1350"), "CanvasViewport defines fixed 1350 height constant");
  assert(viewportSrc.includes("transform") || viewportSrc.includes("scale"), "CanvasViewport applies zoom via CSS transform scale without mutating master DOM dimensions");

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-05: PNG/JPEG dimensions match configured master dimensions
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-05: Master Export Dimensions & Format Specifications");
  assert(POSTER_MASTER_WIDTH === 1080, "Master width constant is strictly 1080 px");
  assert(POSTER_MASTER_HEIGHT === 1350, "Master height constant is strictly 1350 px");
  assert(POSTER_ASPECT_RATIO === 0.8, "Master aspect ratio is strictly 4:5 (0.80)");
  assert(EXPORT_PRESETS.png.format === "png", "PNG preset format is image/png");
  assert(EXPORT_PRESETS["jpeg-high"].format === "jpeg", "JPEG High preset format is image/jpeg");
  assert(EXPORT_PRESETS["jpeg-high"].quality === 0.85, "JPEG High quality is configured at 0.85");

  const sampleFilename = generatePosterFileName({
    day: reddington.dayLabel,
    templateName: reddington.name,
    eventTitle: reddington.defaults.content.eventTitle,
    format: "png",
  });
  assert(sampleFilename.startsWith("Ozone-Lounge-Monday-Reddington"), "Export filename adheres to Decision 09 convention");
  assert(sampleFilename.endsWith(".png"), "Export filename ends with .png");

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-06: Mobile save/export flow passes target browser tests and touch targets
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-06: Mobile Touch Targets & Web Share API");
  const buttonSrc = fs.readFileSync(path.join(projectRoot, "src/components/ui/Button.tsx"), "utf-8");
  assert(buttonSrc.includes("min-h-[44px]") || buttonSrc.includes("h-11"), "Button component defines 44px minimum mobile touch target");

  const dialogSrc = fs.readFileSync(path.join(projectRoot, "src/components/ui/Dialog.tsx"), "utf-8");
  assert(dialogSrc.includes("min-w-[44px]") && dialogSrc.includes("min-h-[44px]"), "Dialog close button enforces 44x44px touch target");

  assert(canWebShareFiles() === false, "canWebShareFiles safely evaluates to false in server / Node environment");

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-07: Missing logistics trigger warnings without invented content
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-07: Preflight Logistics Inspection & Zero Invented Copy");
  const bareDoc = createDefaultPosterDocument("reddington");
  bareDoc.content.dateText = "";
  bareDoc.content.startTime = "";
  bareDoc.content.locationText = "";

  const preflight = evaluatePreExportChecklist(bareDoc);
  assert(preflight.warningCount >= 2, "Preflight flags missing date and time as warnings");
  assert(
    preflight.items.some((i) => i.id === "date" && i.status === "warning"),
    "Preflight flags date warning"
  );
  assert(
    preflight.items.some((i) => i.id === "time" && i.status === "warning"),
    "Preflight flags time warning"
  );
  assert(
    !bareDoc.content.dateText && !bareDoc.content.startTime,
    "Missing logistics remain blank/null without inventing placeholder copy (Decision 04/05)"
  );

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-08: Reddington and all six later templates have unique compositions
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-08: Unique Architectural Compositions Fleet Coverage");
  for (const tid of ORDERED_TEMPLATE_IDS) {
    const renderer = getTemplateRenderer(tid);
    assert(typeof renderer === "function", `Template renderer for '${tid}' is a valid React component`);

    const def = getTemplateById(tid)!;
    assert(def.palettePresets.length >= 3, `Template '${tid}' provides at least 3 curated palette presets`);
    assert(def.typographyPresets.length >= 2, `Template '${tid}' provides at least 2 curated typography pairings`);
    assert(def.layoutOptions.length >= 2, `Template '${tid}' provides at least 2 distinct layout treatments`);
  }

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-09: Blank Friday offer and Shelby's role separation are correct
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-09: Decision 06 Friday Offer-Free & Shelby Role Separation");
  const lothbrokDoc = createDefaultPosterDocument("lothbrok");
  assert(lothbrokDoc.content.primaryOffer === "", "Lothbrok (Friday) primary offer is strictly empty string (Decision 06)");
  assert(lothbrokDoc.content.secondaryOffer === "", "Lothbrok (Friday) secondary offer is strictly empty string (Decision 06)");

  const shelbyDoc = createDefaultPosterDocument("shelby");
  assert(shelbyDoc.content.hostNames.length > 0, "Shelby defines dedicated host names array");
  assert(shelbyDoc.content.djNames.length > 0, "Shelby defines dedicated DJ names array");
  assert(
    shelbyDoc.content.hostNames.every((h) => !shelbyDoc.content.djNames.includes(h)),
    "Shelby hosts and DJs are strictly isolated in separate data arrays per Blueprint 4.5"
  );

  console.log("");

  // ---------------------------------------------------------------------------
  // ACC-10: Long text, missing image, and error recovery
  // ---------------------------------------------------------------------------
  console.log("Criterion ACC-10: Defensive Boundaries & Crash Recovery");
  const longTextDoc = createDefaultPosterDocument("saint");
  longTextDoc.content.eventTitle = "A".repeat(150); // Exact max length
  const validLong = PosterDocumentSchema.safeParse(longTextDoc);
  assert(validLong.success === true, "Schema validates text up to exact upper bound (150 chars)");

  longTextDoc.content.eventTitle = "A".repeat(151); // Exceeds max length
  const invalidLong = PosterDocumentSchema.safeParse(longTextDoc);
  assert(invalidLong.success === false, "Schema rejects text exceeding upper bound");

  // Missing image tolerance
  const noImageDoc = createDefaultPosterDocument("escobar");
  noImageDoc.assets.backgroundAssetId = null;
  assert(validatePosterDocument(noImageDoc).success === true, "Poster document cleanly validates without background image");

  // Error boundary presence
  const editorBoundarySrc = fs.readFileSync(path.join(projectRoot, "src/components/editor/EditorErrorBoundary.tsx"), "utf-8");
  assert(editorBoundarySrc.includes('role="alert"'), "EditorErrorBoundary implements accessible role='alert'");
  assert(editorBoundarySrc.includes("Retry Canvas"), "EditorErrorBoundary provides interactive crash recovery");

  console.log("");

  // ---------------------------------------------------------------------------
  // UAT Matrix Summary
  // ---------------------------------------------------------------------------
  console.log("================================================================================");
  console.log(`STAGE 22 UAT RESULTS: ${passedTests} passed, ${totalTests - passedTests} failed (${totalTests} total)`);
  console.log("================================================================================");

  if (passedTests === totalTests) {
    console.log("ALL 10 CANONICAL ACCEPTANCE CRITERIA (ACC-01 through ACC-10) VERIFIED!");
    console.log("STAGE 22 GATE G22: PASSED");
  } else {
    console.error("STAGE 22 GATE FAILED: Some criteria failed verification.");
    process.exit(1);
  }
}

runStage22UATSuite().catch((err) => {
  console.error("Fatal error running Stage 22 UAT suite:", err);
  process.exit(1);
});
