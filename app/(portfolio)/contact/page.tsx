import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { runtime } from "@/lib/config";
import {
  getContactMailtoHref,
  getContactUnavailableMessage,
} from "@/lib/site/contact";
import { getContactDeliveryStatus } from "@/lib/site/contact.server";
import { generatePageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact",
  description:
    "Get in touch with Ryan Flynn to discuss projects, collaborations, or opportunities. Let's connect and build something amazing together.",
  path: "/contact",
});

export default function ContactPage() {
  const deliveryStatus = getContactDeliveryStatus();
  const unavailableMessage = getContactUnavailableMessage(deliveryStatus);
  const messagingReady =
    deliveryStatus.directusAvailable || deliveryStatus.emailServiceAvailable;
  const isFormDisabled = runtime.connectToServices && !messagingReady;

  return (
    <ContactPageClient
      contactEmail={deliveryStatus.contactEmail}
      mailtoHref={getContactMailtoHref()}
      emailServiceAvailable={deliveryStatus.emailServiceAvailable}
      canAcceptSubmissions={deliveryStatus.canAcceptSubmissions}
      isFormDisabled={isFormDisabled}
      unavailableMessage={unavailableMessage}
    />
  );
}
