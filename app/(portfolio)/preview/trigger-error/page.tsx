/**
 * Dev-only route that throws on render to exercise app/error.tsx.
 * Navigate away via the URL bar (or Try Again then a new URL) to recover.
 */
export default function PreviewTriggerErrorPage() {
  throw new Error(
    "Dev tools: intentional error boundary test (/preview/trigger-error)"
  );
}
