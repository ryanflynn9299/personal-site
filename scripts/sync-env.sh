#!/bin/bash

################################################################################
# sync-env.sh
#
# Synchronizes .env file with .env.example to ensure all required environment
# variables are present. Handles missing variables, extra variables, and
# preserves existing values.
#
# Usage:
#   ./scripts/sync-env.sh          # Report mode: shows diff and prompts to fix
#   ./scripts/sync-env.sh --fix     # Fix mode: automatically applies changes
#
# Behavior:
#   - Missing variables: Adds them from .env.example with dummy values
#   - Extra variables: Comments them out (preserves them for reference)
#   - Comments: Completely ignored in both files
#   - Existing values: Preserved when variable exists in both files
#
# Exit codes:
#   0 - Files are aligned (or successfully fixed)
#   1 - Files differ and need fixing (report mode only)
#   2 - Error occurred (missing files, permissions, etc.)
################################################################################

set -euo pipefail

# Check bash version (associative arrays require bash 4+)
if [[ "${BASH_VERSION%%.*}" -lt 4 ]]; then
    echo "Error: This script requires bash 4 or higher (associative arrays)" >&2
    echo "Your version: $BASH_VERSION" >&2
    exit 2
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
EXAMPLE_FILE="$PROJECT_ROOT/.env.example"

# Check if --fix flag is provided
FIX_MODE=false
if [[ "${1:-}" == "--fix" ]]; then
    FIX_MODE=true
fi

################################################################################
# Helper Functions
################################################################################

error() {
    echo -e "${RED}Error:${NC} $1" >&2
    exit 2
}

info() {
    echo -e "${BLUE}Info:${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Extract variable name from a line (handles KEY=VALUE, KEY="VALUE", and # KEY=VALUE)
extract_var_name() {
    local line="$1"
    # Remove leading whitespace
    line=$(echo "$line" | sed 's/^[[:space:]]*//')
    # Remove leading # if present (for commented variables)
    line=$(echo "$line" | sed 's/^#[[:space:]]*//')
    # Remove trailing comments (but preserve the variable assignment)
    # Only remove # if it's after the = sign (not part of the value)
    # For simplicity, we'll extract before any # that appears after =
    if [[ "$line" =~ = ]]; then
        # Extract everything up to =, then get the part before any trailing #
        local before_equals="${line%%=*}"
        echo "$before_equals" | xargs
    else
        echo ""
    fi
}

# Extract variable value from a line (handles KEY=VALUE, KEY="VALUE", and # KEY=VALUE)
extract_var_value() {
    local line="$1"
    # Remove leading whitespace
    line=$(echo "$line" | sed 's/^[[:space:]]*//')
    # Remove leading # if present (for commented variables)
    line=$(echo "$line" | sed 's/^#[[:space:]]*//')
    # Extract value (everything after =, but before any trailing comment)
    if [[ "$line" =~ = ]]; then
        local after_equals="${line#*=}"
        # Remove trailing comments (everything after # that's not in quotes)
        # Simple approach: remove # and everything after if # is not in quotes
        # For now, just take everything after = and trim
        local value=$(echo "$after_equals" | sed 's/[[:space:]]*#.*$//' | xargs)
        # Remove quotes if present
        value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
        echo "$value"
    else
        echo ""
    fi
}

# Check if a line is a comment or empty
is_comment_or_empty() {
    local line="$1"
    # Remove leading whitespace
    local trimmed=$(echo "$line" | sed 's/^[[:space:]]*//')
    # Check if empty or starts with #
    [[ -z "$trimmed" || "$trimmed" =~ ^# ]]
}

# Check if a line contains a variable assignment
is_var_assignment() {
    local line="$1"
    # Remove leading whitespace and comments
    local cleaned=$(echo "$line" | sed 's/^[[:space:]]*//' | sed 's/#.*$//')
    # Check if it contains = and has content before =
    [[ "$cleaned" =~ = && -n "${cleaned%%=*}" ]]
}

################################################################################
# Validation
################################################################################

# Check if .env.example exists
if [[ ! -f "$EXAMPLE_FILE" ]]; then
    error ".env.example file not found at $EXAMPLE_FILE"
fi

# Create .env if it doesn't exist
if [[ ! -f "$ENV_FILE" ]]; then
    if [[ "$FIX_MODE" == true ]]; then
        touch "$ENV_FILE"
        info "Created .env file"
    else
        error ".env file not found at $ENV_FILE. Run with --fix to create it."
    fi
fi

# Check if we can write to .env
if [[ ! -w "$ENV_FILE" ]]; then
    error "Cannot write to .env file. Check permissions."
fi

################################################################################
# Parse Files
################################################################################

# Parse .env.example into associative array (bash 4+)
declare -A EXAMPLE_VARS
declare -A ENV_VARS
declare -A ENV_COMMENTED

# Read .env.example and extract variables (ignoring comments)
while IFS= read -r line || [[ -n "$line" ]]; do
    if is_comment_or_empty "$line"; then
        continue
    fi
    
    if is_var_assignment "$line"; then
        local var_name=$(extract_var_name "$line")
        local var_value=$(extract_var_value "$line")
        
        if [[ -n "$var_name" ]]; then
            EXAMPLE_VARS["$var_name"]="$var_value"
        fi
    fi
done < "$EXAMPLE_FILE"

# Read .env and extract variables (ignoring comments, but tracking commented vars)
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines
    local trimmed=$(echo "$line" | sed 's/^[[:space:]]*//')
    if [[ -z "$trimmed" ]]; then
        continue
    fi
    
    # Check if this is a commented variable assignment (e.g., "# VAR=value")
    if [[ "$trimmed" =~ ^#[[:space:]]*[A-Za-z_][A-Za-z0-9_]*= ]]; then
        # This is a commented variable - extract it
        local var_name=$(extract_var_name "$line")
        local var_value=$(extract_var_value "$line")
        if [[ -n "$var_name" ]]; then
            ENV_COMMENTED["$var_name"]="$var_value"
        fi
        continue
    fi
    
    # Skip pure comments (not variable assignments)
    if [[ "$trimmed" =~ ^# ]]; then
        continue
    fi
    
    # Regular variable assignment
    if is_var_assignment "$line"; then
        local var_name=$(extract_var_name "$line")
        local var_value=$(extract_var_value "$line")
        
        if [[ -n "$var_name" ]]; then
            ENV_VARS["$var_name"]="$var_value"
        fi
    fi
done < "$ENV_FILE"

################################################################################
# Find Differences
################################################################################

declare -a MISSING_VARS
declare -a EXTRA_VARS
declare -a CHANGES

# Find missing variables (in .env.example but not in .env)
for var_name in "${!EXAMPLE_VARS[@]}"; do
    if [[ -z "${ENV_VARS[$var_name]:-}" && -z "${ENV_COMMENTED[$var_name]:-}" ]]; then
        MISSING_VARS+=("$var_name")
        CHANGES+=("Missing: $var_name=${EXAMPLE_VARS[$var_name]}")
    fi
done

# Find extra variables (in .env but not in .env.example)
for var_name in "${!ENV_VARS[@]}"; do
    if [[ -z "${EXAMPLE_VARS[$var_name]:-}" ]]; then
        EXTRA_VARS+=("$var_name")
        CHANGES+=("Extra: $var_name=${ENV_VARS[$var_name]} (will be commented)")
    fi
done

# Also check commented variables in .env
for var_name in "${!ENV_COMMENTED[@]}"; do
    if [[ -z "${EXAMPLE_VARS[$var_name]:-}" ]]; then
        # Already commented, but not in example - keep it commented
        EXTRA_VARS+=("$var_name")
    fi
done

################################################################################
# Report or Fix
################################################################################

if [[ ${#CHANGES[@]} -eq 0 ]]; then
    success ".env is aligned with .env.example"
    exit 0
fi

# Report differences
echo ""
warning "Found ${#CHANGES[@]} difference(s) between .env and .env.example:"
echo ""

for change in "${CHANGES[@]}"; do
    if [[ "$change" =~ ^Missing: ]]; then
        echo -e "  ${YELLOW}Missing:${NC} ${change#Missing: }"
    elif [[ "$change" =~ ^Extra: ]]; then
        echo -e "  ${BLUE}Extra:${NC} ${change#Extra: }"
    fi
done
echo ""

# If in fix mode, apply changes
if [[ "$FIX_MODE" == true ]]; then
    info "Applying fixes..."
    
    # Create temporary file for new .env content
    TEMP_ENV=$(mktemp)
    trap "rm -f '$TEMP_ENV'" EXIT
    
    # Copy existing .env content, preserving comments and structure
    # But we'll rebuild it properly
    > "$TEMP_ENV"
    
    # First, add all variables from .env.example (in order)
    while IFS= read -r line || [[ -n "$line" ]]; do
        if is_comment_or_empty "$line"; then
            # Preserve comments and empty lines from example
            echo "$line" >> "$TEMP_ENV"
        elif is_var_assignment "$line"; then
            local var_name=$(extract_var_name "$line")
            local example_value=$(extract_var_value "$line")
            
            if [[ -n "$var_name" ]]; then
                # Use existing value if present, otherwise use example value
                if [[ -n "${ENV_VARS[$var_name]:-}" ]]; then
                    echo "$var_name=${ENV_VARS[$var_name]}" >> "$TEMP_ENV"
                else
                    echo "$var_name=$example_value" >> "$TEMP_ENV"
                fi
            fi
        fi
    done < "$EXAMPLE_FILE"
    
    # Add a separator comment for extra variables
    if [[ ${#EXTRA_VARS[@]} -gt 0 ]]; then
        echo "" >> "$TEMP_ENV"
        echo "# Variables not in .env.example (commented out):" >> "$TEMP_ENV"
        
        # Add extra variables as comments
        for var_name in "${EXTRA_VARS[@]}"; do
            local value="${ENV_VARS[$var_name]:-${ENV_COMMENTED[$var_name]:-}}"
            echo "# $var_name=$value" >> "$TEMP_ENV"
        done
    fi
    
    # Replace .env with new content
    mv "$TEMP_ENV" "$ENV_FILE"
    
    success "Applied fixes to .env"
    echo ""
    info "Summary:"
    if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
        echo "  - Added ${#MISSING_VARS[@]} missing variable(s)"
    fi
    if [[ ${#EXTRA_VARS[@]} -gt 0 ]]; then
        echo "  - Commented out ${#EXTRA_VARS[@]} extra variable(s)"
    fi
    exit 0
fi

# Report mode: prompt user
echo ""
read -p "Would you like to fix these differences now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Re-run script in fix mode
    exec "$0" --fix
else
    info "No changes applied. Run with --fix to apply changes automatically."
    exit 1
fi

