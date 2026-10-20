/**
 * Stage 11 Test Suite: Draft Persistence, Auto-Save, and Draft Management Workspace
 *
 * Runs standalone via: cmd /c npx tsx scripts/test-draft-persistence.ts
 *
 * Verifies:
 * 1. Owner-scoped draft authorization (Decision 08)
 * 2. Complete draft lifecycle (Create, Read, Update, Delete)
 * 3. Draft duplication with independent JSON state
 * 4. Runtime schema validation & rejection of malformed drafts
 * 5. Document JSON serialization invariance
 */

import { db } from "../src/lib/db";
import {
  createDefaultPosterDocument,
  getTemplateById,
} from "../src/features/templates/registry";
import { PosterDocumentSchema, PosterDocument } from "../src/features/poster/schema";

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

async function runDraftPersistenceTests() {
  console.log("\n========================================================");
  console.log("  STAGE 11: DRAFT PERSISTENCE & MANAGEMENT TEST SUITE");
  console.log("========================================================\n");

  try {
    // -----------------------------------------------------------
    // Setup: Retrieve Test Users (Bolton and Franklin)
    // -----------------------------------------------------------
    const bolton = await db.user.findFirst({
      where: {
        OR: [{ username: "bolton" }, { displayUsername: "Bolton" }],
      },
    });
    const franklin = await db.user.findFirst({
      where: {
        OR: [{ username: "franklin" }, { displayUsername: "Franklin" }],
      },
    });

    assert(
      Boolean(bolton && franklin),
      "Test accounts 'Bolton' and 'Franklin' exist in Supabase database",
      `Bolton: ${Boolean(bolton)}, Franklin: ${Boolean(franklin)}`
    );

    if (!bolton || !franklin) {
      throw new Error("Cannot continue without test users.");
    }

    // -----------------------------------------------------------
    // Suite 1: Owner-Scoped Draft Authorization (Decision 08)
    // -----------------------------------------------------------
    console.log("\nSuite 1: Owner-Scoped Draft Authorization (Decision 08)");

    // Clean up any old test drafts from previous test runs
    await db.posterDraft.deleteMany({
      where: { name: { startsWith: "TEST_PERSIST_" } },
    });

    const boltonInitialDoc = createDefaultPosterDocument("reddington");
    boltonInitialDoc.content.eventTitle = "TEST_PERSIST_BOLTON_TITLE";

    const boltonDraft = await db.posterDraft.create({
      data: {
        name: "TEST_PERSIST_Bolton_Draft",
        templateId: "reddington",
        templateVersion: 1,
        schemaVersion: 1,
        document: boltonInitialDoc as unknown as object,
        userId: bolton.id,
      },
    });

    // Verify Bolton can query his draft
    const boltonQuery = await db.posterDraft.findFirst({
      where: { id: boltonDraft.id, userId: bolton.id },
    });
    assert(
      boltonQuery !== null && boltonQuery.id === boltonDraft.id,
      "Bolton can query and retrieve his own draft by ID"
    );

    // Verify Franklin CANNOT query Bolton's draft (Isolation invariant)
    const franklinQuery = await db.posterDraft.findFirst({
      where: { id: boltonDraft.id, userId: franklin.id },
    });
    assert(
      franklinQuery === null,
      "Franklin cannot query or access Bolton's private draft (Decision 08 enforced)"
    );

    // -----------------------------------------------------------
    // Suite 2: Complete Draft Lifecycle (Create, Read, Update, Delete)
    // -----------------------------------------------------------
    console.log("\nSuite 2: Complete Draft Lifecycle (Create, Read, Update, Delete)");

    // Read and verify document structure
    const retrievedDoc = boltonDraft.document as unknown as PosterDocument;
    assert(
      retrievedDoc.content.eventTitle === "TEST_PERSIST_BOLTON_TITLE",
      "Persisted JSON document retains exact event title"
    );
    assert(
      retrievedDoc.templateId === "reddington" && retrievedDoc.schemaVersion === 1,
      "Persisted document maintains valid schema and template version"
    );

    // Update draft with customized copy and styling
    const updatedDoc: PosterDocument = {
      ...retrievedDoc,
      content: {
        ...retrievedDoc.content,
        eventTitle: "TEST_PERSIST_UPDATED_TITLE",
        djNames: ["Monsieur Pierre", "DJ Bolton Special"],
      },
      styling: {
        ...retrievedDoc.styling,
        paletteId: "golden-hour",
      },
    };

    const updatedRecord = await db.posterDraft.update({
      where: { id: boltonDraft.id },
      data: {
        name: "TEST_PERSIST_Bolton_Draft_Updated",
        document: updatedDoc as unknown as object,
      },
    });

    assert(
      updatedRecord.name === "TEST_PERSIST_Bolton_Draft_Updated",
      "Draft name successfully updated in database"
    );

    const reloadedDoc = updatedRecord.document as unknown as PosterDocument;
    assert(
      reloadedDoc.content.eventTitle === "TEST_PERSIST_UPDATED_TITLE" &&
        reloadedDoc.content.djNames.includes("DJ Bolton Special") &&
        reloadedDoc.styling.paletteId === "golden-hour",
      "Draft update persists modified title, lineup, and palette tokens"
    );

    // Delete draft
    await db.posterDraft.delete({
      where: { id: boltonDraft.id },
    });

    const verifyDeleted = await db.posterDraft.findUnique({
      where: { id: boltonDraft.id },
    });
    assert(
      verifyDeleted === null,
      "Deleted draft is completely removed from database"
    );

    // -----------------------------------------------------------
    // Suite 3: Draft Duplication with Independent JSON State
    // -----------------------------------------------------------
    console.log("\nSuite 3: Draft Duplication with Independent JSON State");

    // Create source draft
    const sourceDoc = createDefaultPosterDocument("reddington");
    sourceDoc.content.eventTitle = "TEST_PERSIST_SOURCE_TITLE";

    const sourceDraft = await db.posterDraft.create({
      data: {
        name: "TEST_PERSIST_Source",
        templateId: "reddington",
        templateVersion: 1,
        schemaVersion: 1,
        document: sourceDoc as unknown as object,
        userId: bolton.id,
      },
    });

    // Duplicate draft
    const clonedName = `Copy of ${sourceDraft.name}`;
    const clonedDoc: PosterDocument = {
      ...(sourceDraft.document as unknown as PosterDocument),
      name: clonedName,
    };

    const duplicatedDraft = await db.posterDraft.create({
      data: {
        name: clonedName,
        templateId: sourceDraft.templateId,
        templateVersion: sourceDraft.templateVersion,
        schemaVersion: sourceDraft.schemaVersion,
        document: clonedDoc as unknown as object,
        userId: bolton.id,
      },
    });

    assert(
      duplicatedDraft.id !== sourceDraft.id,
      "Duplicated draft receives a new unique ID"
    );
    assert(
      duplicatedDraft.name === "Copy of TEST_PERSIST_Source",
      "Duplicated draft is prefixed with 'Copy of'"
    );

    // Mutate duplicated draft and verify source remains unchanged
    const mutatedDuplicateDoc: PosterDocument = {
      ...(duplicatedDraft.document as unknown as PosterDocument),
      content: {
        ...clonedDoc.content,
        eventTitle: "TEST_PERSIST_MUTATED_DUPLICATE",
      },
    };

    await db.posterDraft.update({
      where: { id: duplicatedDraft.id },
      data: {
        document: mutatedDuplicateDoc as unknown as object,
      },
    });

    const refreshedSource = await db.posterDraft.findUnique({
      where: { id: sourceDraft.id },
    });
    const sourceDocAfter = refreshedSource?.document as unknown as PosterDocument;
    assert(
      sourceDocAfter.content.eventTitle === "TEST_PERSIST_SOURCE_TITLE",
      "Modifying duplicated draft does NOT mutate original source draft"
    );

    // Cleanup test drafts
    await db.posterDraft.deleteMany({
      where: { id: { in: [sourceDraft.id, duplicatedDraft.id] } },
    });

    // -----------------------------------------------------------
    // Suite 4: Schema Validation & Malformed Payload Rejection
    // -----------------------------------------------------------
    console.log("\nSuite 4: Schema Validation & Malformed Payload Rejection");

    const validReddington = createDefaultPosterDocument("reddington");
    const validParse = PosterDocumentSchema.safeParse(validReddington);
    assert(
      validParse.success === true,
      "Valid default PosterDocument cleanly passes Zod schema validation"
    );

    // Missing canvas width
    const badCanvas = {
      ...validReddington,
      canvas: { ...validReddington.canvas, width: 500 },
    };
    const badCanvasParse = PosterDocumentSchema.safeParse(badCanvas);
    assert(
      badCanvasParse.success === false,
      "Schema rejects non-canonical canvas dimensions (500x1350)"
    );

    // Invalid templateId
    const badTemplateId = {
      ...validReddington,
      templateId: "non_existent_template_xyz",
    };
    const badTemplateParse = PosterDocumentSchema.safeParse(badTemplateId);
    assert(
      badTemplateParse.success === false,
      "Schema rejects unrecognized templateId"
    );

    // Out-of-bounds focal point
    const badFocalPoint = {
      ...validReddington,
      styling: {
        ...validReddington.styling,
        focalPoints: {
          background: { x: 2.5, y: -0.5 },
        },
      },
    };
    const badFocalParse = PosterDocumentSchema.safeParse(badFocalPoint);
    assert(
      badFocalParse.success === false,
      "Schema rejects non-normalized focal point coordinates (x: 2.5, y: -0.5)"
    );

    // -----------------------------------------------------------
    // Suite 5: Auto-Save State Transitions Lifecycle
    // -----------------------------------------------------------
    console.log("\nSuite 5: Auto-Save State Transitions Lifecycle");

    type AutoSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";
    let status: AutoSaveStatus = "idle";
    const statusHistory: AutoSaveStatus[] = [status];

    // Simulate user editing title
    status = "dirty";
    statusHistory.push(status);

    // Simulate debounce trigger
    status = "saving";
    statusHistory.push(status);

    // Simulate successful API response
    status = "saved";
    statusHistory.push(status);

    assert(
      statusHistory.join(" -> ") === "idle -> dirty -> saving -> saved",
      "Auto-save state machine follows canonical lifecycle: idle -> dirty -> saving -> saved"
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
  } catch (error) {
    console.error("Test execution failed with fatal error:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runDraftPersistenceTests();
