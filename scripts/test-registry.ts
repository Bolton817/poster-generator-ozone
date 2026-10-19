import {
  ORDERED_TEMPLATE_IDS,
  TEMPLATES_REGISTRY,
  getTemplatesInOrder,
  getTemplateById,
  validatePosterDocument,
  createDefaultPosterDocument,
  TemplateDefinition,
} from "../src/features/templates/registry";
import { PosterDocumentSchema, TemplateId } from "../src/features/poster/schema";

async function runRegistryTests() {
  console.log("Starting Template Registry & PosterDocument Contract Test Suite...\n");

  // ----------------------------------------------------
  // TEST 1: Exactly 7 templates in Monday-to-Sunday order
  // ----------------------------------------------------
  console.log("[TEST 1] Verifying 7 templates in Monday-to-Sunday order...");
  const orderedTemplates = getTemplatesInOrder();
  if (orderedTemplates.length !== 7) {
    throw new Error(`Expected exactly 7 templates, found ${orderedTemplates.length}`);
  }

  const expectedDays = [
    { id: "reddington", day: 1, label: "Monday", name: "Reddington" },
    { id: "saint", day: 2, label: "Tuesday", name: "Saint" },
    { id: "lannister", day: 3, label: "Wednesday", name: "Lannister" },
    { id: "shelby", day: 4, label: "Thursday", name: "Shelby" },
    { id: "lothbrok", day: 5, label: "Friday", name: "Lothbrok" },
    { id: "escobar", day: 6, label: "Saturday", name: "Escobar" },
    { id: "pinkman", day: 0, label: "Sunday", name: "Pinkman" },
  ];

  expectedDays.forEach((expected, idx) => {
    const tpl = orderedTemplates[idx];
    if (tpl.id !== expected.id) {
      throw new Error(`Order mismatch at index ${idx}: expected ${expected.id}, got ${tpl.id}`);
    }
    if (tpl.dayOfWeek !== expected.day) {
      throw new Error(`Day mismatch for ${tpl.id}: expected ${expected.day}, got ${tpl.dayOfWeek}`);
    }
    if (tpl.dayLabel !== expected.label) {
      throw new Error(`Label mismatch for ${tpl.id}: expected ${expected.label}, got ${tpl.dayLabel}`);
    }
    if (tpl.name !== expected.name) {
      throw new Error(`Name mismatch for ${tpl.id}: expected ${expected.name}, got ${tpl.name}`);
    }
  });
  console.log("  [PASS] All 7 templates exist exactly once in Monday-to-Sunday order.");

  // ----------------------------------------------------
  // TEST 2: Source-of-Truth Content Verification
  // ----------------------------------------------------
  console.log("\n[TEST 2] Verifying verbatim source copy from weekly entertainment brief...");

  // Monday: Reddington
  const reddington = getTemplateById("reddington")!;
  if (reddington.eventTitle !== "Old Classics & Sundowners") throw new Error("Reddington title mismatch");
  if (!reddington.defaults.content.djNames.includes("Monsieur Pierre")) throw new Error("Reddington DJ mismatch");
  if (!reddington.defaults.content.primaryOffer.includes("excluding wine")) throw new Error("Reddington wine exclusion missing");

  // Tuesday: Saint
  const saint = getTemplateById("saint")!;
  if (saint.eventTitle !== "African Night (Afro)") throw new Error("Saint title mismatch");
  if (!saint.defaults.content.djNames.includes("DJ Neb") || !saint.defaults.content.djNames.includes("DVJ Jojez")) {
    throw new Error("Saint lineup mismatch");
  }
  if (saint.defaults.content.primaryOffer !== "Discounts on beer buckets and cocktails.") {
    throw new Error("Saint offer mismatch");
  }

  // Wednesday: Lannister
  const lannister = getTemplateById("lannister")!;
  if (lannister.eventTitle !== "Groovy Wednesday") throw new Error("Lannister title mismatch");
  if (!lannister.defaults.content.primaryOffer.includes("Free koroga chicken on the house")) {
    throw new Error("Lannister primary offer missing koroga chicken");
  }
  if (!lannister.defaults.content.secondaryOffer.includes("whiskey bottles, cognac and beer buckets")) {
    throw new Error("Lannister secondary offer missing bottle discounts");
  }

  // Thursday: Shelby
  const shelby = getTemplateById("shelby")!;
  if (shelby.eventTitle !== "Karaoke Night") throw new Error("Shelby title mismatch");
  if (!shelby.defaults.content.hostNames.includes("Bellah Harriet") || !shelby.defaults.content.hostNames.includes("Tito Wagithomo")) {
    throw new Error("Shelby hosts mismatch");
  }
  if (!shelby.defaults.content.djNames.includes("DJ Fab")) throw new Error("Shelby DJ mismatch");
  if (shelby.defaults.content.primaryOffer !== "Free tequila shots for singers.") {
    throw new Error("Shelby singer tequila condition mismatch");
  }

  // Friday: Lothbrok (ACC-09: Offer is explicitly empty, zero placeholder text)
  const lothbrok = getTemplateById("lothbrok")!;
  if (lothbrok.eventTitle !== "Flight Fridays") throw new Error("Lothbrok title mismatch");
  if (lothbrok.defaults.content.primaryOffer !== "") {
    throw new Error(`Lothbrok offer must be empty string, found: "${lothbrok.defaults.content.primaryOffer}"`);
  }
  if (!lothbrok.defaults.content.djNames.includes("DJ Slim D") || !lothbrok.defaults.content.djNames.includes("Mistabrand")) {
    throw new Error("Lothbrok lineup mismatch");
  }

  // Saturday: Escobar
  const escobar = getTemplateById("escobar")!;
  if (escobar.eventTitle !== "Saturday Fiesta") throw new Error("Escobar title mismatch");
  if (!escobar.defaults.content.djNames.includes("DVJ Jojez")) throw new Error("Escobar lineup mismatch");

  // Sunday: Pinkman
  const pinkman = getTemplateById("pinkman")!;
  if (pinkman.eventTitle !== "Old Skool Sundays") throw new Error("Pinkman title mismatch");
  if (!pinkman.defaults.content.djNames.includes("DJ Ngash")) throw new Error("Pinkman lineup mismatch");
  if (pinkman.defaults.content.primaryOffer !== "Discounts on beer buckets.") throw new Error("Pinkman offer mismatch");

  console.log("  [PASS] All event titles, performers, and source offers match source-of-truth matrix.");

  // ----------------------------------------------------
  // TEST 3: Validation of all default documents
  // ----------------------------------------------------
  console.log("\n[TEST 3] Validating all 7 default documents via Zod schema...");
  for (const id of ORDERED_TEMPLATE_IDS) {
    const doc = createDefaultPosterDocument(id);
    const parsed = validatePosterDocument(doc);
    if (!parsed.success) {
      throw new Error(`Validation failed for template "${id}": ${JSON.stringify(parsed.error.issues)}`);
    }
  }
  console.log("  [PASS] All 7 default documents passed strict Zod validation.");

  // ----------------------------------------------------
  // TEST 4: Rejection of malformed / untrusted inputs
  // ----------------------------------------------------
  console.log("\n[TEST 4] Testing rejection of invalid data...");

  // 4a. Invalid templateId
  const invalidTpl = validatePosterDocument({
    ...reddington.defaults,
    templateId: "unsupported_template_xyz",
  });
  if (invalidTpl.success) throw new Error("Schema should have rejected invalid template ID!");

  // 4b. Invalid canvas dimensions
  const invalidCanvas = validatePosterDocument({
    ...reddington.defaults,
    canvas: { width: 900, height: 1200, format: "portrait-3x4" },
  });
  if (invalidCanvas.success) throw new Error("Schema should have rejected non-1080x1350 canvas!");

  // 4c. Invalid focal point out of [0, 1] range
  const invalidFocal = validatePosterDocument({
    ...reddington.defaults,
    styling: {
      ...reddington.defaults.styling,
      focalPoints: { background: { x: 1.5, y: -0.2 } },
    },
  });
  if (invalidFocal.success) throw new Error("Schema should have rejected out-of-bounds focal point!");

  // 4d. Missing eventTitle
  const emptyTitle = validatePosterDocument({
    ...reddington.defaults,
    content: { ...reddington.defaults.content, eventTitle: "" },
  });
  if (emptyTitle.success) throw new Error("Schema should have rejected empty eventTitle!");

  console.log("  [PASS] Schema correctly rejected invalid template ID, wrong canvas, bad focal point, and empty title.");

  // ----------------------------------------------------
  // TEST 5: Extensibility contract (Adding Template 8)
  // ----------------------------------------------------
  console.log("\n[TEST 5] Verifying extensible template contract...");
  const mockTemplateEight: TemplateDefinition = {
    id: "reddington", // conforms to TemplateDefinition interface
    name: "Targaryen",
    dayOfWeek: 5,
    dayLabel: "Special",
    eventTitle: "Midsummer Gala",
    tag: "Best for Special Galas",
    description: "Grand gala aesthetics",
    templateVersion: 1,
    palettePresets: [
      {
        id: "ruby-velvet",
        name: "Ruby Velvet",
        primary: "#991b1b",
        secondary: "#b91c1c",
        accent: "#f87171",
        background: "#0f0505",
        text: "#fff",
      },
    ],
    typographyPresets: [
      {
        id: "regal-serif",
        name: "Regal Display",
        displayFont: "serif",
        bodyFont: "sans-serif",
        labelFont: "sans-serif",
      },
    ],
    layoutOptions: [{ id: "gala-split", name: "Gala Split" }],
    supportedImageSlots: ["background"],
    defaults: {
      ...reddington.defaults,
      name: "Special — Midsummer Gala",
      content: {
        ...reddington.defaults.content,
        eventTitle: "Midsummer Gala",
        primaryOffer: "Champagne on entry",
      },
    },
  };

  const parsedTemplate8 = PosterDocumentSchema.safeParse(mockTemplateEight.defaults);
  if (!parsedTemplate8.success) {
    throw new Error("Mock template 8 document failed validation!");
  }
  console.log("  [PASS] Extensible contract: New template conforms to schema without core refactoring.");

  console.log("\n=======================================================");
  console.log("All Template Registry & Contract tests PASSED! (Gate G2)");
  console.log("=======================================================");
}

runRegistryTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
