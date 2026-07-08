/**
 * Directus Schema Types
 *
 * Raw data shapes as they come from the Directus API. These represent the
 * actual collection schemas in Directus — field names match the CMS columns
 * (e.g. `publication_date`, `blog_tags`), NOT the frontend-facing types.
 *
 * The service layer transforms these into clean frontend types (e.g. `Post`).
 */

/**
 * Raw shape of a row in the `blogs` collection.
 * Field names match the Directus column names exactly.
 */
export interface DirectusBlogPost {
  id: string;
  status: "published" | "draft" | "archived";
  title: string;
  summary: string;
  slug: string;
  publication_date: string;
  content: string;
  feature_image: { id: number; filename: string } | null;
  blog_tags: string[];
  /** M2O → `blog_series` (optional until schema migration). */
  series?: { slug: string; title?: string } | string | null;
  /** Position within a series (optional). */
  series_order?: number | null;
  author: {
    first_name: string;
    last_name: string;
  } | null;
}

/**
 * Raw shape of a row in the `contact_messages` collection.
 */
export interface DirectusContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "archived";
  date_created?: string;
}

/**
 * Raw shape of a row in the `counters` collection.
 */
export interface DirectusCounter {
  id: string;
  key: string;
  value: number;
  metadata: Record<string, unknown> | null;
  date_updated?: string;
}

/**
 * Raw shape of a row in the `authors` collection.
 */
export interface DirectusAuthor {
  id: string;
  status: "published" | "draft";
  slug: string;
  first_name: string;
  last_name: string;
  emoji: string;
  accent: string | null;
  role: string | null;
  bio_short: string | null;
}

/**
 * Raw shape of a row in the `blog_tags` collection.
 */
export interface DirectusBlogTag {
  id: string;
  status: "published" | "draft";
  slug: string;
  label: string;
  description: string | null;
  color: string | null;
  sort: number | null;
}

/**
 * Raw shape of a row in the `blog_series` collection.
 */
export interface DirectusBlogSeries {
  id: string;
  status: "published" | "draft";
  slug: string;
  title: string;
  description: string | null;
  cover_image: { id: number; filename: string } | null;
  sort_order: number | null;
}

/**
 * Top-level Directus schema mapping collection names to their row types.
 * Used to type the SDK client at the initialization boundary.
 */
export interface DirectusSchema {
  blogs: DirectusBlogPost[];
  contact_messages: DirectusContactMessage[];
  counters: DirectusCounter[];
  authors: DirectusAuthor[];
  blog_tags: DirectusBlogTag[];
  blog_series: DirectusBlogSeries[];
}
