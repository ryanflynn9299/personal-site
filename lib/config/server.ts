/**
 * Server-Only Configuration
 *
 * Contains secrets that MUST NEVER reach client-side code.
 * Protected by the `server-only` package — importing this file in a
 * Client Component causes a build error (not just a runtime error).
 *
 * Usage:
 *   import { serverConfig } from "@/lib/config/server";
 *
 *   serverConfig.smtp.host
 *   serverConfig.admin.passcode
 *   serverConfig.directus.internalUrl
 *
 * @see .docs/dev/ENV_VARIABLES.md for full variable documentation
 */

import "server-only";

import { parseServerConfig, type ServerConfig } from "./schemas";

/**
 * Zod-validated, frozen server configuration object.
 * Crashes at startup if env vars are invalid — no silent failures.
 */
export const serverConfig: ServerConfig = parseServerConfig();

export type { ServerConfig };
