import { auth } from "../src/lib/auth";

async function testAppShell() {
  console.log("Starting App Shell & Protected Workspace Smoke Test...");

  // 1. Authenticate as Franklin
  const loginRes = await auth.api.signInUsername({
    body: {
      username: "Franklin",
      password: "FrankMoh254",
    },
    asResponse: true,
  });

  if (!loginRes.ok) {
    throw new Error(`Failed to log in as Franklin: ${loginRes.status}`);
  }

  const cookie = loginRes.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("No session cookie returned from sign in!");
  }
  console.log("[PASS] Successfully authenticated as Franklin.");

  // Helper to fetch with session cookie
  const fetchAuth = async (path: string) => {
    return fetch(`http://localhost:3005${path}`, {
      headers: {
        cookie,
      },
    });
  };

  // 2. Test /app/templates
  console.log("\n[TEST] Verifying /app/templates route with session...");
  const templatesRes = await fetchAuth("/app/templates");
  if (templatesRes.status !== 200) {
    throw new Error(`/app/templates returned status ${templatesRes.status}`);
  }
  const templatesHtml = await templatesRes.text();
  if (!templatesHtml.includes("Weekly Event Templates") || !templatesHtml.includes("Reddington")) {
    throw new Error("/app/templates HTML missing expected template content!");
  }
  console.log("[PASS] /app/templates rendered successfully (HTTP 200).");

  // 3. Test /app/drafts
  console.log("\n[TEST] Verifying /app/drafts route with session...");
  const draftsRes = await fetchAuth("/app/drafts");
  if (draftsRes.status !== 200) {
    throw new Error(`/app/drafts returned status ${draftsRes.status}`);
  }
  const draftsHtml = await draftsRes.text();
  if (!draftsHtml.includes("Saved Poster Drafts")) {
    throw new Error("/app/drafts HTML missing expected drafts content!");
  }
  console.log("[PASS] /app/drafts rendered successfully (HTTP 200).");

  // 4. Test /app/settings
  console.log("\n[TEST] Verifying /app/settings route with session...");
  const settingsRes = await fetchAuth("/app/settings");
  if (settingsRes.status !== 200) {
    throw new Error(`/app/settings returned status ${settingsRes.status}`);
  }
  const settingsHtml = await settingsRes.text();
  if (!settingsHtml.includes("Interface Theme Preference")) {
    throw new Error("/app/settings HTML missing expected settings content!");
  }
  console.log("[PASS] /app/settings rendered successfully (HTTP 200).");

  console.log("\n=======================================================");
  console.log("All App Shell & Navigation checks PASSED successfully!");
  console.log("=======================================================");
}

testAppShell()
  .catch((err) => {
    console.error("App shell test failed:", err);
    process.exit(1);
  });
