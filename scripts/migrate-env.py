#!/usr/bin/env python3
"""
Environment Variable Migration Script

Migrates a production .env file from old variable names to the new naming scheme.
Run this BEFORE deploying the updated application code.

Usage:
    python3 scripts/migrate-env.py .env              # Migrate in-place (creates .env.backup)
    python3 scripts/migrate-env.py .env --dry-run     # Preview changes only
    python3 scripts/migrate-env.py .env --output .env.new  # Write to new file
"""

import argparse
import shutil
import sys
from pathlib import Path

# Complete old → new mapping
RENAME_MAP = {
    "APP_MODE": "RUNTIME_MODE",
    "NEXT_PUBLIC_APP_MODE": "RUNTIME_MODE",
    "DEV_MODE_UI": "ENABLE_PREVIEW_FEATURES",
    "NEXT_PUBLIC_DEV_MODE_UI": "ENABLE_PREVIEW_FEATURES",
    "ENABLE_PINO_PRETTY": "LOG_PRETTY_PRINT",
    "NEXT_PUBLIC_ENABLE_PINO_PRETTY": "LOG_PRETTY_PRINT",
    "DIRECTUS_URL_SERVER_SIDE": "DIRECTUS_INTERNAL_URL",
    "ADMIN_EMAIL": "DIRECTUS_ADMIN_EMAIL",
    "ADMIN_PW": "DIRECTUS_ADMIN_PASSWORD",
    "HTTP_DOMAIN_NAME": "DIRECTUS_PUBLIC_URL",
    "DASHBOARD_PASSCODE": "ADMIN_PASSCODE",
    "ENFORCE_TAILSCALE": "ADMIN_REQUIRE_TAILSCALE",
    "USE_CLOUDFLARE_TUNNEL": "CF_TUNNEL_ENABLED",
    "CLOUDFLARE_TUNNEL_TOKEN": "CF_TUNNEL_TOKEN",
    "GITHUB_REPO": "SYNC_GITHUB_REPO",
    # Stale test-only names
    "EMAIL_FROM": "SMTP_FROM",
    "EMAIL_TO": "SMTP_TO",
}


def migrate_env(input_path: Path, output_path: Path | None, dry_run: bool) -> None:
    """Read .env, apply renames, optionally write output."""
    lines = input_path.read_text().splitlines(keepends=True)
    renamed_count = 0
    new_lines = []

    for line in lines:
        stripped = line.strip()

        # Preserve comments and blank lines
        if not stripped or stripped.startswith("#"):
            new_lines.append(line)
            continue

        # Parse KEY=VALUE (handle lines with = in value)
        if "=" not in stripped:
            new_lines.append(line)
            continue

        key, _, value = stripped.partition("=")
        key = key.strip()

        if key in RENAME_MAP:
            new_key = RENAME_MAP[key]
            renamed_count += 1
            if dry_run:
                print(f"  {key} → {new_key}")
            # Preserve original line formatting (leading whitespace, etc.)
            new_line = line.replace(f"{key}=", f"{new_key}=", 1)
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    if dry_run:
        if renamed_count == 0:
            print("  No variables to rename — file is already up to date.")
        else:
            print(f"\n  {renamed_count} variable(s) would be renamed.")
        return

    # Backup original
    if output_path is None or output_path == input_path:
        backup_path = input_path.with_suffix(".env.backup")
        shutil.copy2(input_path, backup_path)
        print(f"  Backed up original to {backup_path}")
        output_path = input_path

    output_path.write_text("".join(new_lines))
    print(f"  Migrated {renamed_count} variable(s) → {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Migrate .env file to new variable names"
    )
    parser.add_argument("env_file", type=Path, help="Path to the .env file")
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview changes without writing"
    )
    parser.add_argument(
        "--output", type=Path, default=None, help="Write output to a different file"
    )
    args = parser.parse_args()

    if not args.env_file.exists():
        print(f"Error: {args.env_file} not found", file=sys.stderr)
        sys.exit(1)

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Migrating {args.env_file}:\n")
    migrate_env(args.env_file, args.output, args.dry_run)
    print()


if __name__ == "__main__":
    main()
