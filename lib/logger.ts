/**
 * Environment-Aware Logging System
 *
 * This module provides a context-aware logging system that allows different log messages
 * to be emitted based on the environment (production vs development).
 *
 * Key Features:
 * - PRODUCTION context: Only logs in production mode with [PRODUCTION] prefix
 * - DEV context: Only logs in development modes with [DEV] prefix
 * - ALL context: Always logs (no prefix)
 * - Multiple loggers per file: Create different loggers for different contexts
 *
 * Usage Examples:
 *
 * 1. Single logger (always logs):
 * ```ts
 * import { log } from "@/lib/logger";
 * log.info("This always logs");
 * ```
 *
 * 2. Multiple loggers in the same file:
 * ```ts
 * import { prodLog, devLog, log } from "@/lib/logger";
 *
 * // Production-only critical errors
 * prodLog.error({ error }, "Critical production error");
 *
 * // Development-only debug info
 * devLog.debug("Debug information");
 *
 * // Always log important events
 * log.info("Application started");
 * ```
 *
 * 3. Custom logger with devModeUI requirement:
 * ```ts
 * import { createLogger } from "@/lib/logger";
 * const devUILog = createLogger("DEV", { devModeUI: true });
 * devUILog.info("Only logs when devModeUI is enabled");
 * ```
 *
 * Note: Loggers are created once and cached. If a logger's context doesn't match
 * the current environment, it returns no-op functions (zero performance overhead).
 */

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

// Create the base logger instance.
// In development without pino-pretty, pino will output JSON to console
// which is still readable and doesn't require worker threads
const baseLogger = pino(pinoOptions);

/**
 * Logging context types
 */
export type LogContext = "PRODUCTION" | "DEV" | "ALL";

/**
 * Options for creating a context-aware logger
 */
export interface LoggerOptions {
  /**
   * Whether dev mode UI must be enabled for this logger to log.
   * Only applies to DEV context. If true, logs only when devModeUI is enabled.
   * If false or undefined, DEV context logs in any development mode.
   */
  devModeUI?: boolean;
}

/**
 * Determines if a log should be output based on context and environment
 */
function shouldLog(context: LogContext, options?: LoggerOptions): boolean {
  // ALL context always logs
  if (context === "ALL") {
    return true;
  }

  // PRODUCTION context only logs in production
  if (context === "PRODUCTION") {
    return env.isProduction;
  }

  // DEV context logs in development modes
  if (context === "DEV") {
    // If devModeUI is required, check that it's enabled
    if (options?.devModeUI === true) {
      return env.devModeUI;
    }
    // Otherwise, log in any development mode
    return env.isDevelopment;
  }

  return false;
}

/**
 * Formats a log message with context prefix
 */
function formatMessage(context: LogContext, message: string): string {
  if (context === "PRODUCTION") {
    return `[PRODUCTION] ${message}`;
  }
  if (context === "DEV") {
    return `[DEV] ${message}`;
  }
  // ALL context doesn't need a prefix
  return message;
}

/**
 * Context-aware logger interface
 */
export interface ContextLogger {
  info: (objOrMsg: unknown, msg?: string) => void;
  error: (objOrMsg: unknown, msg?: string) => void;
  warn: (objOrMsg: unknown, msg?: string) => void;
  debug: (objOrMsg: unknown, msg?: string) => void;
}

/**
 * Creates a context-aware logger that only logs when appropriate conditions are met
 *
 * @param context - The logging context: PRODUCTION (only in production), DEV (only in dev), or ALL (always)
 * @param options - Optional configuration for the logger
 * @returns A logger instance that conditionally logs based on context and environment
 *
 * @example
 * ```ts
 * // Single logger - always logs (no prefix)
 * const log = createLogger("ALL");
 * log.info("This always logs");
 *
 * // Multiple loggers in the same file for different contexts
 * import { createLogger } from "@/lib/logger";
 * const prodLog = createLogger("PRODUCTION");
 * const devLog = createLogger("DEV");
 * const allLog = createLogger("ALL");
 *
 * // Production-only logs (with [PRODUCTION] prefix)
 * prodLog.error("Critical production error");
 * prodLog.info("Production monitoring info");
 *
 * // Development-only logs (with [DEV] prefix)
 * devLog.debug("Debug info only in dev");
 * devLog.warn("Development warning");
 *
 * // Always logs (no prefix)
 * allLog.info("Important info that should always be logged");
 *
 * // Or use convenience exports
 * import { log, prodLog, devLog } from "@/lib/logger";
 * prodLog.error("Production error");
 * devLog.debug("Dev debug");
 * log.info("Always logs");
 *
 * // Logs only when devModeUI is enabled
 * const devUILogger = createLogger("DEV", { devModeUI: true });
 * devUILogger.info("This only logs when devModeUI is enabled");
 * ```
 */
export function createLogger(
  context: LogContext,
  options?: LoggerOptions
): ContextLogger {
  const shouldLogThis = shouldLog(context, options);

  // If we shouldn't log, return no-op functions
  if (!shouldLogThis) {
    return {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
    };
  }

  // Create a logger that formats messages with context prefix
  return {
    info: (objOrMsg: unknown, msg?: string) => {
      if (typeof objOrMsg === "string") {
        baseLogger.info(formatMessage(context, objOrMsg));
      } else if (msg) {
        baseLogger.info(objOrMsg, formatMessage(context, msg));
      } else {
        baseLogger.info(objOrMsg);
      }
    },
    error: (objOrMsg: unknown, msg?: string) => {
      if (typeof objOrMsg === "string") {
        baseLogger.error(formatMessage(context, objOrMsg));
      } else if (msg) {
        baseLogger.error(objOrMsg, formatMessage(context, msg));
      } else {
        baseLogger.error(objOrMsg);
      }
    },
    warn: (objOrMsg: unknown, msg?: string) => {
      if (typeof objOrMsg === "string") {
        baseLogger.warn(formatMessage(context, objOrMsg));
      } else if (msg) {
        baseLogger.warn(objOrMsg, formatMessage(context, msg));
      } else {
        baseLogger.warn(objOrMsg);
      }
    },
    debug: (objOrMsg: unknown, msg?: string) => {
      if (typeof objOrMsg === "string") {
        baseLogger.debug(formatMessage(context, objOrMsg));
      } else if (msg) {
        baseLogger.debug(objOrMsg, formatMessage(context, msg));
      } else {
        baseLogger.debug(objOrMsg);
      }
    },
  };
}

/**
 * Default logger using ALL context (always logs)
 * This is the recommended logger for most use cases
 */
export const log = createLogger("ALL");

/**
 * Convenience loggers for common use cases
 * These can be imported directly when you need multiple loggers in the same file
 *
 * @example
 * ```ts
 * import { log, prodLog, devLog } from "@/lib/logger";
 *
 * // Always log (no prefix)
 * log.info("This always logs");
 *
 * // Only in production (with [PRODUCTION] prefix)
 * prodLog.error("Critical production error");
 *
 * // Only in development (with [DEV] prefix)
 * devLog.debug("Debug info only in dev");
 * ```
 */
export const prodLog = createLogger("PRODUCTION");
export const devLog = createLogger("DEV");

/**
 * Default export for backward compatibility
 * Uses ALL context (always logs)
 */
export default log;
