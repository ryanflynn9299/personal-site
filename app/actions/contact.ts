"use server";

import {
  isEmailServiceConfigured,
  sendEmail,
  type EmailMessage,
} from "@/lib/email-service";
import { env } from "@/lib/env";
import type { FormState } from "@/types/forms";

export async function submitContactForm(
  formData: FormData
): Promise<FormState> {
  // Extract form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Basic validation
  if (!name || !email || !message) {
    return {
      success: false,
      error: "All fields are required",
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address",
    };
  }

  // Check if email service is configured
  const emailServiceAvailable = isEmailServiceConfigured();
  const isProduction = env.isProduction;
  const isLiveDev = env.isLiveDev;
  const isOfflineDev = env.isOfflineDev;

  if (!emailServiceAvailable) {
    // In production/live-dev: This is a real error
    if (isProduction || isLiveDev) {
      return {
        success: false,
        error:
          "Email service is not configured. This is a configuration error. Please check your SMTP settings.",
      };
    }

    // In offline-dev: Informational message
    if (isOfflineDev) {
      return {
        success: true,
        emailSent: false,
        message:
          "Services are disabled in offline dev mode. Set APP_MODE=live-dev to enable email delivery.",
      };
    }

    // Fallback (should not happen)
    return {
      success: true,
      emailSent: false,
      message: "Email service is currently unavailable.",
    };
  }

  // Email service is available - send the email
  // The delay is now encapsulated in the sendEmail service
  // In tests, the email service can be mocked to avoid delays
  const emailMessage: EmailMessage = {
    from: process.env.SMTP_FROM || "noreply@example.com",
    to: process.env.SMTP_TO || "contact@example.com",
    subject: `Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`,
  };

  const emailResult = await sendEmail(emailMessage);

  if (!emailResult.success) {
    return {
      success: true,
      emailSent: false,
      message:
        "There was an error sending your message. Please try again later or use the direct email link above.",
    };
  }

  // Email sent successfully
  // TODO: Store submission in database for record-keeping
  // TODO: Implement rate limiting and spam protection

  return {
    success: true,
    emailSent: true,
    message: "Thank you for your message! I'll get back to you soon.",
  };
}
