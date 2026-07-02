#!/usr/bin/env node

/**
 * Bumps package.json semver and prints CHANGELOG / git tag reminders.
 * See .docs/dev/VERSIONING.md for when to use patch vs minor vs major.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = join(root, "package.json");

const kind = process.argv[2];

if (!kind || !["patch", "minor", "major"].includes(kind)) {
  console.error("Usage: node scripts/bump-version.mjs <patch|minor|major>");
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const parts = packageJson.version.split(".").map(Number);

if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
  console.error(`Invalid current version: ${packageJson.version}`);
  process.exit(1);
}

let [major, minor, patch] = parts;

if (kind === "patch") {
  patch += 1;
} else if (kind === "minor") {
  minor += 1;
  patch = 0;
} else if (kind === "major") {
  if (major === 0) {
    console.warn(
      "Pre-1.0: prefer `version:minor` for releases. Reserve `version:major` for the 1.0.0 launch."
    );
  }
  major += 1;
  minor = 0;
  patch = 0;
}

const nextVersion = `${major}.${minor}.${patch}`;
packageJson.version = nextVersion;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Bumped version: ${nextVersion}`);
console.log("");
console.log("Next steps:");
console.log(
  `  1. Move [Unreleased] notes in CHANGELOG.md to ## [${nextVersion}] - YYYY-MM-DD`
);
console.log(`  2. pnpm run version:check`);
console.log(`  3. Commit: chore(release): v${nextVersion}`);
console.log(
  `  4. After merge to main: git tag v${nextVersion} && git push origin v${nextVersion}`
);
