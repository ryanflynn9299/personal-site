import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthorDialogProvider } from "@/components/author/AuthorDialogContext";
import { AuthorPostFooter } from "@/components/author/AuthorPostFooter";
import { AuthorByline } from "@/components/author/AuthorByline";
import type { AuthorContext, ResolvedAuthorProfile } from "@/types";

vi.mock("radix-ui", () => ({
  Dialog: {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div data-testid="author-dialog">{children}</div> : null,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Overlay: () => <div data-testid="author-dialog-overlay" />,
    Content: ({ children }: { children: React.ReactNode }) => (
      <div role="dialog">{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Close: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

const ryanAuthor: ResolvedAuthorProfile = {
  id: "ryan-flynn",
  slug: "ryan-flynn",
  first_name: "Ryan",
  last_name: "Flynn",
  display_name: "Ryan Flynn",
  emoji: "🪐",
  accent: "violet",
  accent_hex: "#8b5cf6",
  role: "Software Engineer",
  bio_short: "Software engineer specializing in backend development.",
};

const richContext: AuthorContext = {
  post_count: 3,
  topic_count: 2,
  top_tags: ["nextjs", "typescript"],
  recent_posts: [
    {
      id: "2",
      title: "Older Post",
      slug: "older-post",
      publish_date: "2024-01-01T00:00:00Z",
    },
  ],
};

const emptyContext: AuthorContext = {
  post_count: 0,
  topic_count: 0,
  top_tags: [],
  recent_posts: [],
};

function renderWithAuthor(
  author: ResolvedAuthorProfile,
  context: AuthorContext,
  ui: React.ReactNode
) {
  return render(
    <AuthorDialogProvider author={author} context={context}>
      {ui}
    </AuthorDialogProvider>
  );
}

describe("AuthorPostFooter", () => {
  it("renders emoji, name, bio excerpt, and CTA", () => {
    renderWithAuthor(ryanAuthor, richContext, <AuthorPostFooter />);

    expect(screen.getByText("Written by")).toBeInTheDocument();
    expect(screen.getByText("Ryan Flynn")).toBeInTheDocument();
    expect(
      screen.getByText(/Software engineer specializing/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "About the author" })
    ).toBeInTheDocument();
  });

  it("opens the author dialog when CTA is clicked", async () => {
    const user = userEvent.setup();
    renderWithAuthor(ryanAuthor, richContext, <AuthorPostFooter />);

    await user.click(screen.getByRole("button", { name: "About the author" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("📚 Recent writing")).toBeInTheDocument();
  });

  it("omits bio excerpt when bio_short is missing", () => {
    const guestAuthor: ResolvedAuthorProfile = {
      ...ryanAuthor,
      id: "guest",
      slug: "guest",
      display_name: "Guest Author",
      first_name: "Guest",
      last_name: "Author",
      emoji: "✍️",
      bio_short: undefined,
      role: undefined,
    };

    renderWithAuthor(guestAuthor, emptyContext, <AuthorPostFooter />);

    expect(screen.getByText("Guest Author")).toBeInTheDocument();
    expect(
      screen.queryByText(/Software engineer specializing/)
    ).not.toBeInTheDocument();
  });
});

describe("AuthorByline", () => {
  it("renders clickable author link with metadata", async () => {
    const user = userEvent.setup();
    renderWithAuthor(
      ryanAuthor,
      richContext,
      <AuthorByline
        formattedDate="January 1, 2024"
        publishDate="2024-01-01T00:00:00Z"
        readingTime="3 min read"
      />
    );

    expect(
      screen.getByRole("button", { name: /By Ryan Flynn/ })
    ).toBeInTheDocument();
    expect(screen.getByText("3 min read")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /By Ryan Flynn/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("AuthorPopup edge cases", () => {
  it("hides stats when there are no posts or topics", async () => {
    const user = userEvent.setup();
    renderWithAuthor(ryanAuthor, emptyContext, <AuthorPostFooter />);

    await user.click(screen.getByRole("button", { name: "About the author" }));

    expect(screen.queryByText(/📝/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🏷️/)).not.toBeInTheDocument();
    expect(screen.queryByText("📚 Recent writing")).not.toBeInTheDocument();
  });

  it("shows singular post count copy", async () => {
    const user = userEvent.setup();
    renderWithAuthor(
      ryanAuthor,
      {
        post_count: 1,
        topic_count: 0,
        top_tags: [],
        recent_posts: [],
      },
      <AuthorPostFooter />
    );

    await user.click(screen.getByRole("button", { name: "About the author" }));

    expect(screen.getByText(/1 post/)).toBeInTheDocument();
    expect(screen.queryByText(/🏷️/)).not.toBeInTheDocument();
  });
});
