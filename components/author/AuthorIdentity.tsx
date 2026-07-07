import type { ResolvedAuthorProfile } from "@/types";
import { hexToRgba } from "@/constants/theme";

interface AuthorEmojiBadgeProps {
  author: ResolvedAuthorProfile;
  size?: "md" | "lg";
}

export function AuthorEmojiBadge({
  author,
  size = "md",
}: AuthorEmojiBadgeProps) {
  const emojiClass = size === "lg" ? "text-3xl" : "text-2xl";
  const circleClass = size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div
      className={`flex ${circleClass} shrink-0 items-center justify-center rounded-full border`}
      style={{
        borderColor: hexToRgba(author.accent_hex, 0.45),
        backgroundColor: hexToRgba(author.accent_hex, 0.12),
      }}
    >
      <span className={emojiClass} aria-hidden="true">
        {author.emoji}
      </span>
    </div>
  );
}

interface AuthorIdentityProps {
  author: ResolvedAuthorProfile;
  emojiSize?: "md" | "lg";
  showRole?: boolean;
  showEmoji?: boolean;
}

export function AuthorIdentity({
  author,
  emojiSize = "md",
  showRole = true,
  showEmoji = true,
}: AuthorIdentityProps) {
  const nameBlock = (
    <div className="min-w-0 text-left">
      <p className="font-heading text-xl font-semibold text-slate-50">
        {author.display_name}
      </p>
      {showRole && author.role && (
        <p className="mt-0.5 text-sm text-slate-400">{author.role}</p>
      )}
    </div>
  );

  if (!showEmoji) {
    return nameBlock;
  }

  return (
    <div className="flex items-center gap-4">
      <AuthorEmojiBadge author={author} size={emojiSize} />
      {nameBlock}
    </div>
  );
}
