#!/usr/bin/env bash

################################################################################
# sync-env.sh
#
# Synchronizes .env file with .env.example ensuring all required environment
# variables are present. Posix-agnostic wrapper that delegates to a robust 
# Node.js parser to safely handle .env parsing across macOS and Linux.
#
# Usage:
#   ./scripts/sync-env.sh          # Report mode: shows diff and prompts to fix
#   ./scripts/sync-env.sh --fix     # Fix mode: automatically applies changes
#   ./scripts/sync-env.sh -v        # Verbose: Display detailed information
#
################################################################################

set -euo pipefail

# Find script directory and execute the node script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "\033[0;31mError:\033[0m Node.js is required to run this script but it's not installed." >&2
    exit 2
fi

# Delegate to the Node implementation 
exec node "$SCRIPT_DIR/sync-env.mjs" "$@"
