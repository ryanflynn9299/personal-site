import type { Metadata } from "next";
import { ContactPageClient } from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ryan Flynn to discuss projects, collaborations, or opportunities.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
