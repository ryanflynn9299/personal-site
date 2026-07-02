"use server";

import {
  isEmailServiceConfigured,
  sendEmail,
  type EmailMessage,
} from "@/lib/services/email-service";
import { getClientIp } from "@/lib/services/client-ip";
import { validateContactSubmission } from "@/lib/services/contact-protection";
import { runtime } from "@/lib/config";
import { serverConfig } from "@/lib/config/server";
import type { FormState } from "@/types/forms";

import {
  isDirectusConfigured,
  createContactMessage,
} from "@/lib/services/directus";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitContactForm(
  formData: FormData
): Promise<FormState> {
  const clientIp = await getClientIp();
  const protection = validateContactSubmission(formData, clientIp);

  if (!protection.allowed) {
    if (protection.reason === "honeypot") {
      // Silent success — do not signal to bots that the honeypot was detected
      return {
        success: true,
        emailSent: false,
        message: "Thank you for your message! I'll get back to you soon.",
      };
    }

    return {
      success: false,
      error: "Too many messages sent recently. Please try again later.",
    };
  }

  // Extract form data
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const message = (formData.get("message") as string) || "";

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

  // Service availability and mode check
  const directusAvailable = isDirectusConfigured();
  const emailServiceAvailable = isEmailServiceConfigured();
  const { isProduction, mode } = runtime;

  // 1. Store in Directus (if available)
  let directusStored = false;
  if (directusAvailable) {
    directusStored = await createContactMessage({ name, email, message });
  }

  // 2. Send Email (if available)
  let emailSent = false;
  if (emailServiceAvailable) {
    const emailMessage: EmailMessage = {
      from: serverConfig.smtp.from || "noreply@example.com",
      to: serverConfig.smtp.to || "contact@example.com",
      subject: `Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    };

    const emailResult = await sendEmail(emailMessage);
    emailSent = emailResult.success;
  }

  // 3. Determine Response based on Mode and Outcome
  if (mode === "offline-dev") {
    return {
      success: true,
      emailSent: false,
      messageStored: false,
      message: "Development Mode: Submission received (no services called).",
    };
  }

  if (!emailSent && !directusStored) {
    if (isProduction || mode === "live-dev") {
      return {
        success: false,
        error: "Failed to process your message. Please try again later.",
      };
    }
  }

  if (directusStored && !emailSent) {
    return {
      success: true,
      emailSent: false,
      messageStored: true,
      message:
        "Your message was received and saved. Email notification could not be sent at this time — I'll still see your message.",
    };
  }

  return {
    success: true,
    emailSent,
    messageStored: directusStored,
    message: "Thank you for your message! I'll get back to you soon.",
  };
}
