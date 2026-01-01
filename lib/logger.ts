import pino from "pino";
import { env } from "./env";

// Fix for thread-stream worker.js error in Next.js/Docker
// pino-pretty uses thread-stream which doesn't work well in Next.js bundling
// Solution: Only use pino-pretty transport when explicitly enabled via env var
// Otherwise, use simple console output in dev and JSON in production

// Check if we're in a browser environment (should never happen, but safety check)
const isBrowser = typeof window !== "undefined";

// Define the options for pino. We'll use a ternary operator to switch
// between production and development settings.
const pinoOptions: pino.LoggerOptions = {
  // Set the minimum log level.
  level: env.isProduction ? "info" : "debug",

  // Only use pino-pretty transport if explicitly enabled AND not in browser
  // This avoids thread-stream worker thread issues in Next.js/Docker
  transport:
    !isBrowser && !env.isProduction && env.logger.enablePinoPretty
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            singleLine: false,
          },
        }
      : undefined,

  // Disable browser.asObject to avoid tracingChannel dependency
  browser: {
    asObject: false,
  },
};

// Create the single logger instance.
// In development without pino-pretty, pino will output JSON to console
// which is still readable and doesn't require worker threads
const log = pino(pinoOptions);

export default log;
