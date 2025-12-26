import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { isEmailServiceConfigured } from "@/lib/email-service";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Ryan Flynn to discuss projects, collaborations, or opportunities. Let's connect and build something amazing together.",
  path: "/contact",
});

export default function ContactPage() {
  // Check email service availability on the server
  const emailServiceAvailable = isEmailServiceConfigured();

  return <ContactPageClient emailServiceAvailable={emailServiceAvailable} />;
}
