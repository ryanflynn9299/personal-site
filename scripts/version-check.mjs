#!/usr/bin/env node

/**
 * Ensures package.json version is documented in CHANGELOG.md.
 * SITE_VERSION is derived from package.json at build time — no duplicate to check.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8")
);
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const version = packageJson.version;

const versionHeading = `## [${version}]`;

if (!changelog.includes(versionHeading)) {
  console.error(
    `version:check failed — CHANGELOG.md is missing a section for ${version}`
  );
  console.error(`Expected heading: ${versionHeading}`);
  console.error(
    "Add a release section before merging a version bump to main. See .docs/dev/VERSIONING.md"
  );
  process.exit(1);
}

console.log(`version:check passed (${version})`);
