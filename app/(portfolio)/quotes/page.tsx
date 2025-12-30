import type { Metadata } from "next";
import { QuotesPageClient } from "@/components/quotes/QuotesPageClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Quotes",
  description:
    "A curated collection of inspiring quotes and thoughts. Explore meaningful words that resonate with creativity, technology, and life.",
  path: "/quotes",
});

export default function QuotesPage() {
  return <QuotesPageClient />;
}
