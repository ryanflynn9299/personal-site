import packageJson from "../../package.json";

/** Canonical app version — read from package.json only. */
export const SITE_VERSION: string = packageJson.version;

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

/**
 * Parses a SemVer 2.0.0 version string.
 */
export function parseVersion(version: string): SemVer {
  const match = SEMVER_PATTERN.exec(version.trim());
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4],
  };
}

/** True while major version is 0 (pre-1.0). */
export function isPreRelease(version: string = SITE_VERSION): boolean {
  return parseVersion(version).major === 0;
}

/** True when the version is exactly 1.0.0 or higher stable release. */
export function isStableRelease(version: string = SITE_VERSION): boolean {
  const parsed = parseVersion(version);
  return parsed.major >= 1 && !parsed.prerelease;
}
