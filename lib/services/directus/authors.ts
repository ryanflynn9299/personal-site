/**
 * Author Query Functions
 *
 * Directus operations for the `authors` collection.
 * Phase 0 static profiles in `data/authors.ts` remain the fallback until
 * the collection is populated — see AUTHOR_PROFILES.md.
 */

import { readItems } from "@directus/sdk";
import type { AuthorProfile } from "@/types";
import { createLogger } from "@/lib/dev-tooling/logger";

import {
  getDirectusQueryContext,
  logDirectusOperationStart,
  logDirectusOperationSuccess,
  logDirectusOperationError,
  directusRequest,
  unwrapListResponse,
} from "./query-context";
import { AUTHOR_FIELDS, transformRawAuthor } from "./transforms";

const log = createLogger("ALL");

export interface AuthorsResult {
  status: "success" | "error";
  authors: AuthorProfile[];
}

export interface AuthorResult {
  status: "success" | "error";
  author: AuthorProfile | null;
}

/**
 * Fetches all published authors, sorted by slug.
 */
export async function getPublishedAuthors(): Promise<AuthorsResult> {
  const ctx = getDirectusQueryContext("getPublishedAuthors");
  if (!ctx) {
    return { status: "error", authors: [] };
  }

  const requestStartTime = logDirectusOperationStart(
    "getPublishedAuthors",
    ctx.directusUrl,
    { filter: "status=published" }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "authors" as never,
        {
          filter: { status: { _eq: "published" } },
          sort: ["slug"],
          fields: [...AUTHOR_FIELDS],
        } as never
      )
    );

    const rows = unwrapListResponse(response);
    logDirectusOperationSuccess(
      "getPublishedAuthors",
      ctx.directusUrl,
      { count: rows.length },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug("No published authors found in Directus");
      return { status: "success", authors: [] };
    }

    const authors = rows
      .map((raw) =>
        transformRawAuthor(
          raw as Partial<import("@/types/directus").DirectusAuthor>
        )
      )
      .filter((author): author is AuthorProfile => author !== null);

    return { status: "success", authors };
  } catch (error) {
    logDirectusOperationError(
      "getPublishedAuthors",
      error,
      requestStartTime,
      ctx.directusUrl
    );
    return { status: "error", authors: [] };
  }
}

/**
 * Fetches a single published author by slug.
 * Returns success with null author when not found.
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorResult> {
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    log.warn({ slug }, "Invalid slug provided to getAuthorBySlug");
    return { status: "error", author: null };
  }

  const ctx = getDirectusQueryContext("getAuthorBySlug");
  if (!ctx) {
    return { status: "error", author: null };
  }

  const requestStartTime = logDirectusOperationStart(
    "getAuthorBySlug",
    ctx.directusUrl,
    { slug }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "authors" as never,
        {
          filter: {
            _and: [{ slug: { _eq: slug } }, { status: { _eq: "published" } }],
          },
          limit: 1,
          fields: [...AUTHOR_FIELDS],
        } as never
      )
    );

    const rows = unwrapListResponse(response);
    logDirectusOperationSuccess(
      "getAuthorBySlug",
      ctx.directusUrl,
      { found: rows.length > 0 },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug({ slug }, "Author not found in Directus");
      return { status: "success", author: null };
    }

    const author = transformRawAuthor(
      rows[0] as Partial<import("@/types/directus").DirectusAuthor>
    );
    return { status: author ? "success" : "error", author };
  } catch (error) {
    logDirectusOperationError(
      "getAuthorBySlug",
      error,
      requestStartTime,
      ctx.directusUrl,
      { slug }
    );
    return { status: "error", author: null };
  }
}
