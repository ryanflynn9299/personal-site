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
import { isEmailServiceEnabled, env } from "./env";
import log from "./logger";

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
 * Uses the centralized environment configuration system.
 *
 * Policy:
 * - production/live-dev: SMTP MUST be configured (returns false if not = error condition)
 * - offline-dev/test: Always returns false (services disabled, no calls made)
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
  // In offline-dev and test, services are disabled - return false immediately
  if (!env.connectToServices) {
    return false;
  }

  // In production and live-dev, check if email service is actually configured
  const enabled = isEmailServiceEnabled();

  // If services should be connected but email is not configured, log error
  if (env.treatServiceErrorsAsReal && !enabled) {
    log.error(
      {
        mode: env.mode,
        host: env.smtp.host,
        port: env.smtp.port,
        from: env.smtp.from,
        to: env.smtp.to,
      },
      "Email service is not configured but is required in production/live-dev mode"
    );
  }

  return enabled;
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
  // In offline-dev and test, services are disabled - return error immediately
  if (!env.connectToServices) {
    return {
      success: false,
      error: "Email service is disabled in offline-dev/test mode",
    };
  }

  // Check if email service is configured
  if (!isEmailServiceConfigured()) {
    // In production/live-dev, this is a real error
    if (env.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: env.mode,
          messageTo: _message.to,
          messageSubject: _message.subject,
        },
        "CRITICAL: Attempted to send email but service not configured in production/live-dev mode"
      );
    }
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
