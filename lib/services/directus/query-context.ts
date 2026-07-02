/**
 * Shared guards and error logging for Directus query modules.
 * Internal to the service layer — not exported from the barrel.
 */

import { createLogger } from "@/lib/dev-tooling/logger";
import { runtime } from "@/lib/config";
import {
  isDirectusConfigured,
  getDirectusClient,
  getDirectusUrl,
} from "./client";
import { classifyDirectusError } from "./errors";

const log = createLogger("ALL");
const devLog = createLogger("DEV");

export interface DirectusQueryContext {
  client: NonNullable<ReturnType<typeof getDirectusClient>>;
  directusUrl: string;
}

/**
 * Returns a configured client or null after logging appropriately.
 */
export function getDirectusQueryContext(
  operation: string
): DirectusQueryContext | null {
  if (!runtime.connectToServices) {
    return null;
  }

  const client = getDirectusClient();
  if (!isDirectusConfigured() || !client) {
    if (runtime.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: runtime.mode,
          operation,
          directusConfigured: isDirectusConfigured(),
          directusClientExists: !!client,
        },
        `Directus not configured for ${operation} in production/live-dev mode`
      );
    } else {
      log.warn({ operation }, "Directus not configured, skipping query");
    }
    return null;
  }

  const directusUrl = getDirectusUrl();
  if (!directusUrl) {
    log.warn({ operation }, "Directus URL unavailable, skipping query");
    return null;
  }

  return { client, directusUrl };
}

export function logDirectusOperationStart(
  operation: string,
  directusUrl: string,
  request: Record<string, unknown>
): number {
  devLog.info(
    { service: "Directus", operation, url: directusUrl, request },
    `Initiating Directus service call: ${operation}`
  );
  return Date.now();
}

export function logDirectusOperationSuccess(
  operation: string,
  directusUrl: string,
  response: Record<string, unknown>,
  requestStartTime: number
): void {
  devLog.info(
    {
      service: "Directus",
      operation,
      url: directusUrl,
      response: { ...response, durationMs: Date.now() - requestStartTime },
    },
    `Directus service call completed: ${operation}`
  );
}

export function logDirectusOperationError(
  operation: string,
  error: unknown,
  requestStartTime: number,
  directusUrl: string | null,
  context?: Record<string, unknown>
): void {
  const errorInfo = classifyDirectusError(error);

  devLog.error(
    {
      service: "Directus",
      operation,
      url: directusUrl,
      error: {
        type: errorInfo.type,
        message: errorInfo.message,
        statusCode: errorInfo.statusCode,
        durationMs: Date.now() - requestStartTime,
      },
      ...context,
    },
    `Directus service call failed: ${operation}`
  );

  if (runtime.treatServiceErrorsAsReal) {
    log.error(
      {
        error: errorInfo.originalError,
        errorType: errorInfo.type,
        statusCode: errorInfo.statusCode,
        message: errorInfo.message,
        mode: runtime.mode,
        operation,
        ...context,
      },
      `CRITICAL: Failed ${operation} in production/live-dev mode`
    );
  } else {
    log.error(
      {
        error: errorInfo.originalError,
        errorType: errorInfo.type,
        statusCode: errorInfo.statusCode,
        message: errorInfo.message,
        operation,
        ...context,
      },
      `Failed ${operation}`
    );
  }
}

type SdkClient = {
  request: (cmd: unknown) => Promise<unknown>;
};

export async function directusRequest(
  client: DirectusQueryContext["client"],
  command: unknown
): Promise<unknown> {
  return (client as unknown as SdkClient).request(command);
}

export function unwrapListResponse(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }
  const data = (response as Record<string, unknown>)?.data;
  return Array.isArray(data) ? data : [];
}

export function unwrapFilterCount(response: unknown): number | undefined {
  if (Array.isArray(response)) {
    return undefined;
  }
  const filterCount = (
    (response as Record<string, unknown>)?.meta as
      | Record<string, unknown>
      | undefined
  )?.filter_count;
  return filterCount != null ? Number(filterCount) : undefined;
}
