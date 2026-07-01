import { Post } from "@/types";

export const dummyPosts: Post[] = [
  {
    id: "uuid-dummy-1",
    status: "published",
    title: "Understanding React Server Components in Next.js 13+",
    summary:
      "A deep dive into how React Server Components reshape the way we build modern web applications. We explore the mental model shift, performance benefits, and when to use Client Components.",
    author: { first_name: "Ryan", last_name: "Flynn" },
    slug: "post-1234abcd",
    publish_date: "2023-11-15T12:00:00.000Z",
    feature_image: null,
    content: `
# Understanding React Server Components

React Server Components (RSC) represent a paradigm shift in how we think about building React applications. In traditional React, rendering happens entirely on the client side, or via Server-Side Rendering (SSR) which builds an initial HTML shell but still requires complete hydration on the client.

## The Mental Model Shift

With RSCs, components are executed exactly once: on the server. They never ship their Javascript to the client. This means you can keep large dependencies (like markdown parsers or date formatting libraries) entirely on the server.

### Key Benefits

1. **Zero Bundle Size**: Since they don't ship JS to the client, RSCs have zero impact on your application's bundle size.
2. **Direct Backend Access**: You can securely query databases or internal APIs directly from your component without creating a separate API route.
3. **Automatic Code Splitting**: Server Components natively support code splitting by default.

When should you use Client Components? Whenever you need interactivity (\`onClick\`, \`useState\`, \`useEffect\`) or browser APIs (\`window\`, \`document\`).
    `,
    content_format: "markdown",
    tags: ["React", "Next.js", "Web Development"],
  },
  {
    id: "uuid-dummy-2",
    status: "published",
    title: "Mastering Tailwind CSS: Beyond Utility Classes",
    summary:
      "Go beyond the basics of Tailwind CSS. Learn how to construct sophisticated design systems, manage theme configurations, and maintain clean code when classes start piling up.",
    author: { first_name: "Ryan", last_name: "Flynn" },
    slug: "post-5678efgh",
    publish_date: "2023-12-05T09:30:00.000Z",
    feature_image: null,
    content: `
# Mastering Tailwind CSS

Tailwind CSS has taken the frontend world by storm, offering a highly productive, utility-first approach to styling. However, a common criticism is that it leads to messy, unreadable HTML.

## Organizing Your Utilities

When your class lists get long, it's essential to have a strategy.

- **Use Components**: Extract repeated patterns into React/Vue components rather than relying heavily on \`@apply\`.
- **Prettier Plugin**: The official Tailwind Prettier plugin is indispensable. It automatically sorts your classes in a standard order, making them much easier to scan.
- **cva (Class Variance Authority)**: For complex components with multiple states and variations (like buttons), libraries like \`cva\` combined with \`clsx\` or \`tailwind-merge\` are game-changers.

### Customizing the Theme

Don't be afraid to heavily customize your \`tailwind.config.js\`. The default theme is great, but tailoring it to your brand's specific color palette, typography, and spacing scale transforms Tailwind from a generic framework into a bespoke design system tool.
    `,
    content_format: "markdown",
    tags: ["CSS", "Design", "Tailwind"],
  },
  {
    id: "uuid-dummy-3",
    status: "published",
    title: "The Subtle Art of Effective Code Reviews",
    summary:
      "Code reviews aren't just for catching bugs; they're a vital tool for team communication and mentorship. Explore strategies for giving constructive feedback and reviewing code efficiently.",
    author: { first_name: "Ryan", last_name: "Flynn" },
    slug: "post-9988zzxx",
    publish_date: "2024-01-20T14:15:00.000Z",
    feature_image: null,
    content: `
# Effective Code Reviews

A code review is a conversation, not an interrogation. It's an opportunity to ensure code quality, share context, and collectively improve the codebase.

## For the Reviewer

1. **Ask, Don't Tell**: Instead of saying "Change this to an array map," try asking, "Would an array map be more efficient here?" This fosters discussion rather than defensiveness.
2. **Focus on the What and Why**: Nitpicking formatting should be left to automated linters. Focus your energy on architecture, business logic, and potential edge cases.
3. **Praise Good Code**: It's easy to only point out flaws. Calling out an elegant solution or a well-named variable goes a long way in building team morale.

## For the Author

- **Keep Pull Requests Small**: Huge PRs are difficult to review effectively. Break your work down into logical, easily digestible chunks.
- **Write Good Descriptions**: Provide context. Why is this change necessary? How does it solve the problem? What should the reviewer look out for?
    `,
    content_format: "markdown",
    tags: ["Software Engineering", "Teamwork", "Culture"],
  },
  {
    id: "uuid-dummy-4",
    status: "published",
    title: "Building Resilient Architectures with Go",
    summary:
      "An exploration of Go's concurrency model, error handling patterns, and strategies for designing robust, scalable backend systems.",
    author: { first_name: "Ryan", last_name: "Flynn" },
    slug: "post-1122aabb",
    publish_date: "2024-02-10T10:45:00.000Z",
    feature_image: null,
    content: `
# Resilient Architectures in Go

Go (Golang) is celebrated for its simplicity, performance, and excellent concurrency primitives. Building resilient systems requires understanding how to leverage these features effectively.

## Concurrency: Goroutines and Channels

Go makes concurrency easy, but doing it correctly requires discipline. 

- **Don't communicate by sharing memory; share memory by communicating.** Channels are the preferred way to synchronize state and pass data between goroutines safely.
- **Always know when a goroutine stops.** Leaking goroutines is a common source of memory exhaustion. Use Contexts to manage cancellation and timeouts across boundaries.

## Error Handling

Go's explicit error handling (\`if err != nil\`) forces you to think about failure states at every step.

- **Wrap Errors**: Don't just return errors up the stack. Wrap them to add context (e.g., \`fmt.Errorf("failed to fetch user: %w", err)\`). This makes debugging significantly easier.
- **Graceful Degradation**: Plan for external dependencies to fail. Implement retries (with exponential backoff) and circuit breakers to prevent cascading failures.
    `,
    content_format: "markdown",
    tags: ["Go", "Architecture", "Backend"],
  },
];
