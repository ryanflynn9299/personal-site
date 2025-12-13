import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { isEmailServiceConfigured } from "@/lib/email-service";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ryan Flynn to discuss projects, collaborations, or opportunities.",
};

export default function ContactPage() {
  // Check email service availability on the server
  const emailServiceAvailable = isEmailServiceConfigured();

  return <ContactPageClient emailServiceAvailable={emailServiceAvailable} />;
}
