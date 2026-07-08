// Re-export all types for convenience
export * from "./components";
export * from "./forms";
export * from "./policies";
export * from "./formatting";
export * from "./directus";

/** Frontend-facing Post type. Clean shape consumed by UI components. */
export interface Post {
  id: string;
  status: "published" | "draft" | "archived";
  title: string;
  summary: string;
  author: { first_name: string; last_name: string };
  slug: string;
  publish_date: string;
  feature_image: { id: number; filename: string } | null;
  content: string;
  /**
   * Optional content format. If not provided, will be auto-detected.
   * Can be "markdown", "html", "plaintext", or "auto"
   */
  content_format?: "markdown" | "html" | "plaintext" | "auto";
  tags: string[];
}

/** Keys into constants/theme.ts → authorAccents */
export type AuthorAccentKey =
  | "sky"
  | "emerald"
  | "gold"
  | "ruby"
  | "violet"
  | "cyan"
  | "fuchsia"
  | "indigo"
  | "teal"
  | "orange";

export interface PostAuthor {
  first_name: string;
  last_name: string;
}

export interface AuthorProfile {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  emoji: string;
  accent?: AuthorAccentKey;
  role?: string;
  bio_short?: string;
}

export interface ResolvedAuthorProfile extends AuthorProfile {
  display_name: string;
  accent: AuthorAccentKey;
  accent_hex: string;
}

export interface AuthorPostSummary {
  id: string;
  title: string;
  slug: string;
  publish_date: string;
}

export interface AuthorContext {
  post_count: number;
  topic_count: number;
  top_tags: string[];
  recent_posts: AuthorPostSummary[];
}

/** Frontend-facing counter row from the `counters` collection. */
export interface SiteCounter {
  id: string;
  key: string;
  value: number;
  metadata: Record<string, unknown> | null;
  updated_at: string;
}

/** Admin-facing contact message (read from Directus). */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

/** Frontend-facing blog tag from the `blog_tags` collection. */
export interface BlogTag {
  id: string;
  slug: string;
  label: string;
  description: string;
  color: string | null;
  sort: number;
}

/** Frontend-facing blog series from the `blog_series` collection. */
export interface BlogSeries {
  id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  cover_image: { id: number; filename: string } | null;
}
