/**
 * Automated Verification Suite for Stage 20:
 * Security, Accessibility, Performance and Resilience Audit
 * Governed by TDD Stage 20 (Pages 98–99) & Blueprint Sections 8, 9, 10, 11.
 */

import fs from "fs";
import path from "path";
import {
  validateImageMagicBytes,
  sanitizeFilename,
} from "../src/features/assets/upload-sanitizer";
import {
  PosterDocumentSchema,
  PosterContentSchema,
  TemplateIdSchema,
} from "../src/features/poster/schema";
import { createDefaultPosterDocument } from "../src/features/templates/registry";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "../src/features/assets/slot-policy";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedCount++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log("================================================================================");
console.log("STAGE 20 AUDIT SUITE: Security, Accessibility, Performance & Resilience");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// Suite 1: Asset Upload Defense & Binary Magic Bytes Verification
// -----------------------------------------------------------------------------
console.log("\nSuite 1: Asset Upload Pipeline Security & Magic Bytes");
{
  // 1.1 Valid JPEG buffer header (FF D8 FF E0 ...)
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assert(
    validateImageMagicBytes(validJpeg, "image/jpeg"),
    "Accepts authentic JPEG header (FF D8 FF)"
  );

  // 1.2 Valid PNG buffer header (89 50 4E 47 0D 0A 1A 0A ...)
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assert(
    validateImageMagicBytes(validPng, "image/png"),
    "Accepts authentic PNG header (89 50 4E 47)"
  );

  // 1.3 Valid WebP buffer header (RIFF....WEBP)
  const validWebp = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20, // VP8
  ]);
  assert(
    validateImageMagicBytes(validWebp, "image/webp"),
    "Accepts authentic WebP header (RIFF....WEBP)"
  );

  // 1.4 MIME-spoofing rejection: Executable / script disguised as image/jpeg
  const fakeJpeg = Buffer.from("#!/bin/bash\necho 'malicious executable payload'");
  assert(
    !validateImageMagicBytes(fakeJpeg, "image/jpeg"),
    "Rejects shell script spoofed as image/jpeg"
  );

  // 1.5 MIME-spoofing rejection: HTML/PHP disguised as image/png
  const fakePng = Buffer.from("<?php echo 'php backdoor'; ?>");
  assert(
    !validateImageMagicBytes(fakePng, "image/png"),
    "Rejects PHP script spoofed as image/png"
  );

  // 1.6 Short / truncated buffer rejection
  const shortBuffer = Buffer.from([0xff, 0xd8]);
  assert(
    !validateImageMagicBytes(shortBuffer, "image/jpeg"),
    "Rejects truncated binary buffer (< 12 bytes)"
  );

  // 1.7 MIME type whitelist restriction
  assert(
    ALLOWED_MIME_TYPES.includes("image/jpeg") &&
    ALLOWED_MIME_TYPES.includes("image/png") &&
    ALLOWED_MIME_TYPES.includes("image/webp"),
    "MIME whitelist includes only JPEG, PNG, and WebP"
  );
  assert(
    !ALLOWED_MIME_TYPES.includes("image/svg+xml"),
    "MIME whitelist strictly excludes SVG to prevent stored XSS"
  );
  assert(
    !ALLOWED_MIME_TYPES.includes("text/html") &&
    !ALLOWED_MIME_TYPES.includes("application/javascript"),
    "MIME whitelist strictly excludes HTML and scripts"
  );

  // 1.8 Upload size ceiling (10 MB)
  assert(MAX_UPLOAD_SIZE_BYTES === 10 * 1024 * 1024, "Enforces strict 10 MB upload ceiling");
}

// -----------------------------------------------------------------------------
// Suite 2: Filename Sanitization & Path Traversal Prevention
// -----------------------------------------------------------------------------
console.log("\nSuite 2: Filename Sanitization & Path Traversal Defense");
{
  // 2.1 Directory traversal attacks
  const traversalAttempt = "../../etc/passwd.jpg";
  const sanitized1 = sanitizeFilename(traversalAttempt);
  assert(
    !sanitized1.includes("..") && !sanitized1.includes("/") && !sanitized1.includes("\\"),
    `Strips path traversal sequences from "${traversalAttempt}" -> "${sanitized1}"`
  );

  // 2.2 Null byte injection
  const nullByteAttempt = "poster.jpg\0.exe";
  const sanitized2 = sanitizeFilename(nullByteAttempt);
  assert(
    !sanitized2.includes("\0"),
    `Strips null bytes from "${nullByteAttempt}" -> "${sanitized2}"`
  );

  // 2.3 Windows alternate data stream / backslash traversal
  const windowsTraversal = "..\\..\\windows\\system32\\calc.png";
  const sanitized3 = sanitizeFilename(windowsTraversal);
  assert(
    !sanitized3.includes("..") && !sanitized3.includes("\\"),
    `Strips Windows directory traversal from "${windowsTraversal}" -> "${sanitized3}"`
  );

  // 2.4 Control character injection
  const controlChars = "poster\x1b\x08test.png";
  const sanitized4 = sanitizeFilename(controlChars);
  assert(
    !sanitized4.includes("\x1b") && !sanitized4.includes("\x08"),
    `Strips ANSI / control characters from "${controlChars}" -> "${sanitized4}"`
  );

  // 2.5 Extremely long filename
  const longName = "a".repeat(250) + ".jpeg";
  const sanitized5 = sanitizeFilename(longName);
  assert(
    sanitized5.length <= 100,
    `Truncates oversized filename from 255 chars to <= 100 chars (result: ${sanitized5.length})`
  );
}

// -----------------------------------------------------------------------------
// Suite 3: Zod Schema Payload Inflation & Contract Robustness
// -----------------------------------------------------------------------------
console.log("\nSuite 3: Input Validation & Schema Defenses");
{
  const validDoc = createDefaultPosterDocument("reddington");

  // 3.1 Valid document passes
  const parseResult1 = PosterDocumentSchema.safeParse(validDoc);
  assert(parseResult1.success, "Canonical default PosterDocument passes schema validation");

  // 3.2 Oversized eventTitle (> 150 chars) rejection
  const inflatedTitleDoc = {
    ...validDoc,
    content: {
      ...validDoc.content,
      eventTitle: "A".repeat(151),
    },
  };
  const parseResult2 = PosterDocumentSchema.safeParse(inflatedTitleDoc);
  assert(!parseResult2.success, "Schema rejects eventTitle exceeding 150 characters");

  // 3.3 Oversized draft name (> 200 chars) rejection
  const inflatedNameDoc = {
    ...validDoc,
    name: "B".repeat(201),
  };
  const parseResult3 = PosterDocumentSchema.safeParse(inflatedNameDoc);
  assert(!parseResult3.success, "Schema rejects draft name exceeding 200 characters");

  // 3.4 Oversized primaryOffer (> 300 chars) rejection
  const inflatedOfferDoc = {
    ...validDoc,
    content: {
      ...validDoc.content,
      primaryOffer: "C".repeat(301),
    },
  };
  const parseResult4 = PosterDocumentSchema.safeParse(inflatedOfferDoc);
  assert(!parseResult4.success, "Schema rejects primaryOffer exceeding 300 characters");

  // 3.5 Too many DJs (> 20 items) rejection
  const inflatedLineupDoc = {
    ...validDoc,
    content: {
      ...validDoc.content,
      djNames: Array.from({ length: 25 }, (_, i) => `DJ ${i}`),
    },
  };
  const parseResult5 = PosterDocumentSchema.safeParse(inflatedLineupDoc);
  assert(!parseResult5.success, "Schema rejects DJ lineup exceeding 20 entries");

  // 3.6 Non-canonical canvas rejection
  const nonCanonicalCanvas = {
    ...validDoc,
    canvas: {
      width: 1920,
      height: 1080,
      format: "landscape-16x9",
    },
  };
  const parseResult6 = PosterDocumentSchema.safeParse(nonCanonicalCanvas);
  assert(!parseResult6.success, "Schema rejects non-canonical canvas dimensions (1920x1080)");

  // 3.7 Invalid templateId rejection
  const unknownTemplateDoc = {
    ...validDoc,
    templateId: "unregistered_template_xyz",
  };
  const parseResult7 = PosterDocumentSchema.safeParse(unknownTemplateDoc);
  assert(!parseResult7.success, "Schema rejects unregistered template ID");
}

// -----------------------------------------------------------------------------
// Suite 4: Accessibility (a11y) & Usability Conformance
// -----------------------------------------------------------------------------
console.log("\nSuite 4: Accessibility & Dialog Contract Conformance");
{
  // 4.1 Check Dialog.tsx source for accessibility attributes
  const dialogSrc = fs.readFileSync(
    path.join(__dirname, "../src/components/ui/Dialog.tsx"),
    "utf-8"
  );
  assert(dialogSrc.includes('role="dialog"'), 'Dialog implements role="dialog"');
  assert(dialogSrc.includes('aria-modal="true"'), 'Dialog implements aria-modal="true"');
  assert(dialogSrc.includes('aria-labelledby="dialog-title"'), 'Dialog links title with aria-labelledby');
  assert(dialogSrc.includes('aria-label="Close dialog"'), 'Dialog close button has accessible aria-label');
  assert(dialogSrc.includes('min-h-[44px]') && dialogSrc.includes('min-w-[44px]'), 'Dialog close button enforces 44x44px touch target');
  assert(dialogSrc.includes('e.key === "Escape"'), 'Dialog implements Escape key listener');

  // 4.2 Check Button.tsx for 44px mobile touch target
  const buttonSrc = fs.readFileSync(
    path.join(__dirname, "../src/components/ui/Button.tsx"),
    "utf-8"
  );
  assert(buttonSrc.includes("min-h-[44px]"), "Button component defines 44px minimum mobile touch target");

  // 4.3 Check globals.css for prefers-reduced-motion
  const cssSrc = fs.readFileSync(
    path.join(__dirname, "../src/app/globals.css"),
    "utf-8"
  );
  assert(
    cssSrc.includes("prefers-reduced-motion: reduce"),
    "globals.css implements @media (prefers-reduced-motion: reduce) accessibility override"
  );

  // 4.4 Check EditorErrorBoundary implementation
  const errorBoundarySrc = fs.readFileSync(
    path.join(__dirname, "../src/components/editor/EditorErrorBoundary.tsx"),
    "utf-8"
  );
  assert(errorBoundarySrc.includes('role="alert"'), 'EditorErrorBoundary has role="alert"');
  assert(errorBoundarySrc.includes('aria-live="assertive"'), 'EditorErrorBoundary has aria-live="assertive"');
  assert(errorBoundarySrc.includes("Retry Canvas"), "EditorErrorBoundary provides recovery retry action");
}

// -----------------------------------------------------------------------------
// Suite 5: Dependency Vulnerability Audit Verification
// -----------------------------------------------------------------------------
console.log("\nSuite 5: Dependency Audit Review");
{
  // Verify audit report exists and documents findings
  const reportPath = path.join(__dirname, "../docs/security-audit-report.md");
  assert(fs.existsSync(reportPath), "Security audit report exists at docs/security-audit-report.md");

  const reportContent = fs.readFileSync(reportPath, "utf-8");
  assert(reportContent.includes("npm audit"), "Audit report documents npm audit analysis");
  assert(reportContent.includes("0 Critical"), "Audit report confirms 0 critical vulnerabilities");
  assert(reportContent.includes("deepmerge-ts"), "Audit report evaluates deepmerge-ts build-time scope");
  assert(reportContent.includes("tailwindcss"), "Audit report evaluates tailwindcss build-time scope");
  assert(reportContent.includes("postcss"), "Audit report evaluates postcss build-time scope");
}

// -----------------------------------------------------------------------------
// Suite 6: Server-Side Secret Boundaries & Environment Isolation
// -----------------------------------------------------------------------------
console.log("\nSuite 6: Server-Side Secret Boundaries & Environment Isolation");
{
  // 6.1 Check .env.example exists and has no production secrets
  const envExamplePath = path.join(__dirname, "../.env.example");
  assert(fs.existsSync(envExamplePath), ".env.example exists in repository root");
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, "utf-8");
    assert(!envExample.includes("Toshmoney") && !envExample.includes("FrankMoh254"), ".env.example does not contain operator passwords");
    assert(!envExample.includes("supabase.co") && !envExample.includes("pooler.supabase.com"), ".env.example does not leak live Supabase credentials");
  }

  // 6.2 Check .gitignore excludes .env files and SQLite files
  const gitignorePath = path.join(__dirname, "../.gitignore");
  const gitignore = fs.readFileSync(gitignorePath, "utf-8");
  assert(gitignore.includes(".env"), ".gitignore excludes .env files");
  assert(gitignore.includes("*.sqlite"), ".gitignore excludes sqlite files");

  // 6.3 Verify client components do not bundle server credentials
  const clientAuthFile = fs.readFileSync(path.join(__dirname, "../src/lib/auth-client.ts"), "utf-8");
  assert(!clientAuthFile.includes("BETTER_AUTH_SECRET"), "auth-client.ts does NOT reference BETTER_AUTH_SECRET");
  assert(!clientAuthFile.includes("DATABASE_URL"), "auth-client.ts does NOT reference DATABASE_URL");
}
console.log("\n================================================================================");
console.log(`AUDIT TEST RESULTS: ${passedCount} passed, ${failedCount} failed`);
console.log("================================================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("STAGE 20 AUDIT ACCEPTANCE CRITERIA VERIFIED (Gate Passed)");
}
