"use client";

import { useAuthorDialog } from "@/components/author/AuthorDialogContext";

export function AuthorLink() {
  const { author, openDialog } = useAuthorDialog();

  return (
    <button
      type="button"
      onClick={openDialog}
      aria-haspopup="dialog"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-slate-400 transition-colors hover:text-[var(--author-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--author-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      style={
        {
          "--author-accent": author.accent_hex,
        } as React.CSSProperties
      }
    >
      <span aria-hidden="true">{author.emoji}</span>
      <span>By {author.display_name}</span>
    </button>
  );
}
