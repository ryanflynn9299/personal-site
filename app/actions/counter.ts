"use server";

import {
  incrementCounterByKey,
  FUN_COUNTER_KEY,
} from "@/lib/services/directus";
import { createLogger } from "@/lib/dev-tooling/logger";

const log = createLogger("ALL");

export interface IncrementCounterResult {
  status: "success" | "error";
  value: number | null;
}

/**
 * Increments the contact-page fun counter in Directus.
 * Returns null value when Directus is unavailable or the collection is empty.
 */
export async function incrementCounter(): Promise<IncrementCounterResult> {
  const result = await incrementCounterByKey(FUN_COUNTER_KEY);

  if (result.status === "error" || !result.counter) {
    if (result.status === "error") {
      log.warn(
        { key: FUN_COUNTER_KEY },
        "Counter increment failed — Directus unavailable or collection missing"
      );
    } else {
      log.debug(
        { key: FUN_COUNTER_KEY },
        "Counter increment returned no row after write"
      );
    }
    return { status: "error", value: null };
  }

  return { status: "success", value: result.counter.value };
}
