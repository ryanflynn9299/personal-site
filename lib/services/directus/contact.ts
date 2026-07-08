/**
 * Contact Message Operations
 *
 * Directus write and read operations for the `contact_messages` collection.
 * Extracted from app/actions/contact.ts so the action file remains
 * a thin orchestrator and all Directus I/O lives in the service layer.
 */

import { createItem, readItems, updateItem } from "@directus/sdk";
import type { ContactMessage } from "@/types";
import { createLogger } from "@/lib/dev-tooling/logger";
import { getDirectusClient } from "./client";
import {
  getDirectusQueryContext,
  logDirectusOperationStart,
  logDirectusOperationSuccess,
  logDirectusOperationError,
  directusRequest,
  unwrapListResponse,
  unwrapFilterCount,
} from "./query-context";
import {
  CONTACT_MESSAGE_READ_FIELDS,
  transformRawContactMessage,
} from "./transforms";

const log = createLogger("ALL");

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface GetContactMessagesOptions {
  limit?: number;
  page?: number;
  status?: "new" | "read" | "archived";
}

export interface ContactMessagesResult {
  status: "success" | "error";
  messages: ContactMessage[];
  total?: number;
}

/**
 * Stores a contact form submission in the Directus `contact_messages` collection.
 *
 * @returns true if stored successfully, false otherwise
 */
export async function createContactMessage(
  input: ContactMessageInput
): Promise<boolean> {
  const client = getDirectusClient();
  if (!client) {
    log.warn("Cannot store contact message: Directus client not available");
    return false;
  }

  try {
    await directusRequest(
      client,
      createItem(
        "contact_messages" as never,
        {
          name: input.name,
          email: input.email,
          message: input.message,
          status: "new",
        } as never
      )
    );
    return true;
  } catch (error) {
    log.error({ error }, "Failed to store contact message in Directus");
    return false;
  }
}

/**
 * Fetches contact messages for the admin dashboard (newest first).
 */
export async function getContactMessages(
  options?: GetContactMessagesOptions
): Promise<ContactMessagesResult> {
  const ctx = getDirectusQueryContext("getContactMessages");
  if (!ctx) {
    return { status: "error", messages: [] };
  }

  const requestParams: Record<string, unknown> = {
    fields: [...CONTACT_MESSAGE_READ_FIELDS],
    sort: ["-date_created"],
    meta: ["filter_count"],
  };

  if (options?.limit) {
    requestParams.limit = options.limit;
  }
  if (options?.page) {
    requestParams.page = options.page;
  }
  if (options?.status) {
    requestParams.filter = { status: { _eq: options.status } };
  }

  const requestStartTime = logDirectusOperationStart(
    "getContactMessages",
    ctx.directusUrl,
    requestParams
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems("contact_messages" as never, requestParams as never)
    );

    const rows = unwrapListResponse(response);
    const total = unwrapFilterCount(response);

    logDirectusOperationSuccess(
      "getContactMessages",
      ctx.directusUrl,
      { count: rows.length, total },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug("No contact messages found in Directus");
      return {
        status: "success",
        messages: [],
        total: total ?? 0,
      };
    }

    const messages = rows
      .map((raw) =>
        transformRawContactMessage(
          raw as Partial<import("@/types/directus").DirectusContactMessage>
        )
      )
      .filter((message): message is ContactMessage => message !== null);

    return {
      status: "success",
      messages,
      total: total ?? messages.length,
    };
  } catch (error) {
    logDirectusOperationError(
      "getContactMessages",
      error,
      requestStartTime,
      ctx.directusUrl
    );
    return { status: "error", messages: [] };
  }
}

/**
 * Updates a contact message status (e.g. new → read).
 */
export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage["status"]
): Promise<boolean> {
  if (!id || typeof id !== "string") {
    log.warn({ id }, "Invalid id provided to updateContactMessageStatus");
    return false;
  }

  const ctx = getDirectusQueryContext("updateContactMessageStatus");
  if (!ctx) {
    return false;
  }

  const requestStartTime = logDirectusOperationStart(
    "updateContactMessageStatus",
    ctx.directusUrl,
    { id, status }
  );

  try {
    await directusRequest(
      ctx.client,
      updateItem("contact_messages" as never, id, { status } as never)
    );

    logDirectusOperationSuccess(
      "updateContactMessageStatus",
      ctx.directusUrl,
      { id, status },
      requestStartTime
    );
    return true;
  } catch (error) {
    logDirectusOperationError(
      "updateContactMessageStatus",
      error,
      requestStartTime,
      ctx.directusUrl,
      { id, status }
    );
    return false;
  }
}
