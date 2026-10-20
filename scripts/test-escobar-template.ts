/**
 * Stage 17 Test Suite: Escobar Template (Saturday Fiesta / Weekend Celebration / Layered Colour Blocks)
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-escobar-template.ts
 *
 * Verifies:
 * 1. Escobar template registry metadata and master canvas invariants (1080 x 1350, 4:5 ratio)
 * 2. Three curated palette presets (Fiesta Citrus, Coral Electric, Purple & Gold)
 * 3. Typography pairing presets (celebration-heavy, fiesta-vibrant)
 * 4. Layout options (color-blocks, fiesta-glow) and celebratory decoration options
 * 5. Verbatim lineup & Saturday beverage offer contracts:
 *    - DJ Lineup: 'DVJ Jojez'
 *    - Primary offer: 'Discounts on whiskey bottles and cognac.'
 *    - Secondary offer: ''
 *    - Graceful offer container collapse when cleared
 *    - Zero invented placeholder text like "No special offer provided yet"
 * 6. Conditional layout rebalancing and Zod document schema validation
 * 7. Template renderer resolver mapping (escobar -> EscobarTemplate)
 * 8. Multi-format export filename generation per Decision 09
 * 9. React SSR DOM structural rendering and data-testid verification
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
} from "../src/features/templates/registry";
import {
  getTemplateRenderer,
} from "../src/features/templates/renderers";
import { EscobarTemplate } from "../src/components/poster/templates/EscobarTemplate";
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
  console.log("  STAGE 17: ESCOBAR (SATURDAY FIESTA) TEST SUITE");
  console.log("========================================================\n");

  const escobarDef = getTemplateById("escobar");
  assert(Boolean(escobarDef), "Escobar template definition exists in registry");

  if (!escobarDef) {
    console.error("FATAL: Escobar template missing from registry.");
    process.exit(1);
  }

  // -----------------------------------------------------------
  // Suite 1: Registry Metadata & Coordinate Invariants
  // -----------------------------------------------------------
  console.log("Suite 1: Registry Metadata & Coordinate Invariants");

  assert(escobarDef.id === "escobar", "Template ID is 'escobar'");
  assert(escobarDef.name === "Escobar", "Template display name is 'Escobar'");
  assert(escobarDef.dayOfWeek === 6, "Template dayOfWeek is 6 (Saturday)");
  assert(escobarDef.dayLabel === "Saturday", "Template dayLabel is 'Saturday'");
  assert(
    escobarDef.eventTitle === "Saturday Fiesta",
    "Template eventTitle is verbatim 'Saturday Fiesta'"
  );
  assert(
    escobarDef.thumbnailUrl === "/template-thumbnails/escobar.svg",
    "Template specifies dedicated '/template-thumbnails/escobar.svg' thumbnail"
  );
  assert(
    escobarDef.tag === "Best for Saturday Fiesta",
    "Template tag is 'Best for Saturday Fiesta'"
  );
  assert(
    escobarDef.defaults.canvas.width === POSTER_MASTER_WIDTH,
    `Master canvas width equals ${POSTER_MASTER_WIDTH}`
  );
  assert(
    escobarDef.defaults.canvas.height === POSTER_MASTER_HEIGHT,
    `Master canvas height equals ${POSTER_MASTER_HEIGHT}`
  );
  assert(
    escobarDef.defaults.canvas.width / escobarDef.defaults.canvas.height === POSTER_ASPECT_RATIO,
    "Master canvas aspect ratio is exactly 4:5 (0.8)"
  );

  // -----------------------------------------------------------
  // Suite 2: Three Curated Palette Presets
  // -----------------------------------------------------------
  console.log("\nSuite 2: Three Curated Palette Presets");

  assert(escobarDef.palettePresets.length === 3, "Exactly 3 curated palette presets provided");

  const citrus = escobarDef.palettePresets.find((p) => p.id === "fiesta-citrus");
  assert(Boolean(citrus), "Preset 'fiesta-citrus' exists");
  if (citrus) {
    assert(citrus.primary === "#f59e0b", "Fiesta Citrus primary is warm amber #f59e0b");
    assert(citrus.secondary === "#ef4444", "Fiesta Citrus secondary is fiery red #ef4444");
    assert(citrus.accent === "#10b981", "Fiesta Citrus accent is emerald #10b981");
    assert(citrus.background === "#180a04", "Fiesta Citrus background is dark fiesta charcoal #180a04");
  }

  const coral = escobarDef.palettePresets.find((p) => p.id === "coral-electric");
  assert(Boolean(coral), "Preset 'coral-electric' exists");
  if (coral) {
    assert(coral.primary === "#fb7185", "Coral Electric primary is neon rose #fb7185");
    assert(coral.secondary === "#f43f5e", "Coral Electric secondary is electric crimson #f43f5e");
    assert(coral.background === "#17040a", "Coral Electric background is dark night ruby #17040a");
  }

  const purple = escobarDef.palettePresets.find((p) => p.id === "purple-gold");
  assert(Boolean(purple), "Preset 'purple-gold' exists");
  if (purple) {
    assert(purple.primary === "#eab308", "Purple & Gold primary is fiesta gold #eab308");
    assert(purple.secondary === "#a855f7", "Purple & Gold secondary is vivid purple #a855f7");
    assert(purple.background === "#13041c", "Purple & Gold background is midnight plum #13041c");
  }

  // -----------------------------------------------------------
  // Suite 3: Typography Presets & Layout Options
  // -----------------------------------------------------------
  console.log("\nSuite 3: Typography Presets & Layout Options");

  assert(
    escobarDef.typographyPresets.length >= 2,
    "At least 2 distinct typography presets provided"
  );
  const celebrationHeavy = escobarDef.typographyPresets.find((t) => t.id === "celebration-heavy");
  assert(Boolean(celebrationHeavy), "Typography preset 'celebration-heavy' exists");
  if (celebrationHeavy) {
    assert(celebrationHeavy.displayFont === "Bebas Neue", "Celebration Heavy displayFont is 'Bebas Neue'");
    assert(celebrationHeavy.bodyFont === "Inter", "Celebration Heavy bodyFont is 'Inter'");
  }

  const fiestaVibrant = escobarDef.typographyPresets.find((t) => t.id === "fiesta-vibrant");
  assert(Boolean(fiestaVibrant), "Typography preset 'fiesta-vibrant' exists");
  if (fiestaVibrant) {
    assert(fiestaVibrant.displayFont === "Source Sans 3", "Fiesta Vibrant displayFont is 'Source Sans 3'");
    assert(fiestaVibrant.bodyFont === "Inter", "Fiesta Vibrant bodyFont is 'Inter'");
  }

  assert(escobarDef.layoutOptions.length >= 2, "At least 2 layout options defined");
  const colorBlocks = escobarDef.layoutOptions.find((l) => l.id === "color-blocks");
  const fiestaGlow = escobarDef.layoutOptions.find((l) => l.id === "fiesta-glow");
  assert(Boolean(colorBlocks), "Layout option 'color-blocks' exists");
  assert(Boolean(fiestaGlow), "Layout option 'fiesta-glow' exists");

  assert(
    escobarDef.defaults.styling.decorationOptions?.lightOrbs === true,
    "Default decorationOptions enables lightOrbs"
  );
  assert(
    escobarDef.defaults.styling.decorationOptions?.confettiAccents === true,
    "Default decorationOptions enables confettiAccents"
  );

  // -----------------------------------------------------------
  // Suite 4: Verbatim Talent & Beverage Offer Contracts
  // -----------------------------------------------------------
  console.log("\nSuite 4: Verbatim Talent & Beverage Offer Contracts");

  const defaultContent = escobarDef.defaults.content;
  assert(
    defaultContent.djNames.length === 1 && defaultContent.djNames[0] === "DVJ Jojez",
    "DJ Lineup defaults verbatim to ['DVJ Jojez'] per source brief"
  );
  assert(
    defaultContent.primaryOffer === "Discounts on whiskey bottles and cognac.",
    "Primary offer is verbatim 'Discounts on whiskey bottles and cognac.'"
  );
  assert(
    defaultContent.secondaryOffer === "",
    "Secondary offer defaults to empty string"
  );

  // -----------------------------------------------------------
  // Suite 5: Zod Schema Validation & Default Document Generation
  // -----------------------------------------------------------
  console.log("\nSuite 5: Zod Schema Validation & Default Document Generation");

  const defaultDoc = createDefaultPosterDocument("escobar");
  const parseResult = PosterDocumentSchema.safeParse(defaultDoc);
  assert(parseResult.success, "createDefaultPosterDocument('escobar') satisfies PosterDocumentSchema");

  if (!parseResult.success) {
    console.error("Zod Schema Errors:", parseResult.error.format());
  }

  // Verify custom document with secondary offer
  const customDoc = {
    ...defaultDoc,
    styling: {
      ...defaultDoc.styling,
      paletteId: "purple-gold",
      layoutOptionId: "fiesta-glow",
    },
    content: {
      ...defaultDoc.content,
      secondaryOffer: "VIP Table Reservations Available",
    },
  };
  const customResult = PosterDocumentSchema.safeParse(customDoc);
  assert(customResult.success, "Customized Escobar document satisfies PosterDocumentSchema");

  // -----------------------------------------------------------
  // Suite 6: Template Renderer Resolver Mapping
  // -----------------------------------------------------------
  console.log("\nSuite 6: Template Renderer Resolver Mapping");

  const Renderer = getTemplateRenderer("escobar");
  assert(Boolean(Renderer), "Renderer for 'escobar' resolved from renderers registry");
  assert(
    Renderer === EscobarTemplate,
    "Renderer for 'escobar' resolves strictly to EscobarTemplate component"
  );

  // -----------------------------------------------------------
  // Suite 7: Export Filename Generation
  // -----------------------------------------------------------
  console.log("\nSuite 7: Export Filename Generation");

  const pngName = generatePosterFileName({
    day: defaultDoc.content.dayLabel,
    templateName: "Escobar",
    eventTitle: defaultDoc.content.eventTitle,
    format: "png",
  });
  assert(
    pngName === "Ozone-Lounge-Saturday-Escobar-Saturday-Fiesta.png",
    `PNG export filename generates correctly (${pngName})`
  );

  const jpgName = generatePosterFileName({
    day: defaultDoc.content.dayLabel,
    templateName: "Escobar",
    eventTitle: defaultDoc.content.eventTitle,
    format: "jpeg",
  });
  assert(
    jpgName === "Ozone-Lounge-Saturday-Escobar-Saturday-Fiesta.jpg",
    `JPEG export filename generates correctly (${jpgName})`
  );

  // -----------------------------------------------------------
  // Suite 8: SSR DOM Verification & Offer Handling
  // -----------------------------------------------------------
  console.log("\nSuite 8: SSR DOM Verification & Offer Handling");

  // Case A: Default Render with Offer & Performer
  const htmlDefault = renderToString(React.createElement(EscobarTemplate, { document: defaultDoc }));
  assert(
    htmlDefault.includes('data-testid="escobar-template-root"'),
    "Escobar root container renders with data-testid='escobar-template-root'"
  );
  assert(
    htmlDefault.toLowerCase().includes("saturday fiesta"),
    "Default render contains headline 'Saturday Fiesta'"
  );
  assert(
    htmlDefault.includes("DVJ Jojez"),
    "Default render contains performer 'DVJ Jojez'"
  );
  assert(
    htmlDefault.includes("DVJ"),
    "Default render contains 'DVJ' badge"
  );
  assert(
    htmlDefault.includes("Discounts on whiskey bottles and cognac."),
    "Default render contains beverage offer 'Discounts on whiskey bottles and cognac.'"
  );
  assert(
    htmlDefault.includes('data-testid="escobar-offer-container"'),
    "Default render includes data-testid='escobar-offer-container'"
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
  const htmlCleared = renderToString(React.createElement(EscobarTemplate, { document: clearedDoc }));
  assert(
    !htmlCleared.includes('data-testid="escobar-offer-container"'),
    "Cleared offer render does NOT output offer container"
  );
  assert(
    !htmlCleared.includes("No special offer provided yet"),
    "Cleared offer render NEVER prints placeholder 'No special offer provided yet'"
  );
  assert(
    htmlCleared.includes("DVJ Jojez"),
    "Cleared offer render still maintains DVJ Jojez performer block"
  );

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  ESCOBAR TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
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
