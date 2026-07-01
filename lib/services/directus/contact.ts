/**
 * Contact Message Operations
 *
 * Directus write operations for the `contact_messages` collection.
 * Extracted from app/actions/contact.ts so the action file remains
 * a thin orchestrator and all Directus I/O lives in the service layer.
 */

import { createItem } from "@directus/sdk";
import { createLogger } from "@/lib/dev-tooling/logger";
import { getDirectusClient } from "./client";

const log = createLogger("ALL");

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
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
    await (
      client as unknown as { request: (cmd: unknown) => Promise<unknown> }
    ).request(
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
