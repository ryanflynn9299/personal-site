import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Me",
  description: "Beyond the code, here's a little more about who I am.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
