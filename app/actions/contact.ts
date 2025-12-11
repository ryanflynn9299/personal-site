"use server";

import { isEmailServiceConfigured } from "@/lib/email-service";
import type { FormState } from "@/types/forms";

export async function submitContactForm(formData: FormData): Promise<FormState> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

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
  const isDev = process.env.NODE_ENV === "development";

  if (!emailServiceAvailable) {
    // Email service is not available
    // Return success state but indicate email was not sent
    // IMPORTANT: Make it clear that messages are NOT being saved or stored
    return {
      success: true,
      emailSent: false,
      message: isDev
        ? "Email service is not configured, so your message cannot and will not be sent. No message has been saved or stored. Please use the direct email link above or configure SMTP environment variables to enable email delivery."
        : "Email service is currently unavailable, so your message cannot and will not be sent. No message has been saved or stored. Please try again later or use the direct email link above.",
    };
  }

  // Email service is available
  // TODO: Implement actual email sending logic
  // - Send email via SMTP using nodemailer or similar
  // - Store submission in database
  // - Rate limiting
  // - Spam protection

  // For now, simulate successful email sending
  // In the future, this would actually send the email
  return {
    success: true,
    emailSent: true,
    message: "Thank you for your message! I'll get back to you soon.",
  };
}

