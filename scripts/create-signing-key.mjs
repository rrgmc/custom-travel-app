#!/usr/bin/env node
// Creates a signing key for this trip's APK and stores it in the repo, so every build is signed the
// same way and new versions install over old ones. Only for PRIVATE trip repos: anyone who can read
// the repo can sign an app as yours. The template itself never contains a key.
//
//   npm run signing:create
//
// Writes android/signing/release.jks and android/signing/signing.env (passwords), and adds a
// .gitignore exception for the keystore. The CI workflow picks them up when there are no signing
// secrets. See docs/android-build.md.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "android/signing");
const jks = join(dir, "release.jks");
if (existsSync(jks)) {
  console.error("android/signing/release.jks already exists; keep using it (a new key breaks updates).");
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const password = randomBytes(18).toString("base64url");
const alias = "travel";
execFileSync("keytool", [
  "-genkeypair", "-keystore", jks, "-alias", alias, "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
  "-storepass", password, "-keypass", password, "-dname", "CN=Travel app",
], { stdio: "inherit" });
writeFileSync(join(dir, "signing.env"),
  `# Passwords for release.jks. Private repos only; see docs/android-build.md.\n` +
  `ANDROID_KEYSTORE_PASSWORD=${password}\nANDROID_KEY_ALIAS=${alias}\nANDROID_KEY_PASSWORD=${password}\n`);

// *.jks is ignored everywhere else; this one file is committed on purpose.
const gi = join(root, ".gitignore");
const rule = "!android/signing/release.jks";
if (!readFileSync(gi, "utf8").split("\n").includes(rule)) appendFileSync(gi, `\n# This trip's signing key, committed on purpose (private repo)\n${rule}\n`);

console.log("Created android/signing/release.jks and signing.env. Commit both; keep the repo private.");
