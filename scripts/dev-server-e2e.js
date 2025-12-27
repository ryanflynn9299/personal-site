#!/usr/bin/env node

/**
 * Wrapper script for Next.js dev server in e2e tests
 * Filters out non-critical ECONNRESET errors that occur during parallel test execution
 */

const { spawn } = require("child_process");

const devServer = spawn("npm", ["run", "dev"], {
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

// Forward stdout but filter ECONNRESET errors from stderr
devServer.stdout.on("data", (data) => {
  process.stdout.write(data);
});

devServer.stderr.on("data", (data) => {
  const output = data.toString();
  
  // Filter out non-critical connection reset errors
  // These are common during parallel test execution and don't affect test results
  // Pattern: [WebServer] ⨯ Error: aborted ... code: 'ECONNRESET'
  if (
    output.includes("ECONNRESET") ||
    (output.includes("Error: aborted") && output.includes("code:")) ||
    (output.includes("[WebServer]") && output.includes("aborted") && output.includes("ECONNRESET"))
  ) {
    // Silently ignore these non-critical errors
    return;
  }
  
  // Forward all other stderr output (actual errors)
  process.stderr.write(data);
});

devServer.on("exit", (code) => {
  process.exit(code);
});

// Handle process termination
process.on("SIGINT", () => {
  devServer.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  devServer.kill("SIGTERM");
  process.exit(0);
});

