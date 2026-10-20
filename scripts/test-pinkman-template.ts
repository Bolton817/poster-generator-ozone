/**
 * Stage 18 Test Suite: Pinkman Template (Sunday Old Skool Sundays / Nostalgic Vinyl / Vintage Beer Bucket)
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-pinkman-template.ts
 *
 * Verifies:
 * 1. Pinkman template registry metadata and master canvas invariants (1080 x 1350, 4:5 ratio)
 * 2. Three curated palette presets (Amber Memory, Faded Teal, Brick & Cream)
 * 3. Typography pairing presets (retro-vintage, analog-classic)
 * 4. Layout options (vinyl-grooves, retro-cassette) and nostalgic decoration options
 * 5. Verbatim lineup & Sunday beverage offer contracts:
 *    - DJ Lineup: 'DJ Ngash'
 *    - Primary offer: 'Discounts on beer buckets.'
 *    - Secondary offer: ''
 *    - Graceful offer container collapse when cleared
 *    - Zero invented placeholder text like "No special offer provided yet"
 * 6. Conditional layout rebalancing and Zod document schema validation
 * 7. Template renderer resolver mapping (pinkman -> PinkmanTemplate)
 * 8. Multi-format export filename generation per Decision 09
 * 9. React SSR DOM structural rendering and data-testid verification
 * 10. Fleet-wide milestone: All 7 daily templates custom-mapped (zero placeholders remaining)
 */

import React from "react";
import { renderToString } from "react-dom/server";
import {
  POSTER_MASTER_WIDTH,
  POSTER_MASTER_HEIGHT,
  POSTER_ASPECT_RATIO,
} from "../src/features/canvas/constants";
import {
  getTemplateById,
  createDefaultPosterDocument,
  ORDERED_TEMPLATE_IDS,
} from "../src/features/templates/registry";
import {
  getTemplateRenderer,
} from "../src/features/templates/renderers";
import { PinkmanTemplate } from "../src/components/poster/templates/PinkmanTemplate";
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
  console.log("  STAGE 18: PINKMAN (SUNDAY OLD SKOOL) TEST SUITE");
  console.log("========================================================\n");

  const pinkmanDef = getTemplateById("pinkman");
  assert(Boolean(pinkmanDef), "Pinkman template definition exists in registry");

  if (!pinkmanDef) {
    console.error("FATAL: Pinkman template missing from registry.");
    process.exit(1);
  }

  // -----------------------------------------------------------
  // Suite 1: Registry Metadata & Coordinate Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Registry Metadata & Coordinate Invariants");

  assert(pinkmanDef.id === "pinkman", "Template ID is 'pinkman'");
  assert(pinkmanDef.name === "Pinkman", "Template display name is 'Pinkman'");
  assert(pinkmanDef.dayOfWeek === 0, "Template dayOfWeek is 0 (Sunday)");
  assert(pinkmanDef.dayLabel === "Sunday", "Template dayLabel is 'Sunday'");
  assert(
    pinkmanDef.eventTitle === "Old Skool Sundays",
    "Template eventTitle is verbatim 'Old Skool Sundays'"
  );
  assert(
    pinkmanDef.thumbnailUrl === "/template-thumbnails/pinkman.svg",
    "Template specifies dedicated '/template-thumbnails/pinkman.svg' thumbnail"
  );
  assert(
    pinkmanDef.tag === "Best for Old Skool Sundays",
    "Template tag is 'Best for Old Skool Sundays'"
  );
  assert(
    pinkmanDef.defaults.canvas.width === POSTER_MASTER_WIDTH,
    `Master canvas width equals ${POSTER_MASTER_WIDTH}`
  );
  assert(
    pinkmanDef.defaults.canvas.height === POSTER_MASTER_HEIGHT,
    `Master canvas height equals ${POSTER_MASTER_HEIGHT}`
  );
  assert(
    pinkmanDef.defaults.canvas.width / pinkmanDef.defaults.canvas.height === POSTER_ASPECT_RATIO,
    "Master canvas aspect ratio is exactly 4:5 (0.8)"
  );

  // -----------------------------------------------------------
  // Suite 2: Three Curated Palette Presets
  // -----------------------------------------------------------
  console.log("\nSuite 2: Three Curated Palette Presets");

  assert(pinkmanDef.palettePresets.length === 3, "Exactly 3 curated palette presets provided");

  const amber = pinkmanDef.palettePresets.find((p) => p.id === "amber-memory");
  assert(Boolean(amber), "Preset 'amber-memory' exists");
  if (amber) {
    assert(amber.primary === "#d97706", "Amber Memory primary is warm amber-gold #d97706");
    assert(amber.secondary === "#b45309", "Amber Memory secondary is chestnut #b45309");
    assert(amber.accent === "#f59e0b", "Amber Memory accent is bright amber #f59e0b");
    assert(amber.background === "#1c1407", "Amber Memory background is vintage sepia #1c1407");
    assert(amber.text === "#fef3c7", "Amber Memory text is warm cream #fef3c7");
  }

  const teal = pinkmanDef.palettePresets.find((p) => p.id === "faded-teal");
  assert(Boolean(teal), "Preset 'faded-teal' exists");
  if (teal) {
    assert(teal.primary === "#14b8a6", "Faded Teal primary is vintage teal #14b8a6");
    assert(teal.secondary === "#0f766e", "Faded Teal secondary is deep teal #0f766e");
    assert(teal.background === "#041a18", "Faded Teal background is retro dusk #041a18");
  }

  const brick = pinkmanDef.palettePresets.find((p) => p.id === "brick-cream");
  assert(Boolean(brick), "Preset 'brick-cream' exists");
  if (brick) {
    assert(brick.primary === "#dc2626", "Brick & Cream primary is terracotta brick #dc2626");
    assert(brick.secondary === "#ea580c", "Brick & Cream secondary is burnt orange #ea580c");
    assert(brick.background === "#1a0808", "Brick & Cream background is dark espresso #1a0808");
  }

  // -----------------------------------------------------------
  // Suite 3: Typography Presets & Layout Options
  // -----------------------------------------------------------
  console.log("\nSuite 3: Typography Presets & Layout Options");

  assert(
    pinkmanDef.typographyPresets.length >= 2,
    "At least 2 distinct typography presets provided"
  );
  const retroVintage = pinkmanDef.typographyPresets.find((t) => t.id === "retro-vintage");
  assert(Boolean(retroVintage), "Typography preset 'retro-vintage' exists");
  if (retroVintage) {
    assert(retroVintage.displayFont === "Bebas Neue", "Retro Vintage displayFont is 'Bebas Neue'");
    assert(retroVintage.bodyFont === "Inter", "Retro Vintage bodyFont is 'Inter'");
  }

  const analogClassic = pinkmanDef.typographyPresets.find((t) => t.id === "analog-classic");
  assert(Boolean(analogClassic), "Typography preset 'analog-classic' exists");
  if (analogClassic) {
    assert(analogClassic.displayFont === "Source Sans 3", "Analog Classic displayFont is 'Source Sans 3'");
    assert(analogClassic.bodyFont === "Inter", "Analog Classic bodyFont is 'Inter'");
  }

  assert(pinkmanDef.layoutOptions.length >= 2, "At least 2 layout options defined");
  const vinylGrooves = pinkmanDef.layoutOptions.find((l) => l.id === "vinyl-grooves");
  const retroCassette = pinkmanDef.layoutOptions.find((l) => l.id === "retro-cassette");
  assert(Boolean(vinylGrooves), "Layout option 'vinyl-grooves' exists");
  assert(Boolean(retroCassette), "Layout option 'retro-cassette' exists");

  assert(
    pinkmanDef.defaults.styling.decorationOptions?.vinylRecord === true,
    "Default decorationOptions enables vinylRecord"
  );
  assert(
    pinkmanDef.defaults.styling.decorationOptions?.vintageGrooves === true,
    "Default decorationOptions enables vintageGrooves"
  );

  // -----------------------------------------------------------
  // Suite 4: Verbatim Lineup & Beverage Offer Contracts
  // -----------------------------------------------------------
  console.log("\nSuite 4: Verbatim Lineup & Beverage Offer Contracts");

  const defaultContent = pinkmanDef.defaults.content;
  assert(
    defaultContent.djNames.length === 1 && defaultContent.djNames[0] === "DJ Ngash",
    "DJ Lineup defaults verbatim to ['DJ Ngash'] per source brief"
  );
  assert(
    defaultContent.primaryOffer === "Discounts on beer buckets.",
    "Primary offer is verbatim 'Discounts on beer buckets.'"
  );
  assert(
    defaultContent.secondaryOffer === "",
    "Secondary offer defaults to empty string"
  );

  // -----------------------------------------------------------
  // Suite 5: Zod Schema Validation & Default Document Generation
  // -----------------------------------------------------------
  console.log("\nSuite 5: Zod Schema Validation & Default Document Generation");

  const defaultDoc = createDefaultPosterDocument("pinkman");
  const parseResult = PosterDocumentSchema.safeParse(defaultDoc);
  assert(parseResult.success, "createDefaultPosterDocument('pinkman') satisfies PosterDocumentSchema");

  if (!parseResult.success) {
    console.error("Zod Schema Errors:", parseResult.error.format());
  }

  // Verify custom document with secondary offer
  const customDoc = {
    ...defaultDoc,
    styling: {
      ...defaultDoc.styling,
      paletteId: "faded-teal",
      layoutOptionId: "retro-cassette",
    },
    content: {
      ...defaultDoc.content,
      secondaryOffer: "Beer Bucket + Wings Combo Available",
    },
  };
  const customResult = PosterDocumentSchema.safeParse(customDoc);
  assert(customResult.success, "Customized Pinkman document satisfies PosterDocumentSchema");

  // -----------------------------------------------------------
  // Suite 6: Template Renderer Resolver Mapping
  // -----------------------------------------------------------
  console.log("\nSuite 6: Template Renderer Resolver Mapping");

  const Renderer = getTemplateRenderer("pinkman");
  assert(Boolean(Renderer), "Renderer for 'pinkman' resolved from renderers registry");
  assert(
    Renderer === PinkmanTemplate,
    "Renderer for 'pinkman' resolves strictly to PinkmanTemplate component"
  );

  // -----------------------------------------------------------
  // Suite 7: Export Filename Generation
  // -----------------------------------------------------------
  console.log("\nSuite 7: Export Filename Generation");

  const pngName = generatePosterFileName({
    day: defaultDoc.content.dayLabel,
    templateName: "Pinkman",
    eventTitle: defaultDoc.content.eventTitle,
    format: "png",
  });
  assert(
    pngName === "Ozone-Lounge-Sunday-Pinkman-Old-Skool-Sundays.png",
    `PNG export filename generates correctly (${pngName})`
  );

  const jpgName = generatePosterFileName({
    day: defaultDoc.content.dayLabel,
    templateName: "Pinkman",
    eventTitle: defaultDoc.content.eventTitle,
    format: "jpeg",
  });
  assert(
    jpgName === "Ozone-Lounge-Sunday-Pinkman-Old-Skool-Sundays.jpg",
    `JPEG export filename generates correctly (${jpgName})`
  );

  // -----------------------------------------------------------
  // Suite 8: SSR DOM Verification & Offer Handling
  // -----------------------------------------------------------
  console.log("\nSuite 8: SSR DOM Verification & Offer Handling");

  // Case A: Default Render with Offer & Performer
  const htmlDefault = renderToString(React.createElement(PinkmanTemplate, { document: defaultDoc }));
  assert(
    htmlDefault.includes('data-testid="pinkman-template-root"'),
    "Pinkman root container renders with data-testid='pinkman-template-root'"
  );
  assert(
    htmlDefault.toLowerCase().includes("old skool sundays"),
    "Default render contains headline 'Old Skool Sundays'"
  );
  assert(
    htmlDefault.includes("DJ Ngash"),
    "Default render contains performer 'DJ Ngash'"
  );
  assert(
    htmlDefault.includes("45 RPM"),
    "Default render contains '45 RPM' vinyl speed badge"
  );
  assert(
    htmlDefault.includes("Discounts on beer buckets."),
    "Default render contains beverage offer 'Discounts on beer buckets.'"
  );
  assert(
    htmlDefault.includes('data-testid="pinkman-offer-container"'),
    "Default render includes data-testid='pinkman-offer-container'"
  );

  // Case B: Cleared Offer Render
  const clearedDoc = {
    ...defaultDoc,
    content: {
      ...defaultDoc.content,
      primaryOffer: "",
      secondaryOffer: "",
    },
  };
  const htmlCleared = renderToString(React.createElement(PinkmanTemplate, { document: clearedDoc }));
  assert(
    !htmlCleared.includes('data-testid="pinkman-offer-container"'),
    "Cleared offer render does NOT output offer container"
  );
  assert(
    !htmlCleared.includes("No special offer provided yet"),
    "Cleared offer render NEVER prints placeholder 'No special offer provided yet'"
  );
  assert(
    htmlCleared.includes("DJ Ngash"),
    "Cleared offer render still maintains DJ Ngash performer block"
  );

  // -----------------------------------------------------------
  // Suite 9: Fleet-Wide Milestone Verification (7/7 Templates Active)
  // -----------------------------------------------------------
  console.log("\nSuite 9: Fleet-Wide Milestone Verification (7/7 Templates Active)");

  assert(ORDERED_TEMPLATE_IDS.length === 7, "All 7 weekly template IDs registered");
  for (const tid of ORDERED_TEMPLATE_IDS) {
    const r = getTemplateRenderer(tid);
    assert(
      r && r.name !== "PlaceholderTemplateRenderer",
      `Template '${tid}' has dedicated renderer (${r?.name}) — zero placeholders remaining`
    );
  }

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  PINKMAN TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    console.error(`FAILED: ${failedTests} test(s) failed.`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test runner error:", err);
  process.exit(1);
});
