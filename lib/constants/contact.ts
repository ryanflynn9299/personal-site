/** Client-safe contact form constants (shared by UI and server validation). */
export const CONTACT_HONEYPOT_FIELD = "website";

/** Server-enforced input length limits (mirrored as maxLength in the UI). */
export const CONTACT_MAX_NAME_LENGTH = 100;
export const CONTACT_MAX_EMAIL_LENGTH = 254;
export const CONTACT_MAX_MESSAGE_LENGTH = 5000;
