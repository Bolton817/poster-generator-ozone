import fs from "fs";
import path from "path";
import { getAllFonts, getFontById } from "../src/features/fonts/manifest";
import { generateFontFaceCSS, generateAllFontFaceCSS } from "../src/features/fonts/font-loader";
import { IMAGE_SLOT_POLICIES } from "../src/features/assets/slot-policy";
import { storageService } from "../src/lib/storage";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { imageSize } from "image-size";

// Minimal valid 1x1 PNG buffer
const VALID_1X1_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082",
  "hex"
);

async function runStage06Tests() {
  console.log("=================================================================");
  console.log("Stage 06: Premium Fonts & Image Asset Infrastructure Test Suite");
  console.log("=================================================================\n");

  let ttfFound = false;
  let otfFound = false;

  // -------------------------------------------------------------
  // Suite 1: Font Catalogue & Physical File Verification
  // -------------------------------------------------------------
  console.log("[SUITE 1] Font Catalogue & Physical File Verification...");
  const fonts = getAllFonts();
  if (fonts.length === 0) {
    throw new Error("No fonts registered in FONT_CATALOGUE!");
  }
  console.log(`[PASS] Found ${fonts.length} registered font families.`);

  for (const font of fonts) {
    console.log(`\n  Checking font family: ${font.displayName} (ID: ${font.id})`);
    for (const variant of font.variants) {
      const diskPath = path.join(process.cwd(), "public", variant.src);
      if (!fs.existsSync(diskPath)) {
        throw new Error(`Font file missing on disk: ${diskPath}`);
      }

      const stat = fs.statSync(diskPath);
      if (stat.size === 0) {
        throw new Error(`Font file is empty (0 bytes): ${diskPath}`);
      }

      if (variant.format === "truetype") ttfFound = true;
      if (variant.format === "opentype") otfFound = true;

      console.log(`    [PASS] Variant weight ${variant.weight} (${variant.format}) exists: ${variant.src} (${stat.size} bytes)`);
    }
  }

  if (!ttfFound) throw new Error("Acceptance failure: At least one TTF font file must be registered and verified!");
  if (!otfFound) throw new Error("Acceptance failure: At least one OTF font file must be registered and verified!");
  console.log("\n[PASS] Verified both TTF and OTF formats are present and registered.");

  // -------------------------------------------------------------
  // Suite 2: CSS @font-face Generation & Syntax Verification
  // -------------------------------------------------------------
  console.log("\n[SUITE 2] CSS @font-face Generation & Syntax Verification...");
  const interFont = getFontById("inter");
  if (!interFont) throw new Error("Could not find 'inter' in font catalogue!");

  const interCSS = generateFontFaceCSS(interFont);
  if (!interCSS.includes("@font-face") || !interCSS.includes("font-family: 'Inter'") || !interCSS.includes("format('truetype')")) {
    throw new Error("Generated CSS @font-face for Inter is malformed!");
  }
  console.log("[PASS] Single font @font-face CSS generated cleanly.");

  const allCSS = generateAllFontFaceCSS();
  if (!allCSS.includes("Source Sans 3") || !allCSS.includes("Bebas Neue")) {
    throw new Error("generateAllFontFaceCSS missing expected font families!");
  }
  console.log("[PASS] Consolidated catalogue @font-face CSS generated cleanly.");

  // -------------------------------------------------------------
  // Suite 3: Image Slot Policies & Dimension Decoding
  // -------------------------------------------------------------
  console.log("\n[SUITE 3] Image Slot Policies & Dimension Decoding...");
  const slotKeys = Object.keys(IMAGE_SLOT_POLICIES);
  if (!slotKeys.includes("heroBackground") || !slotKeys.includes("logo")) {
    throw new Error("Missing required image slot policies!");
  }
  console.log(`[PASS] Verified image slot policies for: ${slotKeys.join(", ")}`);

  // Verify dimension decoding on 1x1 PNG
  const dimensions = imageSize(VALID_1X1_PNG);
  if (dimensions.width !== 1 || dimensions.height !== 1 || dimensions.type !== "png") {
    throw new Error(`Unexpected decoded image dimensions: ${JSON.stringify(dimensions)}`);
  }
  console.log("[PASS] imageSize decoded dimensions accurately (1x1 px, type: png).");

  // -------------------------------------------------------------
  // Suite 4: Storage Service Unit Tests (Local Provider)
  // -------------------------------------------------------------
  console.log("\n[SUITE 4] Storage Service Provider Tests...");
  const uploadResult = await storageService.upload(VALID_1X1_PNG, "test-pixel.png", "image/png", "test-user");
  
  if (!uploadResult.storageKey || !uploadResult.publicUrl.startsWith("/uploads/")) {
    throw new Error(`Invalid StorageUploadResult: ${JSON.stringify(uploadResult)}`);
  }

  const diskUploadedPath = path.join(process.cwd(), "public", "uploads", uploadResult.storageKey);
  if (!fs.existsSync(diskUploadedPath)) {
    throw new Error(`Uploaded file was not written to disk at ${diskUploadedPath}`);
  }
  console.log(`[PASS] StorageService successfully wrote file to disk: ${uploadResult.publicUrl}`);

  // Test deletion
  await storageService.delete(uploadResult.storageKey);
  if (fs.existsSync(diskUploadedPath)) {
    throw new Error(`StorageService.delete failed to remove file from disk: ${diskUploadedPath}`);
  }
  console.log("[PASS] StorageService.delete safely unlinked file from disk.");

  // -------------------------------------------------------------
  // Suite 5: HTTP API Endpoint Tests (/api/assets/upload)
  // -------------------------------------------------------------
  console.log("\n[SUITE 5] HTTP API Endpoint Security & Upload Tests...");

  // 5a. Anonymous upload attempt must be rejected (HTTP 401)
  const anonFormData = new FormData();
  const anonBlob = new Blob([VALID_1X1_PNG], { type: "image/png" });
  anonFormData.append("file", anonBlob, "anon-test.png");

  const anonRes = await fetch("http://localhost:3005/api/assets/upload", {
    method: "POST",
    body: anonFormData,
  });

  if (anonRes.status !== 401) {
    throw new Error(`Security breach: Anonymous upload returned status ${anonRes.status} instead of 401 Unauthorized!`);
  }
  console.log("[PASS] Anonymous upload rejected with HTTP 401 Unauthorized.");

  // 5b. Authenticate operator (Franklin)
  const authRes = await auth.api.signInUsername({
    body: {
      username: "Franklin",
      password: "FrankMoh254",
    },
    asResponse: true,
  });

  if (!authRes.ok) throw new Error("Failed to authenticate Franklin for API upload test.");
  const sessionCookie = authRes.headers.get("set-cookie");
  if (!sessionCookie) throw new Error("No session cookie received.");

  // 5c. Unsupported MIME type rejection (HTTP 415)
  const textFormData = new FormData();
  const textBlob = new Blob(["This is a plain text file pretending to be an image"], { type: "text/plain" });
  textFormData.append("file", textBlob, "malicious.txt");

  const textRes = await fetch("http://localhost:3005/api/assets/upload", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: textFormData,
  });

  if (textRes.status !== 415) {
    throw new Error(`MIME rejection failure: Expected 415 Unsupported Media Type, got ${textRes.status}`);
  }
  console.log("[PASS] Unsupported MIME type (text/plain) rejected with HTTP 415.");

  // 5d. Oversized file rejection (HTTP 413)
  const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11 MB (> 10 MB limit)
  const oversizedBlob = new Blob([oversizedBuffer], { type: "image/jpeg" });
  const oversizedFormData = new FormData();
  oversizedFormData.append("file", oversizedBlob, "huge.jpg");

  const oversizedRes = await fetch("http://localhost:3005/api/assets/upload", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: oversizedFormData,
  });

  if (oversizedRes.status !== 413) {
    throw new Error(`Size limit failure: Expected 413 Payload Too Large, got ${oversizedRes.status}`);
  }
  console.log("[PASS] Oversized file (>10MB) rejected with HTTP 413 Payload Too Large.");

  // 5e. Valid authenticated image upload (HTTP 201)
  const validFormData = new FormData();
  const validBlob = new Blob([VALID_1X1_PNG], { type: "image/png" });
  validFormData.append("file", validBlob, "franklin-hero.png");

  const uploadRes = await fetch("http://localhost:3005/api/assets/upload", {
    method: "POST",
    headers: { cookie: sessionCookie },
    body: validFormData,
  });

  if (uploadRes.status !== 201) {
    const errorBody = await uploadRes.text();
    throw new Error(`Valid upload failed with status ${uploadRes.status}: ${errorBody}`);
  }

  const uploadPayload = await uploadRes.json();
  if (!uploadPayload.ok || !uploadPayload.data?.id || !uploadPayload.data?.publicUrl) {
    throw new Error(`Upload response did not return valid asset data: ${JSON.stringify(uploadPayload)}`);
  }

  const asset = uploadPayload.data;
  console.log("[PASS] Authenticated upload succeeded (HTTP 201 Created).");
  console.log(`       Asset ID: ${asset.id}`);
  console.log(`       Durable URL: ${asset.publicUrl}`);
  console.log(`       Decoded Dimensions: ${asset.width} × ${asset.height} px`);

  // 5f. Verify persistence in PostgreSQL
  const dbAsset = await db.mediaAsset.findUnique({
    where: { id: asset.id },
  });

  if (!dbAsset || dbAsset.storageKey !== asset.storageKey) {
    throw new Error("Asset was not persisted in PostgreSQL media_assets table!");
  }
  console.log("[PASS] Verified MediaAsset persisted in Supabase PostgreSQL.");

  // Cleanup test asset from disk and database
  await storageService.delete(asset.storageKey);
  await db.mediaAsset.delete({ where: { id: asset.id } });
  console.log("[PASS] Cleaned up temporary test asset from disk and database.");

  console.log("\n=================================================================");
  console.log("All Stage 06 Font & Asset Infrastructure Tests PASSED!");
  console.log("=================================================================");
}

runStage06Tests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
