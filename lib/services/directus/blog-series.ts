/**
 * Blog Series Query Functions
 *
 * Directus operations for the `blog_series` collection.
 * Requires `blogs.series` M2O (or slug field) before post membership queries work.
 * Series UI routes are not implemented yet — handlers only.
 */

import { readItems } from "@directus/sdk";
import type { BlogSeries, Post } from "@/types";
import { createLogger } from "@/lib/dev-tooling/logger";

import { getPublishedPosts } from "./blogs";
import {
  getDirectusQueryContext,
  logDirectusOperationStart,
  logDirectusOperationSuccess,
  logDirectusOperationError,
  directusRequest,
  unwrapListResponse,
} from "./query-context";
import { BLOG_SERIES_FIELDS, transformRawBlogSeries } from "./transforms";

const log = createLogger("ALL");

export interface BlogSeriesListResult {
  status: "success" | "error";
  series: BlogSeries[];
}

export interface BlogSeriesResult {
  status: "success" | "error";
  series: BlogSeries | null;
}

export interface SeriesPostsResult {
  status: "success" | "error";
  series: BlogSeries | null;
  posts: Post[];
}

function postSeriesSlug(post: Post): string | null {
  const raw = post as Post & {
    series?: { slug?: string } | string | null;
    series_order?: number | null;
  };

  if (!raw.series) {
    return null;
  }
  if (typeof raw.series === "string") {
    return raw.series;
  }
  return raw.series.slug ?? null;
}

/**
 * Fetches all published series, sorted by `sort_order` then title.
 */
export async function getPublishedSeries(): Promise<BlogSeriesListResult> {
  const ctx = getDirectusQueryContext("getPublishedSeries");
  if (!ctx) {
    return { status: "error", series: [] };
  }

  const requestStartTime = logDirectusOperationStart(
    "getPublishedSeries",
    ctx.directusUrl,
    { filter: "status=published" }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "blog_series" as never,
        {
          filter: { status: { _eq: "published" } },
          sort: ["sort_order", "title"],
          fields: [...BLOG_SERIES_FIELDS],
        } as never
      )
    );

    const rows = unwrapListResponse(response);
    logDirectusOperationSuccess(
      "getPublishedSeries",
      ctx.directusUrl,
      { count: rows.length },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug("No published blog series found in Directus");
      return { status: "success", series: [] };
    }

    const series = rows
      .map((raw) =>
        transformRawBlogSeries(
          raw as Partial<import("@/types/directus").DirectusBlogSeries>
        )
      )
      .filter((item): item is BlogSeries => item !== null);

    return { status: "success", series };
  } catch (error) {
    logDirectusOperationError(
      "getPublishedSeries",
      error,
      requestStartTime,
      ctx.directusUrl
    );
    return { status: "error", series: [] };
  }
}

/**
 * Fetches a single published series by slug.
 */
export async function getSeriesBySlug(slug: string): Promise<BlogSeriesResult> {
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    log.warn({ slug }, "Invalid slug provided to getSeriesBySlug");
    return { status: "error", series: null };
  }

  const ctx = getDirectusQueryContext("getSeriesBySlug");
  if (!ctx) {
    return { status: "error", series: null };
  }

  const requestStartTime = logDirectusOperationStart(
    "getSeriesBySlug",
    ctx.directusUrl,
    { slug }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "blog_series" as never,
        {
          filter: {
            _and: [{ slug: { _eq: slug } }, { status: { _eq: "published" } }],
          },
          limit: 1,
          fields: [...BLOG_SERIES_FIELDS],
        } as never
      )
    );

    const rows = unwrapListResponse(response);
    logDirectusOperationSuccess(
      "getSeriesBySlug",
      ctx.directusUrl,
      { found: rows.length > 0 },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug({ slug }, "Blog series not found in Directus");
      return { status: "success", series: null };
    }

    const series = transformRawBlogSeries(
      rows[0] as Partial<import("@/types/directus").DirectusBlogSeries>
    );
    return { status: series ? "success" : "error", series };
  } catch (error) {
    logDirectusOperationError(
      "getSeriesBySlug",
      error,
      requestStartTime,
      ctx.directusUrl,
      { slug }
    );
    return { status: "error", series: null };
  }
}

/**
 * Returns published posts belonging to a series slug.
 * Requires `blogs.series` M2O on the Directus schema; returns empty until wired.
 */
export async function getPostsInSeries(
  slug: string
): Promise<SeriesPostsResult> {
  const { status: seriesStatus, series } = await getSeriesBySlug(slug);
  if (seriesStatus === "error") {
    return { status: "error", series: null, posts: [] };
  }

  const { status, posts } = await getPublishedPosts();
  if (status === "error") {
    return { status: "error", series, posts: [] };
  }

  if (!series) {
    log.debug({ slug }, "No series metadata; cannot resolve series posts");
    return { status: "success", series: null, posts: [] };
  }

  const filtered = posts
    .filter((post) => postSeriesSlug(post) === series.slug)
    .sort((a, b) => {
      const orderA =
        (a as Post & { series_order?: number | null }).series_order ?? 0;
      const orderB =
        (b as Post & { series_order?: number | null }).series_order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (
        new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime()
      );
    });

  if (filtered.length === 0) {
    log.debug(
      { slug },
      "No published posts linked to series — blogs.series M2O may not be configured"
    );
  }

  return { status: "success", series, posts: filtered };
}
