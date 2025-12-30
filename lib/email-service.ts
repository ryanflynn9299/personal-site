/**
 * Email Service
 *
 * Handles email sending functionality with proper error handling and configuration detection.
 * Follows the same pattern as the Directus service for consistency.
 *
 * In production, this will use a real SMTP service (e.g., nodemailer).
 * In tests, this service can be easily mocked to avoid delays and external dependencies.
 */

import { delay } from "./delay";

/**
 * Email sending result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email message data
 */
export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Checks if email service is configured and available.
 * Returns true if all required SMTP environment variables are set with non-placeholder values.
 *
 * Required variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port
 * - SMTP_FROM: Email address to send from
 * - SMTP_TO: Email address to send to
 *
 * Optional variables (if authentication is required):
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 *
 * @returns {boolean} True if email service is properly configured, false otherwise
 */
export function isEmailServiceConfigured(): boolean {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpFrom = process.env.SMTP_FROM;
  const smtpTo = process.env.SMTP_TO;

  // Check if all required variables are set, not empty, and not placeholder values
  const hasHost =
    smtpHost &&
    smtpHost.trim() !== "" &&
    !smtpHost.includes("your-") && // Exclude placeholder text
    smtpHost !== "localhost" && // Exclude default placeholder
    smtpHost !== "smtp.example.com"; // Exclude example placeholder

  const hasPort =
    smtpPort &&
    smtpPort.trim() !== "" &&
    !isNaN(Number(smtpPort)) && // Must be a valid number
    Number(smtpPort) > 0; // Must be positive

  const hasFrom =
    smtpFrom &&
    smtpFrom.trim() !== "" &&
    smtpFrom.includes("@") && // Must be a valid email format
    !smtpFrom.includes("your-") && // Exclude placeholder text
    smtpFrom !== "contact@example.com"; // Exclude example placeholder

  const hasTo =
    smtpTo &&
    smtpTo.trim() !== "" &&
    smtpTo.includes("@") && // Must be a valid email format
    !smtpTo.includes("your-") && // Exclude placeholder text
    smtpTo !== "your-email@example.com"; // Exclude example placeholder

  // All required variables must be present and valid
  return !!(hasHost && hasPort && hasFrom && hasTo);
}

/**
 * Sends an email using the configured SMTP service.
 *
 * This function simulates the email sending process including network delays.
 * In production, this will use a real SMTP service (e.g., nodemailer).
 * In tests, this service should be mocked to avoid delays.
 *
 * @param message - The email message to send
 * @returns {Promise<EmailSendResult>} Result of the email sending operation
 */
export async function sendEmail(
  _message: EmailMessage
): Promise<EmailSendResult> {
  // Check if email service is configured
  if (!isEmailServiceConfigured()) {
    return {
      success: false,
      error: "Email service is not configured",
    };
  }

  try {
    // Simulate network/processing delay (500ms)
    // In production, this represents actual SMTP communication time
    // In tests, this service should be mocked to return immediately
    await delay(500);

    // TODO: Implement actual email sending using nodemailer or similar
    // Example implementation:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT),
    //   secure: process.env.SMTP_PORT === "465",
    //   auth: process.env.SMTP_USER ? {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   } : undefined,
    // });
    //
    // const info = await transporter.sendMail({
    //   from: message.from,
    //   to: message.to,
    //   subject: message.subject,
    //   text: message.text,
    //   html: message.html,
    // });
    //
    // return {
    //   success: true,
    //   messageId: info.messageId,
    // };

    // For now, simulate successful email sending
    // In the future, this will actually send the email
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while sending email",
    };
  }
}
