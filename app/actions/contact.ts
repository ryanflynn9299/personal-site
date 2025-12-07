"use server";

/**
 * Server Action for contact form submission
 * 
 * React 19 Server Actions provide:
 * - Type-safe form handling
 * - Automatic form state management
 * - Progressive enhancement (works without JavaScript)
 * - Secure server-side execution
 * 
 * In production, this would:
 * - Validate input data
 * - Send email via SMTP or email service
 * - Store submission in database
 * - Return success/error status
 */
export type FormState =
  | { success: false; error?: string; message?: never }
  | { success: true; message: string; error?: never };

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

  // TODO: Implement actual form submission logic
  // - Send email via SMTP
  // - Store in database
  // - Rate limiting
  // - Spam protection

  // Simulate successful submission
  return {
    success: true,
    message: "Thank you for your message! I'll get back to you soon.",
  };
}

