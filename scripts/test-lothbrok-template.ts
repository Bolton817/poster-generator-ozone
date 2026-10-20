/**
 * Stage 16 Test Suite: Lothbrok Template (Friday Flight Fridays / Premium Nightlife / Offer-Free Rebalancing)
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-lothbrok-template.ts
 *
 * Verifies:
 * 1. Lothbrok template registry metadata and master canvas invariants (1080 x 1350, 4:5 ratio)
 * 2. Three curated palette presets (Black & Chrome, Ice Blue, Aubergine Luxe)
 * 3. Typography pairing presets (premium-sharp, nightlife-condensed)
 * 4. Layout options (hero-focus-no-offer, diagonal-split) and metallic decoration options
 * 5. Verbatim lineup & Decision 06 offer-free contracts:
 *    - DJ Lineup: 'DJ Slim D' & 'Mistabrand'
 *    - Primary offer: '' (strictly empty per brief)
 *    - Secondary offer: '' (strictly empty per brief)
 *    - Zero invented placeholder text like "No special offer provided yet"
 * 6. Conditional layout rebalancing and Zod document schema validation
 * 7. Template renderer resolver mapping (lothbrok -> LothbrokTemplate)
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
import { LothbrokTemplate } from "../src/components/poster/templates/LothbrokTemplate";
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
  console.log("  STAGE 16: LOTHBROK (FRIDAY FLIGHT) TEST SUITE");
  console.log("========================================================\n");

  const lothbrokDef = getTemplateById("lothbrok");
  assert(Boolean(lothbrokDef), "Lothbrok template definition exists in registry");

  if (!lothbrokDef) {
    console.error("FATAL: Lothbrok template missing from registry.");
    process.exit(1);
  }

  // -----------------------------------------------------------
  // Suite 1: Registry Metadata & Coordinate Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Registry Metadata & Coordinate Invariants");

  assert(lothbrokDef.id === "lothbrok", "Template ID is 'lothbrok'");
  assert(lothbrokDef.name === "Lothbrok", "Template display name is 'Lothbrok'");
  assert(lothbrokDef.dayOfWeek === 5, "Template dayOfWeek is 5 (Friday)");
  assert(lothbrokDef.dayLabel === "Friday", "Template dayLabel is 'Friday'");
  assert(
    lothbrokDef.eventTitle === "Flight Fridays",
    "Template eventTitle is verbatim 'Flight Fridays'"
  );
  assert(
    lothbrokDef.thumbnailUrl === "/template-thumbnails/lothbrok.svg",
    "Template specifies dedicated '/template-thumbnails/lothbrok.svg' thumbnail"
  );
  assert(
    lothbrokDef.defaults.canvas.width === POSTER_MASTER_WIDTH,
    `Canvas width is ${POSTER_MASTER_WIDTH} px`
  );
  assert(
    lothbrokDef.defaults.canvas.height === POSTER_MASTER_HEIGHT,
    `Canvas height is ${POSTER_MASTER_HEIGHT} px`
  );
  assert(
    Math.abs(lothbrokDef.defaults.canvas.width / lothbrokDef.defaults.canvas.height - POSTER_ASPECT_RATIO) < 0.001,
    "Strict 4:5 portrait aspect ratio is preserved"
  );

  // -----------------------------------------------------------
  // Suite 2: Curated Palette Presets
  // -----------------------------------------------------------
  console.log("\nSuite 2: Curated Palette Presets");

  assert(
    lothbrokDef.palettePresets.length === 3,
    "Lothbrok provides exactly 3 curated palette presets",
    `Found: ${lothbrokDef.palettePresets.length}`
  );

  const blackChrome = lothbrokDef.palettePresets.find((p) => p.id === "black-chrome");
  assert(Boolean(blackChrome), "Preset 'Black & Chrome' exists");
  assert(
    blackChrome?.primary.toLowerCase() === "#f8fafc" &&
      blackChrome?.background.toLowerCase() === "#020617",
    "Black & Chrome has #f8fafc primary and #020617 background"
  );

  const iceBlue = lothbrokDef.palettePresets.find((p) => p.id === "ice-blue");
  assert(Boolean(iceBlue), "Preset 'Ice Blue' exists");
  assert(
    iceBlue?.primary.toLowerCase() === "#38bdf8" &&
      iceBlue?.background.toLowerCase() === "#082f49",
    "Ice Blue has #38bdf8 primary and #082f49 background"
  );

  const aubergineLuxe = lothbrokDef.palettePresets.find((p) => p.id === "aubergine-luxe");
  assert(Boolean(aubergineLuxe), "Preset 'Aubergine Luxe' exists");
  assert(
    aubergineLuxe?.primary.toLowerCase() === "#c084fc" &&
      aubergineLuxe?.background.toLowerCase() === "#180520",
    "Aubergine Luxe has #c084fc primary and #180520 background"
  );

  // -----------------------------------------------------------
  // Suite 3: Typography Pairing Presets
  // -----------------------------------------------------------
  console.log("\nSuite 3: Typography Pairing Presets");

  assert(
    lothbrokDef.typographyPresets.length >= 2,
    "Lothbrok provides at least 2 distinct typography pairing presets"
  );

  const typoIds = lothbrokDef.typographyPresets.map((t) => t.id);
  assert(
    typoIds.includes("premium-sharp") && typoIds.includes("nightlife-condensed"),
    "Supports 'premium-sharp' and 'nightlife-condensed' typography pairings",
    `Found: ${typoIds.join(", ")}`
  );

  const premiumSharp = lothbrokDef.typographyPresets.find((t) => t.id === "premium-sharp");
  assert(
    premiumSharp?.displayFont === "Bebas Neue" && premiumSharp?.bodyFont === "Inter",
    "premium-sharp pairs Bebas Neue with Inter"
  );

  const nightlifeCondensed = lothbrokDef.typographyPresets.find((t) => t.id === "nightlife-condensed");
  assert(
    nightlifeCondensed?.displayFont === "Source Sans 3" && nightlifeCondensed?.labelFont === "Bebas Neue",
    "nightlife-condensed pairs Source Sans 3 with Bebas Neue labels"
  );

  // -----------------------------------------------------------
  // Suite 4: Layout & Decoration Options
  // -----------------------------------------------------------
  console.log("\nSuite 4: Layout & Decoration Options");

  const layoutIds = lothbrokDef.layoutOptions.map((l) => l.id);
  assert(
    layoutIds.includes("hero-focus-no-offer") && layoutIds.includes("diagonal-split"),
    "Supports both 'hero-focus-no-offer' and 'diagonal-split' layout treatments",
    `Found: ${layoutIds.join(", ")}`
  );

  assert(
    lothbrokDef.defaults.styling.layoutOptionId === "hero-focus-no-offer",
    "Default layout option is 'hero-focus-no-offer' (Decision 06)"
  );

  assert(
    lothbrokDef.defaults.styling.decorationOptions?.metallicAccents === true,
    "Default decoration enables metallic accents"
  );

  // -----------------------------------------------------------
  // Suite 5: Verbatim Lineup & Decision 06 Offer-Free Contracts
  // -----------------------------------------------------------
  console.log("\nSuite 5: Verbatim Lineup & Decision 06 Offer-Free Contracts");

  const defaultDoc = createDefaultPosterDocument("lothbrok");
  assert(
    defaultDoc.content.eventTitle === "Flight Fridays",
    "Default document event title is verbatim 'Flight Fridays'"
  );

  assert(
    defaultDoc.content.djNames.includes("DJ Slim D") &&
      defaultDoc.content.djNames.includes("Mistabrand"),
    "Default lineup includes resident DJs 'DJ Slim D' and 'Mistabrand'",
    `Lineup: ${defaultDoc.content.djNames.join(", ")}`
  );

  assert(
    defaultDoc.content.primaryOffer === "",
    "Enforces Decision 06: default primary offer is strictly empty string"
  );

  assert(
    defaultDoc.content.secondaryOffer === "",
    "Enforces Decision 06: default secondary offer is strictly empty string"
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

  // A. Canonical default document (offer-free) validates against Zod
  const defaultParse = PosterDocumentSchema.safeParse(defaultDoc);
  assert(
    defaultParse.success,
    "Default offer-free Lothbrok PosterDocument cleanly passes Zod schema validation"
  );

  // B. Document with optional custom promotion populated
  const customOfferDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      primaryOffer: "Champagne bottle service discounts before 11 PM.",
      secondaryOffer: "Complimentary welcome shots for VIP booth reservations.",
    },
  };
  const customOfferParse = PosterDocumentSchema.safeParse(customOfferDoc);
  assert(
    customOfferParse.success,
    "Document with custom populated promotions cleanly passes schema validation"
  );

  // C. Document with custom multi-artist lineup
  const customLineupDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      djNames: ["DJ Slim D", "Mistabrand", "DJ Redrum"],
      hostNames: ["Hypeman Sean"],
      customLines: ["Amapiano & Afro-Tech Flight", "Strictly 21+"],
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
  // Suite 7: Template Renderer Resolver Mapping
  // -----------------------------------------------------------
  console.log("\nSuite 7: Template Renderer Resolver Mapping");

  const resolvedRenderer = getTemplateRenderer("lothbrok");
  assert(
    resolvedRenderer === LothbrokTemplate,
    "getTemplateRenderer('lothbrok') resolves to LothbrokTemplate component",
    `Resolved: ${resolvedRenderer.name}`
  );

  // -----------------------------------------------------------
  // Suite 8: Multi-Format Export Filename Generation
  // -----------------------------------------------------------
  console.log("\nSuite 8: Multi-Format Export Filename Generation");

  const lothbrokPngName = generatePosterFileName({
    day: "Friday",
    templateName: "Lothbrok",
    eventTitle: defaultDoc.content.eventTitle,
    format: "png",
  });
  assert(
    lothbrokPngName === "Ozone-Lounge-Friday-Lothbrok-Flight-Fridays.png",
    "Generates clean standard PNG export name for Lothbrok per Decision 09",
    `Got: ${lothbrokPngName}`
  );

  const lothbrokJpegName = generatePosterFileName({
    day: "Friday",
    templateName: "Lothbrok",
    eventTitle: defaultDoc.content.eventTitle,
    format: "jpeg",
  });
  assert(
    lothbrokJpegName === "Ozone-Lounge-Friday-Lothbrok-Flight-Fridays.jpg",
    "Generates clean standard JPEG export name for Lothbrok (.jpg extension)",
    `Got: ${lothbrokJpegName}`
  );

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  STAGE 16 VERIFICATION COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
