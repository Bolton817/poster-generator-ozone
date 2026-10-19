import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

async function testAuthentication() {
  console.log("Starting authentication verification test suite...");

  // 1. Test invalid password
  console.log("\n[TEST 1] Sign in with wrong password...");
  try {
    const failedAttempt = await auth.api.signInUsername({
      body: {
        username: "ozone_operator",
        password: "WrongPassword123!",
      },
    });

    if (failedAttempt) {
      throw new Error("Security failure: Sign in succeeded with an invalid password!");
    }
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || String(err);
    console.log(`[PASS] Correctly rejected invalid password. Error message: ${errorMsg}`);
  }

  // 2. Test non-existent username
  console.log("\n[TEST 2] Sign in with non-existent username...");
  try {
    const invalidUserAttempt = await auth.api.signInUsername({
      body: {
        username: "non_existent_operator_xyz",
        password: "SomePassword123!",
      },
    });

    if (invalidUserAttempt) {
      throw new Error("Security failure: Sign in succeeded with a non-existent username!");
    }
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || String(err);
    console.log(`[PASS] Correctly rejected non-existent user. Error message: ${errorMsg}`);
  }

  // 3. Test valid sign in with correct credentials
  console.log("\n[TEST 3] Sign in with valid operator credentials...");
  const res = await auth.api.signInUsername({
    body: {
      username: "ozone_operator",
      password: "OzoneOperator2026!",
    },
    asResponse: true,
  });

  if (!res.ok) {
    throw new Error(`Failed to sign in: status ${res.status}`);
  }

  const setCookie = res.headers.get("set-cookie");
  const data = await res.json();

  if (!data || !data.token || !data.user) {
    throw new Error("Failed to receive token and user in sign in response!");
  }

  console.log(`[PASS] Successfully authenticated operator.`);
  console.log(`       User ID: ${data.user.id}`);
  console.log(`       Session Token: ${data.token.substring(0, 10)}...`);

  // 4. Verify session exists in PostgreSQL
  console.log("\n[TEST 4] Verify session in PostgreSQL...");
  const sessionInDb = await db.session.findUnique({
    where: { token: data.token },
  });

  if (!sessionInDb || sessionInDb.userId !== data.user.id) {
    throw new Error("Session record was not found in database session table!");
  }
  console.log(`[PASS] Verified active session in PostgreSQL (expires at: ${sessionInDb.expiresAt.toISOString()})`);

  // 5. Verify server session resolution with cookie
  console.log("\n[TEST 5] Verify getSession resolving authenticated user...");
  const headers = new Headers();
  if (setCookie) {
    headers.set("cookie", setCookie);
  } else {
    headers.set("cookie", `better-auth.session_token=${data.token}`);
  }
  headers.set("authorization", `Bearer ${data.token}`);

  const resolvedSession = await auth.api.getSession({
    headers,
  });

  if (!resolvedSession || resolvedSession.user.id !== data.user.id) {
    throw new Error("Failed to resolve session via auth.api.getSession!");
  }
  console.log(`[PASS] Resolved session user: ${resolvedSession.user.name} (${resolvedSession.user.email})`);

  // 6. Test session revocation / logout
  console.log("\n[TEST 6] Revoke session (logout)...");
  await auth.api.signOut({
    headers,
  });

  const checkRevoked = await db.session.findUnique({
    where: { token: data.token },
  });

  if (checkRevoked !== null) {
    throw new Error("Session token was not revoked in database after signOut!");
  }
  console.log(`[PASS] Session successfully invalidated in PostgreSQL.`);

  console.log("\n=======================================================");
  console.log("All Authentication & Session tests PASSED successfully!");
  console.log("=======================================================");
}

testAuthentication()
  .catch((e) => {
    console.error("Auth test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
