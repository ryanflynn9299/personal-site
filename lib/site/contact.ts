import { config, runtime } from "@/lib/config";

/** Fallback when NEXT_PUBLIC_CONTACT_EMAIL is unset or invalid. */
export const DEFAULT_CONTACT_EMAIL = "ryan.flynn001@gmail.com";

const PLACEHOLDER_PATTERNS = ["your-", "example.com", "you@"];

function isPlaceholderEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Public contact email from NEXT_PUBLIC_CONTACT_EMAIL (single source of truth).
 * Falls back to DEFAULT_CONTACT_EMAIL so direct contact is always available.
 */
export function getContactEmail(): string {
  const configured = config.contactEmail?.trim();
  if (
    configured &&
    isValidEmail(configured) &&
    !isPlaceholderEmail(configured)
  ) {
    return configured;
  }
  return DEFAULT_CONTACT_EMAIL;
}

export function getContactMailtoHref(): string {
  return `mailto:${getContactEmail()}`;
}

export interface ContactDeliveryStatus {
  contactEmail: string;
  directusAvailable: boolean;
  emailServiceAvailable: boolean;
  /** Whether the contact form can deliver messages in the current runtime mode. */
  canAcceptSubmissions: boolean;
}

export function getContactUnavailableMessage(
  status: ContactDeliveryStatus
): string {
  if (runtime.isOfflineDev) {
    return "Development mode: messages are not delivered to real services.";
  }
  if (status.canAcceptSubmissions) {
    return "";
  }
  if (status.contactEmail) {
    return "The contact form is temporarily unavailable. Please email directly using the address on the left.";
  }
  return "The contact form is temporarily unavailable. Please try again later.";
}

/**
 * Tooltip copy for contact/email status indicators.
 * Production messages avoid env variable names and internal configuration detail.
 */
export function getContactStatusTooltip(): string {
  if (runtime.isOfflineDev && runtime.isDevelopment) {
    return "Development mode: online messaging is disabled.";
  }
  if (runtime.isDevelopment) {
    return "Online messaging is not configured in this environment.";
  }
  return "Online messaging is temporarily unavailable.";
}
