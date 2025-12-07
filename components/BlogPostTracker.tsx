"use client";

import { useEffect } from "react";
import { trackBlogPostView } from "@/components/Matomo";

interface BlogPostTrackerProps {
  slug: string;
  title: string;
}

/**
 * Client component to track blog post views
 * This is separate from the main Matomo component to allow
 * server components to pass blog post data
 */
export function BlogPostTracker({ slug, title }: BlogPostTrackerProps) {
  useEffect(() => {
    // Track blog post view when component mounts
    trackBlogPostView(slug, title);
  }, [slug, title]);

  return null;
}
