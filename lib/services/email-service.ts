/**
 * Email Service
 *
 * Handles email sending functionality with proper error handling and configuration detection.
 * Follows the same pattern as the Directus service for consistency.
 *
 * In production, this will use a real SMTP service (e.g., nodemailer).
 * In tests, this service can be easily mocked to avoid delays and external dependencies.
 */

import { delay } from "../dev-tooling/delay";
import { runtime } from "../config";
import { serverConfig } from "../config/server";
import { createLogger } from "../dev-tooling/logger";

const log = createLogger("ALL");
const devLog = createLogger("DEV");

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
  if (!runtime.connectToServices) {
    return false;
  }

  const { host, port, from, to } = serverConfig.smtp;

  // Basic existence and placeholder check
  if (!host || !port || !from || !to || host.includes("your-")) {
    return false;
  }

  // Stricter validation for tests and runtime
  const isPortValid = !isNaN(Number(port)) && Number(port) > 0;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFromValid = emailRegex.test(from);
  const isToValid = emailRegex.test(to);

  const enabled = isPortValid && isFromValid && isToValid;

  if (runtime.treatServiceErrorsAsReal && !enabled) {
    log.error(
      {
        mode: runtime.mode,
        host,
        port,
        from,
        to,
      },
      "Email service is not configured correctly but is required in production/live-dev mode"
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
  if (!runtime.connectToServices) {
    return {
      success: false,
      error: "Email service is disabled in offline-dev/test mode",
    };
  }

  // Check if email service is configured
  if (!isEmailServiceConfigured()) {
    if (runtime.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: runtime.mode,
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

  const requestStartTime = Date.now();

  // Log service call initiation (dev only)
  devLog.info(
    {
      service: "Email",
      operation: "sendEmail",
      request: {
        to: _message.to,
        from: _message.from,
        subject: _message.subject,
        hasHtml: !!_message.html,
        textLength: _message.text.length,
      },
      smtp: {
        host: serverConfig.smtp.host,
        port: serverConfig.smtp.port,
      },
    },
    "Initiating email service call: sendEmail"
  );

  // Real SMTP transport is post-launch — never report mock success in production/live-dev
  if (runtime.treatServiceErrorsAsReal) {
    log.warn(
      {
        mode: runtime.mode,
        messageTo: _message.to,
        messageSubject: _message.subject,
      },
      "SMTP is configured but delivery is not implemented — refusing mock send"
    );
    return {
      success: false,
      error: "SMTP delivery is not yet implemented",
    };
  }

  try {
    // Simulate network/processing delay (500ms) for non-production modes only
    await delay(500);

    // TODO: Integrate SMTP provider (e.g. Nodemailer or Resend)
    const result = {
      success: true,
      messageId: `mock-${Date.now()}`,
    };

    const requestDuration = Date.now() - requestStartTime;

    // Log successful service call response (dev only)
    devLog.info(
      {
        service: "Email",
        operation: "sendEmail",
        response: {
          status: "success",
          messageId: result.messageId,
          durationMs: requestDuration,
        },
        request: {
          to: _message.to,
          subject: _message.subject,
        },
      },
      "Email service call completed: sendEmail"
    );

    return result;
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;

    // Log service call error (dev only)
    devLog.error(
      {
        service: "Email",
        operation: "sendEmail",
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          durationMs: requestDuration,
        },
        request: {
          to: _message.to,
          subject: _message.subject,
        },
      },
      "Email service call failed: sendEmail"
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while sending email",
    };
  }
}
