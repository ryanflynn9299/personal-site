"use client";

import { Button } from "@/components/primitives/Button";
import { AuthorIdentity } from "@/components/author/AuthorIdentity";
import { useAuthorDialog } from "@/components/author/AuthorDialogContext";
import { truncateBio } from "@/lib/site/authors";
import { hexToRgba } from "@/constants/theme";

export function AuthorPostFooter() {
  const { author, openDialog } = useAuthorDialog();
  const excerpt = author.bio_short ? truncateBio(author.bio_short, 160) : null;

  return (
    <section
      aria-label="About the author"
      className="mt-12 rounded-lg border border-slate-700 bg-slate-800/50 p-6"
      style={{
        boxShadow: `inset 0 0 0 1px ${hexToRgba(author.accent_hex, 0.08)}`,
      }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-400">Written by</p>
          <div className="mt-3">
            <AuthorIdentity author={author} showRole={Boolean(author.role)} />
          </div>
          {excerpt && (
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {excerpt}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-11 shrink-0 border-[var(--author-accent-border)] hover:border-[var(--author-accent)] hover:text-[var(--author-accent)] sm:w-auto"
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
    </section>
  );
}
