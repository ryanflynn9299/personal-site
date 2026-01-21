"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Post } from "@/types";

interface UseBlogPostsResult {
  posts: Post[];
  status: "loading" | "success" | "error";
  error: Error | null;
  refetch: () => Promise<void>;
}

// Cache for blog posts to avoid redundant requests
let postsCache: {
  data: Post[];
  timestamp: number;
  status: "success" | "error";
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Client-side hook for fetching blog posts
 * Implements caching and request deduplication
 */
export function useBlogPosts(): UseBlogPostsResult {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    // Check cache first
    if (postsCache) {
      const cacheAge = Date.now() - postsCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        setPosts(postsCache.data);
        setStatus(postsCache.status);
        setError(null);
        return;
      }
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/blog/posts", {
        cache: "no-store", // Client-side fetch, don't cache at fetch level (we handle caching in the hook)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error("Failed to fetch blog posts");
      }

      // Update cache
      postsCache = {
        data: data.posts,
        timestamp: Date.now(),
        status: "success",
      };

      setPosts(data.posts);
      setStatus("success");
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setStatus("error");
      setPosts([]);

      // Cache error state (shorter duration)
      postsCache = {
        data: [],
        timestamp: Date.now(),
        status: "error",
      };
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return useMemo(
    () => ({
      posts,
      status,
      error,
      refetch: fetchPosts,
    }),
    [posts, status, error, fetchPosts]
  );
}
