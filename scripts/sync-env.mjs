#!/usr/bin/env node

/**
 * sync-env.mjs
 * 
 * Synchronizes .env file with .env.example to ensure all required environment
 * variables are present. Handles missing variables, extra variables, and
 * preserves existing values and formatting.
 * 
 * Invoked by sync-env.sh
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(__dirname, '..', '.env');
const EXAMPLE_FILE = path.join(__dirname, '..', '.env.example');

// Parse arguments
const args = process.argv.slice(2);
const FIX_MODE = args.includes('--fix');
const VERBOSE = args.includes('-v') || args.includes('--verbose');
const HELP = args.includes('-h') || args.includes('--help');

if (HELP) {
  console.log(`
Usage: ./scripts/sync-env.sh [OPTIONS]

Synchronizes .env file with .env.example to ensure all required environment
variables are present. Safely parses files regardless of OS.

Options:
  --fix         Automatically applies changes to .env by appending missing vars
  -v, --verbose Display detailed information about the generated values
  -h, --help    Show this help message
`);
  process.exit(0);
}

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function error(msg) {
  console.error(`${colors.red}Error:${colors.reset} ${msg}`);
  process.exit(2);
}

function info(msg) {
  console.log(`${colors.blue}Info:${colors.reset} ${msg}`);
}

function success(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function warning(msg) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

// Ensure .env.example exists
if (!fs.existsSync(EXAMPLE_FILE)) {
  error(`.env.example file not found at ${EXAMPLE_FILE}`);
}

// Create .env if it doesn't exist
if (!fs.existsSync(ENV_FILE)) {
  if (FIX_MODE) {
    fs.writeFileSync(ENV_FILE, '', 'utf8');
    info("Created .env file");
  } else {
    error(`.env file not found at ${ENV_FILE}. Run with --fix to create it.`);
  }
}

// Generate stub from a key name (e.g. MY_VAR_NAME -> my-var-name)
function generateStub(key) {
  return key.toLowerCase().replace(/_/g, '-');
}

/**
 * Parses an env file into an array of objects representing lines
 * @param {string} content 
 */
function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const parsed = {
    blocks: [],
    keys: new Set(),
    keyMap: new Map() // key -> value
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Empty line or comment
    if (!trimmed || trimmed.startsWith('#')) {
      parsed.blocks.push({ type: 'comment', raw: line });
      continue;
    }

    // Attempt to match key=value
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      
      // Basic unquote for checking emptiness (simplistic parsing for evaluation)
      let unquoted = val;
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        unquoted = val.slice(1, -1);
      }

      parsed.blocks.push({ type: 'var', key, val, unquoted, raw: line });
      parsed.keys.add(key);
      parsed.keyMap.set(key, val);
    } else {
      parsed.blocks.push({ type: 'unknown', raw: line });
    }
  }

  return parsed;
}

const exampleContent = fs.readFileSync(EXAMPLE_FILE, 'utf8');
const envContent = fs.readFileSync(ENV_FILE, 'utf8');

const exampleParsed = parseEnv(exampleContent);
const envParsed = parseEnv(envContent);

const missingVars = [];
const extraVars = [];

// Find missing
for (const key of exampleParsed.keys) {
  if (!envParsed.keys.has(key)) {
    missingVars.push(key);
  }
}

// Find extra
for (const key of envParsed.keys) {
  if (!exampleParsed.keys.has(key)) {
    extraVars.push(key);
  }
}

if (missingVars.length === 0 && extraVars.length === 0) {
  success(".env is aligned with .env.example");
  process.exit(0);
}

// Report
console.log('');
warning(`Found ${missingVars.length + extraVars.length} difference(s) between .env and .env.example:\n`);

missingVars.forEach(k => {
  const exampleVal = exampleParsed.keyMap.get(k);
  let willSetTo = exampleVal;
  
  // If example value is completely empty (no quotes, nothing), generate a stub
  if (!exampleVal || exampleVal === '""' || exampleVal === "''") {
    willSetTo = generateStub(k);
  }
  
  if (VERBOSE) {
    console.log(`  ${colors.yellow}Missing:${colors.reset} ${k}`);
    console.log(`    → Will be populated with: ${willSetTo}`);
  } else {
    console.log(`  ${colors.yellow}Missing:${colors.reset} ${k}`);
  }
});

extraVars.forEach(k => {
  if (VERBOSE) {
    console.log(`  ${colors.blue}Extra:${colors.reset} ${k}`);
    console.log(`    → (Exists in .env but not in .env.example. Will be kept as-is)`);
  } else {
    console.log(`  ${colors.blue}Extra:${colors.reset} ${k}`);
  }
});

console.log('');

// Fix mode
if (FIX_MODE) {
  info("Applying fixes...");
  
  let newEnvContent = envContent;
  
  // If the file doesn't end with a newline and has content, add one
  if (newEnvContent.length > 0 && !newEnvContent.endsWith('\n')) {
    newEnvContent += '\n';
  }

  if (missingVars.length > 0) {
    newEnvContent += `\n# --- Automatically Added by sync-env.sh ---\n`;
    
    for (const key of missingVars) {
      const exampleVal = exampleParsed.keyMap.get(key);
      let valueToSet = exampleVal;
      
      // Generate stub if empty
      if (!exampleVal || exampleVal === '""' || exampleVal === "''") {
        valueToSet = generateStub(key);
      }
      
      newEnvContent += `${key}=${valueToSet}\n`;
    }
  }

  fs.writeFileSync(ENV_FILE, newEnvContent, 'utf8');
  
  success("Applied fixes to .env");
  console.log("");
  info("Summary:");
  if (missingVars.length > 0) {
    console.log(`  - Appended ${missingVars.length} missing variable(s) to the bottom of .env`);
  }
  if (extraVars.length > 0) {
    console.log(`  - Left ${extraVars.length} extra variable(s) untouched to preserve your custom config`);
  }
  process.exit(0);
} else {
  // If not interactive, just exit (prevents hanging in CI)
  if (!process.stdout.isTTY) {
    info("Non-interactive terminal detected. Run with --fix to apply changes.");
    process.exit(1);
  }

  // Interactive prompt using readline
  import('readline').then(readline => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Would you like to fix these differences now? (y/N): ', async (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y') {
        const { spawn } = await import('child_process');
        const child = spawn(process.execPath, [__filename, '--fix', ...(VERBOSE ? ['-v'] : [])], {
          stdio: 'inherit'
        });
        child.on('exit', code => process.exit(code));
      } else {
        info("No changes applied. Run with --fix to apply changes automatically.");
        process.exit(1);
      }
    });
  });
}
