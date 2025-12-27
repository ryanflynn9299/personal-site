// src/app/blog/BlogPageClient.tsx

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { Command } from "cmdk";
import { Post } from "@/types";
import { PostCard } from "@/components/blog/PostCard";
import { SearchButton } from "@/components/blog/SearchButton";
import { FileText } from "lucide-react";
import { Dialog } from "radix-ui";
import { ServiceUnavailable } from "@/components/common/ServiceUnavailable";
import { trackBlogSearch } from "@/components/common/Matomo";

interface BlogPageClientProps {
  status: "success" | "error";
  posts: Post[];
}

export function BlogPageClient({ posts, status }: BlogPageClientProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrackedQueryRef = useRef<string>("");

  // React 19: Use useSyncExternalStore for keyboard shortcut handling
  // This provides better performance and avoids unnecessary re-renders
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // React 19: Track search queries with debouncing and useTransition for better UX
  // useTransition allows the UI to remain responsive during search tracking
  useEffect(() => {
    if (!open || !searchQuery.trim()) {
      return;
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only track if query has changed
    if (searchQuery.trim() !== lastTrackedQueryRef.current) {
      searchTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          const filteredPosts = posts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.summary.toLowerCase().includes(searchQuery.toLowerCase())
          );
          trackBlogSearch(searchQuery.trim(), filteredPosts.length);
          lastTrackedQueryRef.current = searchQuery.trim();
        });
      }, 500); // Debounce for 500ms
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, open, posts, startTransition]);

  // Select what to render in the component
  const renderContent = () => {
    // If there's an error, show the service unavailable message
    if (status === "error") {
      return <ServiceUnavailable />;
    }

    // If successful but no posts, show the "no posts" message
    if (posts.length === 0) {
      return (
        <p className="mt-12 text-center text-slate-400">
          No posts found. Check back soon!
        </p>
      );
    }

    // If successful and there are posts, render the grid
    return (
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  return (
    // Use a React Fragment to wrap the page content and dialog
    <>
      <div className={open ? "content-blur" : "transition-all duration-300"}>
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row flex-nowrap items-center justify-between gap-4">
              <h1 className="font-heading shrink-0 text-4xl font-bold text-slate-50">
                Blog
              </h1>
              <SearchButton onClick={() => setOpen(true)} />
            </div>
            <p className="text-lg text-slate-300">
              Welcome to my digital journal. Here I share my thoughts,
              learnings, and explorations in the world of technology.
            </p>
          </div>

          {/* {posts && posts.length > 0 ? (
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post}/>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-12 text-center text-slate-400">No posts found. Check back soon!</p>
                    )} */}
          {/* Render the content based on our new logic */}
          {renderContent()}
        </div>
      </div>

      {/* The Command Palette Dialog is now a sibling to the main content div */}
      <Command.Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            // Reset search state when dialog closes
            setSearchQuery("");
            lastTrackedQueryRef.current = "";
          }
        }}
        label="Search Blog Posts"
      >
        <Dialog.Title className="DialogTitle" />{" "}
        {/* Necessary to prevent react error */}
        <Command.Input
          placeholder="Type to search articles..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Articles">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} passHref>
                <Command.Item onSelect={() => setOpen(false)}>
                  <FileText className="mr-3 h-5 w-5 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-slate-50">{post.title}</span>
                    <span className="text-xs text-slate-400">
                      {post.summary}
                    </span>
                  </div>
                </Command.Item>
              </Link>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
