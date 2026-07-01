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
