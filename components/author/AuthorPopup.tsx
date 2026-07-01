"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/primitives/Button";
import { AuthorIdentity } from "@/components/author/AuthorIdentity";
import { useAuthorDialog } from "@/components/author/AuthorDialogContext";
import {
  formatAuthorPostCount,
  formatAuthorTopicCount,
} from "@/lib/site/authors";
import { getBlogPostUrl } from "@/lib/utils";
import { hexToRgba } from "@/constants/theme";

function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AuthorPopup() {
  const { author, context, open, setOpen } = useAuthorDialog();

  const postCountLabel = formatAuthorPostCount(context.post_count);
  const topicCountLabel = formatAuthorTopicCount(context.topic_count);
  const showStats = Boolean(postCountLabel || topicCountLabel);
  const showRecentPosts = context.recent_posts.length > 0;
  const showBlogLink =
    !showRecentPosts && context.post_count > 0 && Boolean(author.bio_short);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[10001] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-700 bg-slate-900/95 p-6 shadow-xl backdrop-blur-sm focus:outline-none"
          aria-describedby={author.bio_short ? "author-popup-bio" : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title asChild>
              <div>
                <AuthorIdentity author={author} emojiSize="lg" />
              </div>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                aria-label="Close author profile"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div
            className="my-5 h-px w-full bg-gradient-to-r from-transparent to-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${hexToRgba(author.accent_hex, 0.55)}, transparent)`,
            }}
          />

          {author.bio_short && (
            <p
              id="author-popup-bio"
              className="text-sm leading-relaxed text-slate-300"
            >
              {author.bio_short}
            </p>
          )}

          {showStats && (
            <p className="mt-4 text-sm text-slate-400">
              {postCountLabel && <span>📝 {postCountLabel}</span>}
              {postCountLabel && topicCountLabel && (
                <span aria-hidden="true"> · </span>
              )}
              {topicCountLabel && <span>🏷️ {topicCountLabel}</span>}
            </p>
          )}

          {showRecentPosts && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-300">
                📚 Recent writing
              </h3>
              <ul className="mt-3 space-y-2">
                {context.recent_posts.map((recentPost) => (
                  <li key={recentPost.id}>
                    <Link
                      href={getBlogPostUrl(recentPost.slug)}
                      onClick={() => setOpen(false)}
                      className="block rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 transition-colors hover:bg-slate-800"
                      style={
                        {
                          borderColor: "rgb(51 65 85)",
                        } as React.CSSProperties
                      }
                      onMouseEnter={(event) => {
                        event.currentTarget.style.borderColor = hexToRgba(
                          author.accent_hex,
                          0.55
                        );
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.borderColor = "";
                      }}
                    >
                      <span className="block font-medium text-slate-100">
                        {recentPost.title}
                      </span>
                      <time
                        className="mt-0.5 block text-xs text-slate-400"
                        dateTime={recentPost.publish_date}
                      >
                        {formatPostDate(recentPost.publish_date)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showBlogLink && (
            <p className="mt-6 text-sm text-slate-400">
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="font-medium transition-colors hover:underline"
                style={{ color: author.accent_hex }}
              >
                Browse the blog →
              </Link>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-700 pt-5">
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: author.accent_hex }}
            >
              More about me →
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-400 transition-colors hover:text-slate-200"
            >
              Get in touch →
            </Link>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                Close
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
