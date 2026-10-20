/**
 * Stage 14 Test Suite: Lannister Template (Wednesday Groovy Wednesday / Disco / Dual-offer)
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-lannister-template.ts
 *
 * Verifies:
 * 1. Lannister template registry metadata and master canvas invariants (1080 x 1350, 4:5 ratio)
 * 2. Three curated palette presets (Ultraviolet Club, Lime & Magenta, Cyan After Dark)
 * 3. Typography pairing presets (disco-expanded, neon-punch)
 * 4. Layout options (neon-glow-center, separated-offer-card) and glow strength presets
 * 5. Verbatim copy & strict dual-offer contracts:
 *    - Primary: 'Free koroga chicken on the house.'
 *    - Secondary: 'Discounts on whiskey bottles, cognac and beer buckets.'
 *    - Lineup: 'DJ Donben & DJ Vin'
 * 6. Conditional layout rebalancing and Zod document schema validation
 * 7. Template renderer resolver mapping (lannister -> LannisterTemplate)
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
import { LannisterTemplate } from "../src/components/poster/templates/LannisterTemplate";
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
  console.log("  STAGE 14: LANNISTER (WEDNESDAY DISCO) TEST SUITE");
  console.log("========================================================\n");

  const lannisterDef = getTemplateById("lannister");
  assert(Boolean(lannisterDef), "Lannister template definition exists in registry");

  if (!lannisterDef) {
    console.error("FATAL: Lannister template missing from registry.");
    process.exit(1);
  }

  // -----------------------------------------------------------
  // Suite 1: Registry Metadata & Coordinate Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Registry Metadata & Coordinate Invariants");

  assert(lannisterDef.id === "lannister", "Template ID is 'lannister'");
  assert(lannisterDef.name === "Lannister", "Template display name is 'Lannister'");
  assert(lannisterDef.dayOfWeek === 3, "Template dayOfWeek is 3 (Wednesday)");
  assert(lannisterDef.dayLabel === "Wednesday", "Template dayLabel is 'Wednesday'");
  assert(
    lannisterDef.eventTitle === "Groovy Wednesday",
    "Template eventTitle is verbatim 'Groovy Wednesday'"
  );
  assert(
    lannisterDef.thumbnailUrl === "/template-thumbnails/lannister.svg",
    "Template specifies dedicated '/template-thumbnails/lannister.svg' thumbnail"
  );
  assert(
    lannisterDef.defaults.canvas.width === POSTER_MASTER_WIDTH,
    `Canvas width is ${POSTER_MASTER_WIDTH} px`
  );
  assert(
    lannisterDef.defaults.canvas.height === POSTER_MASTER_HEIGHT,
    `Canvas height is ${POSTER_MASTER_HEIGHT} px`
  );
  assert(
    Math.abs(lannisterDef.defaults.canvas.width / lannisterDef.defaults.canvas.height - POSTER_ASPECT_RATIO) < 0.001,
    "Strict 4:5 portrait aspect ratio is preserved"
  );

  // -----------------------------------------------------------
  // Suite 2: Curated Palette Presets
  // -----------------------------------------------------------
  console.log("\nSuite 2: Curated Palette Presets");

  assert(
    lannisterDef.palettePresets.length === 3,
    "Lannister provides exactly 3 curated palette presets",
    `Found: ${lannisterDef.palettePresets.length}`
  );

  const ultraviolet = lannisterDef.palettePresets.find((p) => p.id === "ultraviolet-club");
  assert(Boolean(ultraviolet), "Preset 'Ultraviolet Club' exists");
  assert(
    ultraviolet?.primary.toLowerCase() === "#a855f7" &&
      ultraviolet?.background.toLowerCase() === "#090514",
    "Ultraviolet Club has #a855f7 primary and #090514 background"
  );

  const limeMagenta = lannisterDef.palettePresets.find((p) => p.id === "lime-magenta");
  assert(Boolean(limeMagenta), "Preset 'Lime & Magenta' exists");
  assert(
    limeMagenta?.primary.toLowerCase() === "#84cc16" &&
      limeMagenta?.secondary.toLowerCase() === "#ec4899",
    "Lime & Magenta has #84cc16 primary and #ec4899 secondary"
  );

  const cyanAfterDark = lannisterDef.palettePresets.find((p) => p.id === "cyan-after-dark");
  assert(Boolean(cyanAfterDark), "Preset 'Cyan After Dark' exists");
  assert(
    cyanAfterDark?.primary.toLowerCase() === "#06b6d4" &&
      cyanAfterDark?.background.toLowerCase() === "#041017",
    "Cyan After Dark has #06b6d4 primary and #041017 background"
  );

  // -----------------------------------------------------------
  // Suite 3: Typography Pairing Presets
  // -----------------------------------------------------------
  console.log("\nSuite 3: Typography Pairing Presets");

  assert(
    lannisterDef.typographyPresets.length >= 2,
    "Lannister provides at least 2 distinct typography pairing presets"
  );

  const typoIds = lannisterDef.typographyPresets.map((t) => t.id);
  assert(
    typoIds.includes("disco-expanded") && typoIds.includes("neon-punch"),
    "Supports 'disco-expanded' and 'neon-punch' typography pairings",
    `Found: ${typoIds.join(", ")}`
  );

  const discoExpanded = lannisterDef.typographyPresets.find((t) => t.id === "disco-expanded");
  assert(
    discoExpanded?.displayFont === "Bebas Neue" && discoExpanded?.bodyFont === "Inter",
    "disco-expanded pairs Bebas Neue with Inter"
  );

  const neonPunch = lannisterDef.typographyPresets.find((t) => t.id === "neon-punch");
  assert(
    neonPunch?.displayFont === "Source Sans 3" && neonPunch?.labelFont === "Bebas Neue",
    "neon-punch pairs Source Sans 3 with Bebas Neue labels"
  );

  // -----------------------------------------------------------
  // Suite 4: Layout & Decoration Options
  // -----------------------------------------------------------
  console.log("\nSuite 4: Layout & Decoration Options");

  const layoutIds = lannisterDef.layoutOptions.map((l) => l.id);
  assert(
    layoutIds.includes("neon-glow-center") && layoutIds.includes("separated-offer-card"),
    "Supports both 'neon-glow-center' and 'separated-offer-card' layout treatments",
    `Found: ${layoutIds.join(", ")}`
  );

  assert(
    lannisterDef.defaults.styling.decorationOptions?.glowStrength === "high",
    "Default glow strength is 'high'"
  );

  // -----------------------------------------------------------
  // Suite 5: Verbatim Content & Dual-Offer Contracts
  // -----------------------------------------------------------
  console.log("\nSuite 5: Verbatim Content & Dual-Offer Contracts");

  const defaultDoc = createDefaultPosterDocument("lannister");
  assert(
    defaultDoc.content.eventTitle === "Groovy Wednesday",
    "Default document event title is verbatim 'Groovy Wednesday'"
  );

  assert(
    defaultDoc.content.djNames.includes("DJ Donben") &&
      defaultDoc.content.djNames.includes("DJ Vin"),
    "Default lineup includes resident DJs 'DJ Donben' and 'DJ Vin'",
    `Lineup: ${defaultDoc.content.djNames.join(", ")}`
  );

  assert(
    defaultDoc.content.primaryOffer === "Free koroga chicken on the house.",
    "Default primary offer is verbatim 'Free koroga chicken on the house.'"
  );

  assert(
    defaultDoc.content.secondaryOffer === "Discounts on whiskey bottles, cognac and beer buckets.",
    "Default secondary offer is verbatim 'Discounts on whiskey bottles, cognac and beer buckets.'"
  );

  assert(
    defaultDoc.content.primaryOffer !== defaultDoc.content.secondaryOffer,
    "Primary and secondary offers are distinct and separated"
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
  // Suite 6: Conditional Layout Rebalancing & Schema Validity
  // -----------------------------------------------------------
  console.log("\nSuite 6: Conditional Layout Rebalancing & Schema Validity");

  // A. Canonical document validates against Zod
  const defaultParse = PosterDocumentSchema.safeParse(defaultDoc);
  assert(
    defaultParse.success,
    "Default Lannister PosterDocument cleanly passes Zod schema validation"
  );

  // B. Document with blank offers (rebalanced layout)
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
    "Document with blank offers cleanly passes schema validation"
  );

  // C. Document with primary-only offer
  const primaryOnlyDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      secondaryOffer: "",
    },
  };
  const primaryOnlyParse = PosterDocumentSchema.safeParse(primaryOnlyDoc);
  assert(
    primaryOnlyParse.success,
    "Document with primary-only offer cleanly passes schema validation"
  );

  // D. Document with secondary-only offer
  const secondaryOnlyDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      primaryOffer: "",
    },
  };
  const secondaryOnlyParse = PosterDocumentSchema.safeParse(secondaryOnlyDoc);
  assert(
    secondaryOnlyParse.success,
    "Document with secondary-only offer cleanly passes schema validation"
  );

  // E. Document with custom performers & custom copy lines
  const customLineupDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      djNames: ["DJ Donben", "DJ Vin", "DJ Burn"],
      hostNames: ["Hypeman Tony"],
      customLines: ["70s & 80s Vinyl Classics", "Dress Code: Disco Chic"],
    },
  };
  const customLineupParse = PosterDocumentSchema.safeParse(customLineupDoc);
  assert(
    customLineupParse.success,
    "Document with custom multi-artist lineup cleanly passes schema validation"
  );

  // F. Document with blank optional logistics (date, time, location, contact)
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
  // Suite 7: Template Renderer Resolver Mapping
  // -----------------------------------------------------------
  console.log("\nSuite 7: Template Renderer Resolver Mapping");

  const resolvedRenderer = getTemplateRenderer("lannister");
  assert(
    resolvedRenderer === LannisterTemplate,
    "getTemplateRenderer('lannister') resolves to LannisterTemplate component",
    `Resolved: ${resolvedRenderer.name}`
  );

  // -----------------------------------------------------------
  // Suite 8: Multi-Format Export Filename Generation
  // -----------------------------------------------------------
  console.log("\nSuite 8: Multi-Format Export Filename Generation");

  const lannisterPngName = generatePosterFileName({
    day: "Wednesday",
    templateName: "Lannister",
    eventTitle: defaultDoc.content.eventTitle,
    format: "png",
  });
  assert(
    lannisterPngName === "Ozone-Lounge-Wednesday-Lannister-Groovy-Wednesday.png",
    "Generates clean standard PNG export name for Lannister per Decision 09",
    `Got: ${lannisterPngName}`
  );

  const lannisterJpegName = generatePosterFileName({
    day: "Wednesday",
    templateName: "Lannister",
    eventTitle: defaultDoc.content.eventTitle,
    format: "jpeg",
  });
  assert(
    lannisterJpegName === "Ozone-Lounge-Wednesday-Lannister-Groovy-Wednesday.jpg",
    "Generates clean standard JPEG export name for Lannister (.jpg extension)",
    `Got: ${lannisterJpegName}`
  );

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  STAGE 14 VERIFICATION COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
