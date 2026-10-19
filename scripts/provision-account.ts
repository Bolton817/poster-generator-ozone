import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

async function provisionAccount() {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const username = getArg("--username") || "ozone_operator";
  const password = getArg("--password") || "OzoneLounge2026!";
  const name = getArg("--name") || (username === "ozone_admin" ? "Ozone Lounge Admin" : "Ozone Lounge Operator");
  const role = getArg("--role") || (username === "ozone_admin" ? "admin" : "operator");
  const email = getArg("--email") || `${username}@ozonelounge.internal`;

  console.log(`Provisioning account for username: "${username}" with role: "${role}"...`);

  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    console.log(`User "${username}" already exists in PostgreSQL (ID: ${existingUser.id}). Re-initializing credentials...`);
    // Delete existing account records to reset password cleanly
    await db.account.deleteMany({
      where: { userId: existingUser.id },
    });
    await db.session.deleteMany({
      where: { userId: existingUser.id },
    });
    await db.user.delete({
      where: { id: existingUser.id },
    });
  }

  // Create user via Better Auth API
  const res = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      username,
    },
  });

  if (!res || !res.user) {
    throw new Error(`Failed to provision user "${username}" via Better Auth!`);
  }

  // Set role
  await db.user.update({
    where: { id: res.user.id },
    data: { role },
  });

  console.log(`Successfully provisioned account:`);
  console.log(`  User ID:  ${res.user.id}`);
  console.log(`  Username: ${username}`);
  console.log(`  Role:     ${role}`);
  console.log(`  Email:    ${email}`);
}

provisionAccount()
  .catch((err) => {
    console.error("Account provisioning failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
