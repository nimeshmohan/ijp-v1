/**
 * One-off bootstrap script to create the first admin account.
 * Run with: npm run create-admin -w server -- <email> <password> "<display name>"
 *
 * Uses the same Firebase Admin credentials as the server (server/.env),
 * so it must be run from an environment that has those set.
 */
import type { AppUser } from "@ijp/shared";
import { firebaseAuth, firestore } from "../config/firebaseAdmin";

async function main(): Promise<void> {
  const [, , email, password, displayName] = process.argv;

  if (!email || !password || !displayName) {
    console.error(
      'Usage: npm run create-admin -w server -- <email> <password> "<display name>"',
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const userRecord = await firebaseAuth.createUser({
    email,
    password,
    displayName,
  });

  const appUser: AppUser = {
    uid: userRecord.uid,
    email,
    displayName,
    role: "admin",
    disabled: false,
    createdAt: new Date().toISOString(),
    createdBy: "bootstrap-script",
  };

  const { uid, ...profile } = appUser;
  await firestore.collection("users").doc(uid).set(profile);

  console.log(`Admin user created: ${appUser.email} (uid: ${appUser.uid})`);
}

main().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exitCode = 1;
});
