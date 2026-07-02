/**
 * Counter Query Functions
 *
 * Directus operations for the `counters` collection.
 * Used by the contact-page fun counter (key: `contact-fun-counter`).
 */

import { createItem, readItems, updateItem } from "@directus/sdk";
import type { SiteCounter } from "@/types";
import { createLogger } from "@/lib/dev-tooling/logger";

import { FUN_COUNTER_KEY } from "./constants";
import {
  getDirectusQueryContext,
  logDirectusOperationStart,
  logDirectusOperationSuccess,
  logDirectusOperationError,
  directusRequest,
  unwrapListResponse,
} from "./query-context";
import { COUNTER_FIELDS, transformRawCounter } from "./transforms";

const log = createLogger("ALL");

export interface CounterResult {
  status: "success" | "error";
  counter: SiteCounter | null;
}

/**
 * Fetches a counter by its unique string key.
 * Returns null counter with success when the row does not exist yet.
 */
export async function getCounterByKey(key: string): Promise<CounterResult> {
  if (!key || typeof key !== "string" || key.trim() === "") {
    log.warn({ key }, "Invalid counter key provided to getCounterByKey");
    return { status: "error", counter: null };
  }

  const ctx = getDirectusQueryContext("getCounterByKey");
  if (!ctx) {
    return { status: "error", counter: null };
  }

  const requestStartTime = logDirectusOperationStart(
    "getCounterByKey",
    ctx.directusUrl,
    { key }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "counters" as never,
        {
          filter: { key: { _eq: key } },
          limit: 1,
          fields: [...COUNTER_FIELDS],
        } as never
      )
    );

    logDirectusOperationSuccess(
      "getCounterByKey",
      ctx.directusUrl,
      { found: unwrapListResponse(response).length > 0 },
      requestStartTime
    );

    const rows = unwrapListResponse(response);
    if (rows.length === 0) {
      log.debug({ key }, "Counter key not found in Directus");
      return { status: "success", counter: null };
    }

    const counter = transformRawCounter(
      rows[0] as Partial<import("@/types/directus").DirectusCounter>
    );
    return { status: counter ? "success" : "error", counter };
  } catch (error) {
    logDirectusOperationError(
      "getCounterByKey",
      error,
      requestStartTime,
      ctx.directusUrl,
      { key }
    );
    return { status: "error", counter: null };
  }
}

/**
 * Increments a counter by key, creating the row at value 1 if missing.
 */
export async function incrementCounterByKey(
  key: string = FUN_COUNTER_KEY
): Promise<CounterResult> {
  const existing = await getCounterByKey(key);
  if (existing.status === "error") {
    return existing;
  }

  const ctx = getDirectusQueryContext("incrementCounterByKey");
  if (!ctx) {
    return { status: "error", counter: null };
  }

  const requestStartTime = logDirectusOperationStart(
    "incrementCounterByKey",
    ctx.directusUrl,
    { key, hadExisting: !!existing.counter }
  );

  try {
    if (!existing.counter) {
      const created = await directusRequest(
        ctx.client,
        createItem(
          "counters" as never,
          {
            key,
            value: 1,
            metadata: { source: "contact-fun-counter" },
          } as never
        )
      );

      const counter = transformRawCounter(
        created as Partial<import("@/types/directus").DirectusCounter>
      );

      logDirectusOperationSuccess(
        "incrementCounterByKey",
        ctx.directusUrl,
        { action: "created", value: 1 },
        requestStartTime
      );

      return { status: counter ? "success" : "error", counter };
    }

    const nextValue = existing.counter.value + 1;
    const updated = await directusRequest(
      ctx.client,
      updateItem("counters" as never, existing.counter.id, {
        value: nextValue,
      } as never)
    );

    const counter = transformRawCounter(
      updated as Partial<import("@/types/directus").DirectusCounter>
    );

    logDirectusOperationSuccess(
      "incrementCounterByKey",
      ctx.directusUrl,
      { action: "updated", value: nextValue },
      requestStartTime
    );

    return { status: counter ? "success" : "error", counter };
  } catch (error) {
    logDirectusOperationError(
      "incrementCounterByKey",
      error,
      requestStartTime,
      ctx.directusUrl,
      { key }
    );
    return { status: "error", counter: null };
  }
}
