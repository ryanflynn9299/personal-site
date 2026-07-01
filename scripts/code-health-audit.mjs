#!/usr/bin/env node
/**
 * Periodic code health audit — objective signals for CODE_HEALTH_SCORECARD.md
 *
 * NOT intended for every PR. Run quarterly or before major releases:
 *   pnpm run health:audit
 *   pnpm run health:audit:full   # includes E2E (slower)
 *
 * @see .docs/dev/CODE_HEALTH_SCORECARD.md
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const LOGS_DIR = join(ROOT, "logs");
const DATE = new Date().toISOString().slice(0, 10);
const INCLUDE_E2E = process.argv.includes("--e2e");

const ACTIVE_IGNORE = new Set([
  "node_modules",
  ".next",
  "out",
  "output",
  "components/archived",
  "infrastructure/sync-service",
]);

const lines = [];
const results = { pass: 0, warn: 0, fail: 0 };

function log(line = "") {
  lines.push(line);
  console.log(line);
}

function status(kind, label, detail = "") {
  const icon = kind === "pass" ? "✅" : kind === "warn" ? "⚠️" : "❌";
  results[kind]++;
  const suffix = detail ? ` — ${detail}` : "";
  log(`${icon} ${label}${suffix}`);
}

function run(command, opts = {}) {
  return execSync(command, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: opts.silent ? "pipe" : "inherit",
    ...opts,
  });
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) {
    return acc;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    if (ACTIVE_IGNORE.has(rel) || [...ACTIVE_IGNORE].some((i) => rel.startsWith(`${i}/`))) {
      continue;
    }
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, acc);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function grepFiles(files, pattern) {
  const hits = [];
  const re = new RegExp(pattern, "m");
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (re.test(content)) {
      hits.push(relative(ROOT, file));
    }
  }
  return hits;
}

function countPattern(files, pattern) {
  const re = new RegExp(pattern, "g");
  let count = 0;
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const matches = content.match(re);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function findClientServiceViolations(files) {
  const violations = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      continue;
    }
    if (/@\/lib\/services\//.test(content)) {
      violations.push(relative(ROOT, file));
    }
  }
  return violations;
}

function findArchivedImports(files) {
  const hits = [];
  for (const file of files) {
    const rel = relative(ROOT, file);
    if (rel.startsWith("components/archived/")) {
      continue;
    }
    const content = readFileSync(file, "utf8");
    if (
      /from\s+["']@\/components\/archived/.test(content) ||
      /from\s+["'][^"']*components\/archived/.test(content)
    ) {
      hits.push(rel);
    }
  }
  return hits;
}

function rootHygieneIssues() {
  const allowedRootFiles = new Set([
    "AGENTS.md",
    "Dockerfile",
    "LICENSE",
    "README.md",
    "docker-compose.yml",
    "eslint.config.mjs",
    "middleware.ts",
    "next-env.d.ts",
    "next.config.ts",
    "package.json",
    "playwright.config.ts",
    "pnpm-lock.yaml",
    "postcss.config.mjs",
    "tailwind.config.ts",
    "tsconfig.json",
    "vitest.config.ts",
    ".cursorrules",
    ".env",
    ".env.example",
    ".env.test",
    ".gitignore",
    ".npmrc",
    ".prettierrc",
    ".prettierignore",
  ]);
  const skipRootEntries = new Set([".git", ".next", "node_modules", "output"]);
  const knownDirs = new Set([
    "app",
    "components",
    "constants",
    "context",
    "data",
    "infrastructure",
    "lib",
    "logs",
    "public",
    "scripts",
    "tests",
    "types",
  ]);

  const issues = [];
  for (const entry of readdirSync(ROOT)) {
    if (skipRootEntries.has(entry)) {
      continue;
    }
    if (entry === ".cursor" || entry === ".github" || entry === ".docs") {
      continue;
    }

    const full = join(ROOT, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!knownDirs.has(entry)) {
        issues.push(`unexpected directory: ${entry}/`);
      }
    } else if (!allowedRootFiles.has(entry) && !entry.endsWith(".tsbuildinfo")) {
      issues.push(`unexpected file: ${entry}`);
    }
  }
  return issues;
}

function parseTestCount(output) {
  const match = output.match(/Tests\s+(\d+)\s+passed/);
  return match ? Number(match[1]) : null;
}

// --- Run audit ---

log("# Code health audit");
log(`Date: ${DATE}`);
log(`Mode: ${INCLUDE_E2E ? "full (with E2E)" : "standard"}`);
log("");
log("> This is a **periodic** review tool. See .docs/dev/CODE_HEALTH_SCORECARD.md");
log("");

log("## Tier A — Automated gates");
log("");

try {
  run("pnpm run validate", { silent: false });
  status("pass", "validate (type-check + prettier + eslint)");
} catch {
  status("fail", "validate (type-check + prettier + eslint)");
}

let testOutput = "";
try {
  testOutput = run("pnpm run test", { silent: true });
  const count = parseTestCount(testOutput);
  status("pass", "unit tests", count != null ? `${count} passed` : "passed");
} catch (e) {
  status("fail", "unit tests", e.stdout?.slice(-200) || "failed");
}

if (INCLUDE_E2E) {
  try {
    run("pnpm run test:e2e", { silent: false });
    status("pass", "E2E tests");
  } catch {
    status("fail", "E2E tests");
  }

  try {
    run("pnpm run build", { silent: false });
    status("pass", "production build");
  } catch {
    status("fail", "production build");
  }
} else {
  status("warn", "E2E tests", "skipped (use pnpm run health:audit:full)");
  status("warn", "production build", "skipped (use pnpm run health:audit:full)");
}

log("");
log("## Tier B–H — Static signals");
log("");

const appFiles = walk(join(ROOT, "app"));
const componentFiles = walk(join(ROOT, "components"));
const libFiles = walk(join(ROOT, "lib"));
const testFiles = walk(join(ROOT, "tests")).filter((f) => /\.test\.(ts|tsx)$/.test(f));
const activeSourceFiles = [...appFiles, ...componentFiles, ...libFiles];

const clientViolations = findClientServiceViolations([...appFiles, ...componentFiles]);
if (clientViolations.length === 0) {
  status("pass", "client → @/lib/services/* boundary", "0 violations");
} else {
  status("fail", "client → @/lib/services/* boundary", clientViolations.join(", "));
}

const archivedImports = findArchivedImports([...appFiles, ...componentFiles]);
if (archivedImports.length === 0) {
  status("pass", "active imports from components/archived/", "0 imports");
} else {
  status("fail", "active imports from components/archived/", archivedImports.join(", "));
}

const useClientCount = grepFiles([...appFiles, ...componentFiles], '^["\']use client["\']').length;
status("warn", `"use client" file count`, `${useClientCount} (track trend quarterly)`);

const testFileCount = testFiles.length;
const eslintDisableFileLevel = countPattern(
  activeSourceFiles.filter((f) => !relative(ROOT, f).startsWith("components/archived/")),
  "eslint-disable @typescript-eslint"
);
status(
  eslintDisableFileLevel <= 5 ? "pass" : "warn",
  "file-level eslint-disable comments (active code)",
  String(eslintDisableFileLevel)
);

const anyCasts = countPattern(
  activeSourceFiles.filter((f) => !relative(ROOT, f).startsWith("components/archived/")),
  " as any"
);
status(anyCasts <= 15 ? "pass" : "warn", "`as any` occurrences (active code)", String(anyCasts));

const rootIssues = rootHygieneIssues();
if (rootIssues.length === 0) {
  status("pass", "repository root hygiene");
} else {
  status("warn", "repository root hygiene", rootIssues.join("; "));
}

try {
  const auditOut = run("pnpm audit --audit-level=moderate 2>&1 || true", { silent: true });
  if (/found 0 vulnerabilities/i.test(auditOut)) {
    status("pass", "pnpm audit (moderate+)");
  } else if (/moderate|high|critical/i.test(auditOut)) {
    status("warn", "pnpm audit (moderate+)", "review output — run `pnpm audit`");
  } else {
    status("pass", "pnpm audit (moderate+)", "no moderate+ reported");
  }
} catch {
  status("warn", "pnpm audit", "could not run");
}

log("");
log("## Manual scorecard required");
log("");
log("Automated checks do not replace the 8-dimension rubric.");
log("Complete the manual sections in .docs/dev/CODE_HEALTH_SCORECARD.md");
log("and save a review log to logs/code-health-YYYY-MM-DD.md");
log("");
log("## Summary");
log(`Pass: ${results.pass} | Warn: ${results.warn} | Fail: ${results.fail}`);
log("");

if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

const reportPath = join(LOGS_DIR, `code-health-${DATE}.md`);
writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
log(`Report written to ${relative(ROOT, reportPath)}`);

process.exit(results.fail > 0 ? 1 : 0);
