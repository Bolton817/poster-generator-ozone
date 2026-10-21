/**
 * Stage 21 Verification Test Suite: Deployment, Environments, and Operations
 * TDD v1.0 Pages 100-101 (Gate G21)
 */

import fs from "fs";
import path from "path";
import { sanitizeLogData, formatErrorForLog, logger } from "../src/lib/logger";
import { LocalFileStorageService } from "../src/lib/storage/local-storage";
import { SupabaseStorageService } from "../src/lib/storage/supabase-storage";
import nextConfig from "../next.config";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runStage21Suite() {
  console.log("================================================================================");
  console.log("STAGE 21 AUDIT SUITE: Deployment, Environments, and Operations");
  console.log("================================================================================\n");

  const projectRoot = process.cwd();

  // ---------------------------------------------------------------------------
  // Suite 1: Environment Profiles & Secret Boundary Enforcement
  // ---------------------------------------------------------------------------
  console.log("Suite 1: Environment Profiles & Secret Boundary Enforcement");
  const envExamplePath = path.join(projectRoot, ".env.example");
  assert(fs.existsSync(envExamplePath), ".env.example exists in repository root");

  const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
  assert(envExampleContent.includes("DATABASE_URL="), ".env.example documents DATABASE_URL");
  assert(envExampleContent.includes("DIRECT_URL="), ".env.example documents DIRECT_URL for migrations");
  assert(envExampleContent.includes("AUTH_SECRET="), ".env.example documents AUTH_SECRET");
  assert(envExampleContent.includes("APP_BASE_URL="), ".env.example documents APP_BASE_URL");
  assert(envExampleContent.includes("STORAGE_PROVIDER="), ".env.example documents STORAGE_PROVIDER");
  assert(envExampleContent.includes("SUPABASE_URL="), ".env.example documents SUPABASE_URL");
  assert(envExampleContent.includes("SUPABASE_SERVICE_ROLE_KEY="), ".env.example documents SUPABASE_SERVICE_ROLE_KEY");

  // Verify .env.example does not leak live credentials
  assert(!envExampleContent.includes("PosterEngine254!"), ".env.example does not leak live database passwords");
  assert(!envExampleContent.includes("7f5c762149b14f8ab4a6e872e41c48dc88a53e920d34f0e6"), ".env.example does not leak live auth secrets");

  // Verify gitignore and dockerignore secret boundaries
  const gitignoreContent = fs.readFileSync(path.join(projectRoot, ".gitignore"), "utf-8");
  assert(gitignoreContent.includes(".env"), ".gitignore excludes .env files");

  const dockerignorePath = path.join(projectRoot, ".dockerignore");
  assert(fs.existsSync(dockerignorePath), ".dockerignore exists");
  const dockerignoreContent = fs.readFileSync(dockerignorePath, "utf-8");
  assert(dockerignoreContent.includes(".env"), ".dockerignore excludes .env secrets");
  assert(dockerignoreContent.includes("node_modules"), ".dockerignore excludes node_modules");

  // Verify client bundle isolation
  const authClientContent = fs.readFileSync(path.join(projectRoot, "src/lib/auth-client.ts"), "utf-8");
  assert(!authClientContent.includes("AUTH_SECRET"), "auth-client.ts does not reference AUTH_SECRET");
  assert(!authClientContent.includes("DATABASE_URL"), "auth-client.ts does not reference DATABASE_URL");
  assert(!authClientContent.includes("DIRECT_URL"), "auth-client.ts does not reference DIRECT_URL");

  console.log("");

  // ---------------------------------------------------------------------------
  // Suite 2: Operational Logging & Sensitive Data Redaction
  // ---------------------------------------------------------------------------
  console.log("Suite 2: Operational Logging & Sensitive Data Redaction");

  // Test redaction of sensitive key names
  const testPayload = {
    username: "Bolton",
    password: "SuperSecretPassword123",
    authToken: "jwt_eyJhbGciOi...",
    sessionCookie: "better-auth.session_token=xyz",
    nested: {
      api_key: "key_987654321",
      service_role_key: "secret_admin_key",
      database_url: "postgresql://user:pass@host/db",
      safePublicField: "Ozone Lounge Event",
    },
    tags: ["party", "afrobeat"],
    rawBuffer: Buffer.from("fake-binary-image-data"),
  };

  const sanitized = sanitizeLogData(testPayload) as any;
  assert(sanitized.username === "Bolton", "Preserves safe top-level fields");
  assert(sanitized.password === "[REDACTED]", "Redacts 'password' field");
  assert(sanitized.authToken === "[REDACTED]", "Redacts 'authToken' field");
  assert(sanitized.sessionCookie === "[REDACTED]", "Redacts 'sessionCookie' field");
  assert(sanitized.nested.api_key === "[REDACTED]", "Redacts nested 'api_key' field");
  assert(sanitized.nested.service_role_key === "[REDACTED]", "Redacts nested 'service_role_key' field");
  assert(sanitized.nested.database_url === "[REDACTED]", "Redacts nested 'database_url' field");
  assert(sanitized.nested.safePublicField === "Ozone Lounge Event", "Preserves safe nested values");
  assert(sanitized.rawBuffer.includes("Binary Buffer"), "Summarizes binary buffers without dumping bytes");

  // Test error formatting
  const testErr = new Error("Connection failed to postgresql://user:pass@host/db");
  const formattedErr = formatErrorForLog(testErr);
  assert(formattedErr?.message === "[REDACTED ERROR MESSAGE]", "Redacts error messages matching connection string patterns");

  // Test logger methods execute safely
  let logCallSuccess = true;
  try {
    logger.info("system", "Test info message", { status: "ready" });
    logger.warn("auth", "Test auth warning", { username: "unknown_user" });
    logger.error("drafts", "Test draft error", new Error("Simulated query timeout"));
    logger.debug("export", "Test debug log", { format: "png" });
  } catch {
    logCallSuccess = false;
  }
  assert(logCallSuccess, "Logger methods (info, warn, error, debug) execute cleanly without throwing");

  console.log("");

  // ---------------------------------------------------------------------------
  // Suite 3: Multi-Provider Storage Architecture (Decision 10)
  // ---------------------------------------------------------------------------
  console.log("Suite 3: Multi-Provider Storage Architecture (Decision 10)");

  const localStorage = new LocalFileStorageService();
  assert(typeof localStorage.upload === "function", "LocalFileStorageService implements upload()");
  assert(typeof localStorage.delete === "function", "LocalFileStorageService implements delete()");
  assert(typeof localStorage.getUrl === "function", "LocalFileStorageService implements getUrl()");
  assert(localStorage.getUrl("test-key.png") === "/uploads/test-key.png", "LocalFileStorageService produces /uploads URL");

  const supabaseStorage = new SupabaseStorageService({
    supabaseUrl: "https://mockproject.supabase.co",
    serviceRoleKey: "mock-service-key",
    bucketName: "ozone-poster-assets",
  });
  assert(typeof supabaseStorage.upload === "function", "SupabaseStorageService implements upload()");
  assert(typeof supabaseStorage.delete === "function", "SupabaseStorageService implements delete()");
  assert(typeof supabaseStorage.getUrl === "function", "SupabaseStorageService implements getUrl()");
  assert(supabaseStorage.isConfigured() === true, "SupabaseStorageService reports isConfigured() === true when keys provided");
  assert(
    supabaseStorage.getUrl("user123/poster.png") ===
      "https://mockproject.supabase.co/storage/v1/object/public/ozone-poster-assets/user123/poster.png",
    "SupabaseStorageService produces correct public object CDN URL"
  );

  const unconfiguredSupabase = new SupabaseStorageService({ supabaseUrl: "", serviceRoleKey: "" });
  assert(unconfiguredSupabase.isConfigured() === false, "SupabaseStorageService reports isConfigured() === false when unconfigured");

  console.log("");

  // ---------------------------------------------------------------------------
  // Suite 4: Production HTTP Security Headers & Cache Configuration
  // ---------------------------------------------------------------------------
  console.log("Suite 4: Production HTTP Security Headers & Cache Configuration");

  assert(typeof nextConfig.headers === "function", "next.config.ts defines headers() async method");
  const headersList = await (nextConfig.headers ? nextConfig.headers() : []);

  const globalHeaderRule = headersList.find((h: any) => h.source === "/:path*");
  assert(Boolean(globalHeaderRule), "nextConfig defines global /:path* security headers rule");

  const headerKeys = (globalHeaderRule?.headers || []).map((h: any) => h.key);
  assert(headerKeys.includes("X-Content-Type-Options"), "Security headers include X-Content-Type-Options");
  assert(headerKeys.includes("X-Frame-Options"), "Security headers include X-Frame-Options");
  assert(headerKeys.includes("Referrer-Policy"), "Security headers include Referrer-Policy");
  assert(headerKeys.includes("Permissions-Policy"), "Security headers include Permissions-Policy");

  const fontHeaderRule = headersList.find((h: any) => h.source === "/fonts/:path*");
  assert(Boolean(fontHeaderRule), "nextConfig defines caching headers for /fonts/:path*");
  const fontCacheHeader = fontHeaderRule?.headers.find((h: any) => h.key === "Cache-Control");
  assert(
    Boolean(fontCacheHeader?.value.includes("immutable") && fontCacheHeader?.value.includes("max-age=")),
    "Font caching policy specifies immutable long-lived max-age"
  );

  const thumbHeaderRule = headersList.find((h: any) => h.source === "/template-thumbnails/:path*");
  assert(Boolean(thumbHeaderRule), "nextConfig defines caching headers for /template-thumbnails/:path*");

  console.log("");

  // ---------------------------------------------------------------------------
  // Suite 5: Container Architecture & Dockerfile Integrity
  // ---------------------------------------------------------------------------
  console.log("Suite 5: Container Architecture & Dockerfile Integrity");

  const dockerfilePath = path.join(projectRoot, "Dockerfile");
  assert(fs.existsSync(dockerfilePath), "Dockerfile exists");
  const dockerfileContent = fs.readFileSync(dockerfilePath, "utf-8");

  assert(dockerfileContent.includes("AS base"), "Dockerfile defines 'base' stage");
  assert(dockerfileContent.includes("AS deps"), "Dockerfile defines 'deps' stage");
  assert(dockerfileContent.includes("AS builder"), "Dockerfile defines 'builder' stage");
  assert(dockerfileContent.includes("AS runner"), "Dockerfile defines 'runner' stage");
  assert(dockerfileContent.includes("prisma generate"), "Dockerfile executes prisma generate in builder");
  assert(dockerfileContent.includes("USER nextjs"), "Dockerfile enforces unprivileged non-root user (nextjs)");
  assert(dockerfileContent.includes("HEALTHCHECK"), "Dockerfile defines automated container HEALTHCHECK");

  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  assert(fs.existsSync(dockerComposePath), "docker-compose.yml exists");
  const dockerComposeContent = fs.readFileSync(dockerComposePath, "utf-8");
  assert(dockerComposeContent.includes("3005:3000"), "docker-compose.yml maps container port to 3005");
  assert(dockerComposeContent.includes("healthcheck"), "docker-compose.yml defines healthcheck configuration");

  console.log("");

  // ---------------------------------------------------------------------------
  // Suite 6: Deployment & Operations Documentation Completeness
  // ---------------------------------------------------------------------------
  console.log("Suite 6: Deployment & Operations Documentation Completeness");

  const deployGuidePath = path.join(projectRoot, "docs/deployment-guide.md");
  assert(fs.existsSync(deployGuidePath), "docs/deployment-guide.md exists");
  const deployGuideContent = fs.readFileSync(deployGuidePath, "utf-8");
  assert(deployGuideContent.includes("prisma migrate deploy"), "Deployment guide documents safe 'prisma migrate deploy' command");
  assert(deployGuideContent.includes("db:seed"), "Deployment guide documents idempotent 'db:seed' procedure");
  assert(deployGuideContent.includes("Vercel"), "Deployment guide documents Vercel hosting setup");
  assert(deployGuideContent.includes("Docker"), "Deployment guide documents Docker container setup");
  assert(deployGuideContent.includes("CORS"), "Deployment guide documents Supabase Storage CORS setup");

  const opsGuidePath = path.join(projectRoot, "docs/operations-and-backup.md");
  assert(fs.existsSync(opsGuidePath), "docs/operations-and-backup.md exists");
  const opsGuideContent = fs.readFileSync(opsGuidePath, "utf-8");
  assert(opsGuideContent.includes("pg_dump"), "Operations runbook documents logical database backup via pg_dump");
  assert(opsGuideContent.includes("pg_restore"), "Operations runbook documents database restore via pg_restore");
  assert(opsGuideContent.includes("Rollback Strategy"), "Operations runbook documents safe rollback strategy");
  assert(opsGuideContent.includes("Credential & Secret Rotation") || opsGuideContent.includes("Credential Rotation"), "Operations runbook documents secret rotation SOP");

  console.log("");

  // ---------------------------------------------------------------------------
  // Suite 7: Live Remote / Staging Smoke Test Capability (Optional --url flag)
  // ---------------------------------------------------------------------------
  const urlArg = process.argv.find((arg) => arg.startsWith("--url="));
  if (urlArg) {
    const targetUrl = urlArg.replace("--url=", "").replace(/\/+$/, "");
    console.log(`Suite 7: Live Target Smoke Verification (${targetUrl})`);

    try {
      const healthRes = await fetch(`${targetUrl}/api/health`);
      assert(healthRes.status === 200, `Health endpoint returns HTTP 200 at ${targetUrl}`);
      const healthJson = await healthRes.json();
      assert(healthJson.status === "ok", "Health status reports 'ok'");
      assert(healthJson.canvas?.defaultWidth === 1080, "Health endpoint confirms 1080px canvas standard");
      assert(healthJson.canvas?.defaultHeight === 1350, "Health endpoint confirms 1350px canvas standard");

      const fontRes = await fetch(`${targetUrl}/fonts/Inter-Variable.ttf`);
      assert(fontRes.status === 200, "Static font /fonts/Inter-Variable.ttf is accessible over HTTP");

      const thumbRes = await fetch(`${targetUrl}/template-thumbnails/reddington.svg`);
      assert(thumbRes.status === 200, "Template thumbnail /template-thumbnails/reddington.svg is accessible over HTTP");

      const loginRes = await fetch(`${targetUrl}/login`);
      assert(loginRes.status === 200, "Operator login page /login returns HTTP 200");
    } catch (err) {
      console.error("  [FAIL] Remote smoke verification encountered network error:", err);
      process.exitCode = 1;
    }
    console.log("");
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("================================================================================");
  console.log(`STAGE 21 RESULTS: ${passedTests} passed, ${totalTests - passedTests} failed (${totalTests} total)`);
  console.log("================================================================================");

  if (passedTests === totalTests) {
    console.log("STAGE 21 ACCEPTANCE CRITERIA VERIFIED (Gate Passed)");
  } else {
    console.error("STAGE 21 GATES FAILED: Please fix assertion errors above.");
    process.exit(1);
  }
}

runStage21Suite().catch((err) => {
  console.error("Fatal error running Stage 21 audit:", err);
  process.exit(1);
});
