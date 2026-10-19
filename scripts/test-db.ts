import { db } from "../src/lib/db";

async function runDatabaseTest() {
  console.log("Starting database CRUD test against Supabase PostgreSQL...");

  // 1. Fetch the seeded operator user
  const operator = await db.user.findUnique({
    where: { username: "ozone_operator" },
  });

  if (!operator) {
    throw new Error("Seeded operator user 'ozone_operator' not found!");
  }
  console.log(`[PASS] Found operator user: ${operator.id}`);

  // 2. Create a test draft
  const testDraft = await db.posterDraft.create({
    data: {
      name: "Temporary Verification Draft",
      templateId: "reddington",
      templateVersion: 1,
      schemaVersion: 1,
      document: {
        eventTitle: "Test Verification Title",
        primaryOffer: "Discounts on all drinks",
      },
      userId: operator.id,
    },
  });
  console.log(`[PASS] Created test draft: ${testDraft.id}`);

  // 3. Read the created draft
  const fetchedDraft = await db.posterDraft.findUnique({
    where: { id: testDraft.id },
  });

  if (!fetchedDraft || fetchedDraft.name !== "Temporary Verification Draft") {
    throw new Error("Failed to verify created draft contents!");
  }
  console.log(`[PASS] Successfully read draft: ${fetchedDraft.name}`);

  // 4. Update the draft
  const updatedDraft = await db.posterDraft.update({
    where: { id: testDraft.id },
    data: {
      name: "Updated Verification Draft",
    },
  });

  if (updatedDraft.name !== "Updated Verification Draft") {
    throw new Error("Failed to verify draft update!");
  }
  console.log(`[PASS] Successfully updated draft name`);

  // 5. Delete the test draft
  await db.posterDraft.delete({
    where: { id: testDraft.id },
  });

  const checkDeleted = await db.posterDraft.findUnique({
    where: { id: testDraft.id },
  });

  if (checkDeleted !== null) {
    throw new Error("Failed to delete test draft!");
  }
  console.log(`[PASS] Successfully deleted test draft`);

  console.log("All Database CRUD integrity checks passed successfully!");
}

runDatabaseTest()
  .catch((err) => {
    console.error("Database CRUD test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
