/**
 * Stage 15 Test Suite: Shelby Template (Thursday Karaoke Night / Stage / Performers)
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-shelby-template.ts
 *
 * Verifies:
 * 1. Shelby template registry metadata and master canvas invariants (1080 x 1350, 4:5 ratio)
 * 2. Three curated palette presets (Stage Crimson, Midnight Violet, Spotlight Gold)
 * 3. Typography pairing presets (theatrical-stage, broadway-lights)
 * 4. Layout options (spotlight-cone, split-role-stage) and decoration options
 * 5. Verbatim copy & strict role separation contracts:
 *    - Hosts: 'Bellah Harriet' & 'Tito Wagithomo'
 *    - DJ: 'DJ Fab'
 *    - Primary Singer Offer: 'Free tequila shots for singers.'
 *    - Secondary Spirits Offer: 'Discounts on gin, rum and vodka.'
 * 6. Conditional layout rebalancing and Zod document schema validation
 * 7. Template renderer resolver mapping (shelby -> ShelbyTemplate)
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
import { ShelbyTemplate } from "../src/components/poster/templates/ShelbyTemplate";
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
  console.log("  STAGE 15: SHELBY (THURSDAY KARAOKE) TEST SUITE");
  console.log("========================================================\n");

  const shelbyDef = getTemplateById("shelby");
  assert(Boolean(shelbyDef), "Shelby template definition exists in registry");

  if (!shelbyDef) {
    console.error("FATAL: Shelby template missing from registry.");
    process.exit(1);
  }

  // -----------------------------------------------------------
  // Suite 1: Registry Metadata & Coordinate Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Registry Metadata & Coordinate Invariants");

  assert(shelbyDef.id === "shelby", "Template ID is 'shelby'");
  assert(shelbyDef.name === "Shelby", "Template display name is 'Shelby'");
  assert(shelbyDef.dayOfWeek === 4, "Template dayOfWeek is 4 (Thursday)");
  assert(shelbyDef.dayLabel === "Thursday", "Template dayLabel is 'Thursday'");
  assert(
    shelbyDef.eventTitle === "Karaoke Night",
    "Template eventTitle is verbatim 'Karaoke Night'"
  );
  assert(
    shelbyDef.thumbnailUrl === "/template-thumbnails/shelby.svg",
    "Template specifies dedicated '/template-thumbnails/shelby.svg' thumbnail"
  );
  assert(
    shelbyDef.defaults.canvas.width === POSTER_MASTER_WIDTH,
    `Canvas width is ${POSTER_MASTER_WIDTH} px`
  );
  assert(
    shelbyDef.defaults.canvas.height === POSTER_MASTER_HEIGHT,
    `Canvas height is ${POSTER_MASTER_HEIGHT} px`
  );
  assert(
    Math.abs(shelbyDef.defaults.canvas.width / shelbyDef.defaults.canvas.height - POSTER_ASPECT_RATIO) < 0.001,
    "Strict 4:5 portrait aspect ratio is preserved"
  );

  // -----------------------------------------------------------
  // Suite 2: Curated Palette Presets
  // -----------------------------------------------------------
  console.log("\nSuite 2: Curated Palette Presets");

  assert(
    shelbyDef.palettePresets.length === 3,
    "Shelby provides exactly 3 curated palette presets",
    `Found: ${shelbyDef.palettePresets.length}`
  );

  const stageCrimson = shelbyDef.palettePresets.find((p) => p.id === "stage-crimson");
  assert(Boolean(stageCrimson), "Preset 'Stage Crimson' exists");
  assert(
    stageCrimson?.primary.toLowerCase() === "#e11d48" &&
      stageCrimson?.background.toLowerCase() === "#120206",
    "Stage Crimson has #e11d48 primary and #120206 background"
  );

  const midnightViolet = shelbyDef.palettePresets.find((p) => p.id === "midnight-violet");
  assert(Boolean(midnightViolet), "Preset 'Midnight Violet' exists");
  assert(
    midnightViolet?.primary.toLowerCase() === "#8b5cf6" &&
      midnightViolet?.background.toLowerCase() === "#0c061a",
    "Midnight Violet has #8b5cf6 primary and #0c061a background"
  );

  const spotlightGold = shelbyDef.palettePresets.find((p) => p.id === "spotlight-gold");
  assert(Boolean(spotlightGold), "Preset 'Spotlight Gold' exists");
  assert(
    spotlightGold?.primary.toLowerCase() === "#eab308" &&
      spotlightGold?.background.toLowerCase() === "#141003",
    "Spotlight Gold has #eab308 primary and #141003 background"
  );

  // -----------------------------------------------------------
  // Suite 3: Typography Pairing Presets
  // -----------------------------------------------------------
  console.log("\nSuite 3: Typography Pairing Presets");

  assert(
    shelbyDef.typographyPresets.length >= 2,
    "Shelby provides at least 2 distinct typography pairing presets"
  );

  const typoIds = shelbyDef.typographyPresets.map((t) => t.id);
  assert(
    typoIds.includes("theatrical-stage") && typoIds.includes("broadway-lights"),
    "Supports 'theatrical-stage' and 'broadway-lights' typography pairings",
    `Found: ${typoIds.join(", ")}`
  );

  const theatricalStage = shelbyDef.typographyPresets.find((t) => t.id === "theatrical-stage");
  assert(
    theatricalStage?.displayFont === "Bebas Neue" && theatricalStage?.bodyFont === "Inter",
    "theatrical-stage pairs Bebas Neue with Inter"
  );

  const broadwayLights = shelbyDef.typographyPresets.find((t) => t.id === "broadway-lights");
  assert(
    broadwayLights?.displayFont === "Source Sans 3" && broadwayLights?.labelFont === "Bebas Neue",
    "broadway-lights pairs Source Sans 3 with Bebas Neue labels"
  );

  // -----------------------------------------------------------
  // Suite 4: Layout & Decoration Options
  // -----------------------------------------------------------
  console.log("\nSuite 4: Layout & Decoration Options");

  const layoutIds = shelbyDef.layoutOptions.map((l) => l.id);
  assert(
    layoutIds.includes("spotlight-cone") && layoutIds.includes("split-role-stage"),
    "Supports both 'spotlight-cone' and 'split-role-stage' layout treatments",
    `Found: ${layoutIds.join(", ")}`
  );

  assert(
    shelbyDef.defaults.styling.decorationOptions?.spotlightAngle === 45,
    "Default spotlight angle is 45 degrees"
  );

  // -----------------------------------------------------------
  // Suite 5: Verbatim Content & Strict Role Separation
  // -----------------------------------------------------------
  console.log("\nSuite 5: Verbatim Content & Strict Role Separation");

  const defaultDoc = createDefaultPosterDocument("shelby");
  assert(
    defaultDoc.content.eventTitle === "Karaoke Night",
    "Default document event title is verbatim 'Karaoke Night'"
  );

  assert(
    defaultDoc.content.hostNames.includes("Bellah Harriet") &&
      defaultDoc.content.hostNames.includes("Tito Wagithomo"),
    "Default hosts include 'Bellah Harriet' and 'Tito Wagithomo'",
    `Hosts: ${defaultDoc.content.hostNames.join(", ")}`
  );

  assert(
    defaultDoc.content.djNames.includes("DJ Fab"),
    "Default DJ includes 'DJ Fab'",
    `DJs: ${defaultDoc.content.djNames.join(", ")}`
  );

  assert(
    defaultDoc.content.hostNames.length > 0 && defaultDoc.content.djNames.length > 0,
    "Host names and DJ names are kept in separate fields per Blueprint 4.5"
  );

  assert(
    defaultDoc.content.primaryOffer === "Free tequila shots for singers.",
    "Default primary offer is verbatim 'Free tequila shots for singers.'"
  );

  assert(
    defaultDoc.content.secondaryOffer === "Discounts on gin, rum and vodka.",
    "Default secondary offer is verbatim 'Discounts on gin, rum and vodka.'"
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
    "Default Shelby PosterDocument cleanly passes Zod schema validation"
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

  // C. Document with DJ only (no hosts)
  const djOnlyDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      hostNames: [],
    },
  };
  const djOnlyParse = PosterDocumentSchema.safeParse(djOnlyDoc);
  assert(
    djOnlyParse.success,
    "Document with DJ only (hosts omitted) cleanly passes schema validation"
  );

  // D. Document with Hosts only (no DJ)
  const hostsOnlyDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      djNames: [],
    },
  };
  const hostsOnlyParse = PosterDocumentSchema.safeParse(hostsOnlyDoc);
  assert(
    hostsOnlyParse.success,
    "Document with Hosts only (DJ omitted) cleanly passes schema validation"
  );

  // E. Document with custom performers & custom copy lines
  const customPerformersDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      hostNames: ["Bellah Harriet", "Tito Wagithomo", "Guest Host Amber"],
      djNames: ["DJ Fab", "DVJ Jojez"],
      customLines: ["Duet Battles & Cash Prizes", "Strictly 21+"],
    },
  };
  const customPerformersParse = PosterDocumentSchema.safeParse(customPerformersDoc);
  assert(
    customPerformersParse.success,
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

  const resolvedRenderer = getTemplateRenderer("shelby");
  assert(
    resolvedRenderer === ShelbyTemplate,
    "getTemplateRenderer('shelby') resolves to ShelbyTemplate component",
    `Resolved: ${resolvedRenderer.name}`
  );

  // -----------------------------------------------------------
  // Suite 8: Multi-Format Export Filename Generation
  // -----------------------------------------------------------
  console.log("\nSuite 8: Multi-Format Export Filename Generation");

  const shelbyPngName = generatePosterFileName({
    day: "Thursday",
    templateName: "Shelby",
    eventTitle: defaultDoc.content.eventTitle,
    format: "png",
  });
  assert(
    shelbyPngName === "Ozone-Lounge-Thursday-Shelby-Karaoke-Night.png",
    "Generates clean standard PNG export name for Shelby per Decision 09",
    `Got: ${shelbyPngName}`
  );

  const shelbyJpegName = generatePosterFileName({
    day: "Thursday",
    templateName: "Shelby",
    eventTitle: defaultDoc.content.eventTitle,
    format: "jpeg",
  });
  assert(
    shelbyJpegName === "Ozone-Lounge-Thursday-Shelby-Karaoke-Night.jpg",
    "Generates clean standard JPEG export name for Shelby (.jpg extension)",
    `Got: ${shelbyJpegName}`
  );

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  STAGE 15 VERIFICATION COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test execution error:", err);
  process.exit(1);
});
