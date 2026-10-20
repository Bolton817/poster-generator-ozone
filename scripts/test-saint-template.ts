/**
 * Stage 13 Test Suite: Saint Template (Tuesday African Night / Afrobeat)
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-saint-template.ts
 *
 * Verifies:
 * 1. Saint template registry metadata and master canvas invariants (1080 x 1350, 4:5 ratio)
 * 2. Three curated palette presets (Saffron & Ink, Electric Azure, Terracotta Pulse)
 * 3. Typography pairing presets (bold-afrobeat, afro-groove)
 * 4. Layout options (geometric-frame, pattern-pulse) and pattern density tokens
 * 5. Verbatim copy: 'African Night (Afro)', 'DJ Neb & DVJ Jojez', 'Discounts on beer buckets and cocktails.'
 * 6. Conditional layout rebalancing and Zod document schema validation
 * 7. Template renderer resolver mapping (saint -> SaintTemplate)
 * 8. Multi-format export filename generation per Decision 09
 */

import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  POSTER_ASPECT_RATIO,
} from "../src/features/canvas/constants";
import {
  getTemplateById,
  createDefaultPosterDocument,
} from "../src/features/templates/registry";
import {
  getTemplateRenderer,
} from "../src/features/templates/renderers";
import { SaintTemplate } from "../src/components/poster/templates/SaintTemplate";
import { PosterDocumentSchema } from "../src/features/poster/schema";
import { generatePosterFileName } from "../src/features/export/export-utils";

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
  console.log("  STAGE 13: SAINT (TUESDAY AFROBEAT) TEST SUITE");
  console.log("========================================================\n");

  const saintDef = getTemplateById("saint");
  assert(Boolean(saintDef), "Saint template definition exists in registry");

  if (!saintDef) {
    console.error("FATAL: Saint template missing from registry.");
    process.exit(1);
  }

  // -----------------------------------------------------------
  // Suite 1: Registry Metadata & Coordinate Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Registry Metadata & Coordinate Invariants");

  assert(saintDef.id === "saint", "Template ID is 'saint'");
  assert(saintDef.name === "Saint", "Template display name is 'Saint'");
  assert(saintDef.dayOfWeek === 2, "Template dayOfWeek is 2 (Tuesday)");
  assert(saintDef.dayLabel === "Tuesday", "Template dayLabel is 'Tuesday'");
  assert(
    saintDef.eventTitle === "African Night (Afro)",
    "Template eventTitle is verbatim 'African Night (Afro)'"
  );
  assert(
    saintDef.thumbnailUrl === "/template-thumbnails/saint.svg",
    "Template specifies dedicated '/template-thumbnails/saint.svg' thumbnail"
  );
  assert(
    saintDef.defaults.canvas.width === POSTER_MASTER_WIDTH,
    `Canvas width is ${POSTER_MASTER_WIDTH} px`
  );
  assert(
    saintDef.defaults.canvas.height === POSTER_MASTER_HEIGHT,
    `Canvas height is ${POSTER_MASTER_HEIGHT} px`
  );
  assert(
    Math.abs(saintDef.defaults.canvas.width / saintDef.defaults.canvas.height - POSTER_ASPECT_RATIO) < 0.001,
    "Strict 4:5 portrait aspect ratio is preserved"
  );

  // -----------------------------------------------------------
  // Suite 2: Curated Palette Presets
  // -----------------------------------------------------------
  console.log("\nSuite 2: Curated Palette Presets");

  assert(
    saintDef.palettePresets.length === 3,
    "Saint provides exactly 3 curated palette presets",
    `Found: ${saintDef.palettePresets.length}`
  );

  const saffronInk = saintDef.palettePresets.find((p) => p.id === "saffron-ink");
  assert(
    saffronInk?.primary === "#eab308" && saffronInk?.background === "#0f172a",
    "Saffron & Ink palette configured with gold (#eab308) and deep slate (#0f172a)"
  );

  const electricAzure = saintDef.palettePresets.find((p) => p.id === "electric-azure");
  assert(
    electricAzure?.primary === "#06b6d4" && electricAzure?.background === "#030712",
    "Electric Azure palette configured with cyan (#06b6d4) and pitch navy (#030712)"
  );

  const terracotta = saintDef.palettePresets.find((p) => p.id === "terracotta-pulse");
  assert(
    terracotta?.primary === "#f97316" && terracotta?.background === "#1c1917",
    "Terracotta Pulse palette configured with terracotta (#f97316) and warm stone (#1c1917)"
  );

  // Validate hex formatting across all palettes
  const hexPattern = /^#[0-9a-fA-F]{6}$/;
  let allHexValid = true;
  for (const preset of saintDef.palettePresets) {
    if (
      !hexPattern.test(preset.primary) ||
      !hexPattern.test(preset.secondary) ||
      !hexPattern.test(preset.accent) ||
      !hexPattern.test(preset.background) ||
      !hexPattern.test(preset.text)
    ) {
      allHexValid = false;
    }
  }
  assert(allHexValid, "All palette preset color tokens are valid 6-digit hex codes");

  // -----------------------------------------------------------
  // Suite 3: Layout Options & Typography Presets
  // -----------------------------------------------------------
  console.log("\nSuite 3: Layout Options & Typography Presets");

  const layoutIds = saintDef.layoutOptions.map((l) => l.id);
  assert(
    layoutIds.includes("geometric-frame") && layoutIds.includes("pattern-pulse"),
    "Supports 'geometric-frame' and 'pattern-pulse' layout treatments",
    `Found: ${layoutIds.join(", ")}`
  );

  const typoIds = saintDef.typographyPresets.map((t) => t.id);
  assert(
    typoIds.includes("bold-afrobeat") && typoIds.includes("afro-groove"),
    "Supports 'bold-afrobeat' and 'afro-groove' typography pairings",
    `Found: ${typoIds.join(", ")}`
  );

  const boldAfrobeat = saintDef.typographyPresets.find((t) => t.id === "bold-afrobeat");
  assert(
    boldAfrobeat?.displayFont === "Bebas Neue" && boldAfrobeat?.bodyFont === "Inter",
    "bold-afrobeat pairs Bebas Neue with Inter"
  );

  // -----------------------------------------------------------
  // Suite 4: Verbatim Content & Lineup Contracts
  // -----------------------------------------------------------
  console.log("\nSuite 4: Verbatim Content & Lineup Contracts");

  const defaultDoc = createDefaultPosterDocument("saint");
  assert(
    defaultDoc.content.eventTitle === "African Night (Afro)",
    "Default document event title is verbatim 'African Night (Afro)'"
  );

  assert(
    defaultDoc.content.djNames.includes("DJ Neb") &&
      defaultDoc.content.djNames.includes("DVJ Jojez"),
    "Default lineup includes resident DJs 'DJ Neb' and 'DVJ Jojez'",
    `Lineup: ${defaultDoc.content.djNames.join(", ")}`
  );

  assert(
    defaultDoc.content.primaryOffer === "Discounts on beer buckets and cocktails.",
    "Default beverage offer is verbatim 'Discounts on beer buckets and cocktails.'"
  );

  assert(
    defaultDoc.content.venueName === "Ozone Lounge",
    "Venue name defaults to 'Ozone Lounge'"
  );

  assert(
    defaultDoc.content.socialHandle === "@ozonelounge",
    "Social handle defaults to '@ozonelounge'"
  );

  // -----------------------------------------------------------
  // Suite 5: Conditional Layout Rebalancing & Schema Validity
  // -----------------------------------------------------------
  console.log("\nSuite 5: Conditional Layout Rebalancing & Schema Validity");

  // A. Canonical document validates against Zod
  const defaultParse = PosterDocumentSchema.safeParse(defaultDoc);
  assert(
    defaultParse.success,
    "Default Saint PosterDocument cleanly passes Zod schema validation"
  );

  // B. Document with blank offer (rebalanced layout)
  const blankOfferDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      primaryOffer: "",
      secondaryOffer: "",
    },
  };
  const blankOfferParse = PosterDocumentSchema.safeParse(blankOfferDoc);
  assert(
    blankOfferParse.success,
    "Document with blank offer cleanly passes schema validation"
  );

  // C. Document with multiple custom performers & custom copy lines
  const customLineupDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      djNames: ["DJ Neb", "DVJ Jojez", "DJ Karis"],
      hostNames: ["MC Jose"],
      customLines: ["Amapiano vs Afrobeats Edition", "Strictly 21+"],
    },
  };
  const customLineupParse = PosterDocumentSchema.safeParse(customLineupDoc);
  assert(
    customLineupParse.success,
    "Document with custom multi-artist lineup cleanly passes schema validation"
  );

  // D. Document with blank optional logistics (date, time, location, contact)
  const blankLogisticsDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      dateText: "",
      startTime: "",
      locationText: "",
      contactText: "",
    },
  };
  const blankLogisticsParse = PosterDocumentSchema.safeParse(blankLogisticsDoc);
  assert(
    blankLogisticsParse.success,
    "Document with blank optional logistics cleanly passes schema validation"
  );

  // -----------------------------------------------------------
  // Suite 6: Template Renderer Resolver Mapping
  // -----------------------------------------------------------
  console.log("\nSuite 6: Template Renderer Resolver Mapping");

  const resolvedRenderer = getTemplateRenderer("saint");
  assert(
    resolvedRenderer === SaintTemplate,
    "getTemplateRenderer('saint') resolves to SaintTemplate component",
    `Resolved: ${resolvedRenderer.name}`
  );

  // -----------------------------------------------------------
  // Suite 7: Multi-Format Export Filename Generation
  // -----------------------------------------------------------
  console.log("\nSuite 7: Multi-Format Export Filename Generation");

  const saintPngName = generatePosterFileName({
    day: "Tuesday",
    templateName: "Saint",
    eventTitle: defaultDoc.content.eventTitle,
    format: "png",
  });
  assert(
    saintPngName === "Ozone-Lounge-Tuesday-Saint-African-Night-Afro.png",
    "Generates clean standard PNG export name for Saint per Decision 09",
    `Got: ${saintPngName}`
  );

  const saintJpegName = generatePosterFileName({
    day: "Tuesday",
    templateName: "Saint",
    eventTitle: defaultDoc.content.eventTitle,
    format: "jpeg",
  });
  assert(
    saintJpegName === "Ozone-Lounge-Tuesday-Saint-African-Night-Afro.jpg",
    "Generates clean standard JPEG export name for Saint (.jpg extension)",
    `Got: ${saintJpegName}`
  );

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  STAGE 13 VERIFICATION COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
