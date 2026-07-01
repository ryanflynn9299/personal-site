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
 * Top-level Directus schema mapping collection names to their row types.
 * Used to type the SDK client at the initialization boundary.
 */
export interface DirectusSchema {
  blogs: DirectusBlogPost[];
  contact_messages: DirectusContactMessage[];
}
