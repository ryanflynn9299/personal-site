import "server-only";

import { runtime } from "@/lib/config";
import { isDirectusConfigured } from "@/lib/config/index";
import { isEmailServiceConfigured } from "@/lib/services/email-service";
import {
  getContactEmail,
  type ContactDeliveryStatus,
} from "@/lib/site/contact";

export type { ContactDeliveryStatus };

/**
 * Server-side contact delivery status for the contact page.
 */
export function getContactDeliveryStatus(): ContactDeliveryStatus {
  const directusAvailable = isDirectusConfigured();
  const emailServiceAvailable = isEmailServiceConfigured();
  const contactEmail = getContactEmail();

  const canAcceptSubmissions =
    runtime.isOfflineDev || runtime.isTest
      ? true
      : directusAvailable || emailServiceAvailable;

  return {
    contactEmail,
    directusAvailable,
    emailServiceAvailable,
    canAcceptSubmissions,
  };
}
