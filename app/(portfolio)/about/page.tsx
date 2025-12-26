import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "About Me",
  description:
    "Beyond the code, here's a little more about who I am. Learn about Ryan Flynn's background, interests, and journey in software engineering.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageClient />;
}
