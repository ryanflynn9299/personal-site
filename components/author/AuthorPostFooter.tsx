"use client";

import { Button } from "@/components/primitives/Button";
import {
  AuthorEmojiBadge,
  AuthorIdentity,
} from "@/components/author/AuthorIdentity";
import { useAuthorDialog } from "@/components/author/AuthorDialogContext";
import { truncateBio } from "@/lib/site/authors";
import { blogSpacing } from "@/lib/blog/spacing";
import { hexToRgba } from "@/constants/theme";
import { cn } from "@/lib/utils";

export function AuthorPostFooter() {
  const { author, openDialog } = useAuthorDialog();
  const excerpt = author.bio_short ? truncateBio(author.bio_short, 160) : null;

  return (
    <section
      aria-label="About the author"
      className={cn(
        blogSpacing.regionMajor,
        "rounded-lg border border-slate-700 bg-slate-800/50 p-6"
      )}
      style={{
        boxShadow: `inset 0 0 0 1px ${hexToRgba(author.accent_hex, 0.08)}`,
      }}
    >
      <div className="flex gap-4">
        <AuthorEmojiBadge author={author} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-400">Written by</p>
          <div
            className={cn(
              blogSpacing.groupRelated,
              "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            )}
          >
            <AuthorIdentity
              author={author}
              showRole={Boolean(author.role)}
              showEmoji={false}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-11 shrink-0 self-start border-[var(--author-accent-border)] hover:border-[var(--author-accent)] hover:text-[var(--author-accent)] sm:w-auto"
              style={
                {
                  "--author-accent": author.accent_hex,
                  "--author-accent-border": hexToRgba(author.accent_hex, 0.45),
                } as React.CSSProperties
              }
              onClick={openDialog}
              aria-haspopup="dialog"
            >
              About the author
            </Button>
          </div>
          {excerpt && (
            <p
              className={cn(
                blogSpacing.groupRelated,
                "text-sm leading-relaxed text-slate-300"
              )}
            >
              {excerpt}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
