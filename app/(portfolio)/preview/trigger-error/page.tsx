/**
 * Dev-only route that throws on render to exercise app/error.tsx.
 * Navigate away via the URL bar (or Try Again then a new URL) to recover.
 *
 * Must be dynamic — a static throw would fail `next build` prerender.
 */
export const dynamic = "force-dynamic";

export default function PreviewTriggerErrorPage() {
  throw new Error(
    "Dev tools: intentional error boundary test (/preview/trigger-error)"
  );
}
