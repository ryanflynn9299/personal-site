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
