"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Linkedin,
  Loader,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitContactForm, type FormState } from "@/app/actions/contact";
import { EmailStatusIndicatorWithStatus } from "@/components/ui/EmailStatusIndicator";

const initialState: FormState = { success: false };

interface SavedFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Submit button component that uses useFormStatus to track form state
 * This is a React 19 pattern that automatically tracks form submission status
 * useFormStatus must be used within a form element
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Sending..." : "Send Message"}
    </Button>
  );
}

interface ContactPageClientProps {
  /**
   * Whether the email service is configured and available
   */
  emailServiceAvailable: boolean;
}

export function ContactPageClient({ emailServiceAvailable }: ContactPageClientProps) {
  // Store form data to restore when "Go back" is clicked
  const [savedFormData, setSavedFormData] = useState<SavedFormData | null>(null);
  const [showForm, setShowForm] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);
  
  // React 19: useActionState for form state management
  // The action receives (prevState, formData) as parameters
  // useFormStatus in SubmitButton automatically tracks pending state
  const [state, formAction] = useActionState<FormState, FormData>(
    async (prevState: FormState, formData: FormData) => {
      // Save form data before submission
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;
      setSavedFormData({ name, email, message });
      setShowForm(false); // Hide form after submission
      
      return await submitContactForm(formData);
    },
    initialState
  );

  // Handle "Go back" button click
  const handleGoBack = () => {
    // Reset to show form again
    setShowForm(true);
    // Increment form key to force re-render
    setFormKey((prev) => prev + 1);
  };

  // Restore form values when form is shown again
  useEffect(() => {
    if (showForm && savedFormData && formRef.current) {
      const nameInput = formRef.current.querySelector<HTMLInputElement>("#name");
      const emailInput = formRef.current.querySelector<HTMLInputElement>("#email");
      const messageTextarea = formRef.current.querySelector<HTMLTextAreaElement>("#message");
      
      if (nameInput && savedFormData.name) nameInput.value = savedFormData.name;
      if (emailInput && savedFormData.email) emailInput.value = savedFormData.email;
      if (messageTextarea && savedFormData.message) messageTextarea.value = savedFormData.message;
    }
  }, [showForm, formKey, savedFormData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <header className="text-center">
        <h1 className="font-heading text-4xl font-bold text-slate-50 md:text-5xl">
          Get In Touch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Have a project in mind, a question, or just want to connect? I&apos;d love
          to hear from you.
        </p>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
        {/* Left Pane: Direct Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              Direct Contact
            </h2>
            <p className="mt-2 text-slate-400">
              For direct inquiries, feel free to reach out via email or connect
              with me on LinkedIn.
            </p>
          </div>
          <div className="space-y-4">
            <a
              href="mailto:ryan.flyn001@gmail.com"
              className="group flex items-center gap-4 rounded-lg bg-slate-800 p-4 transition-colors hover:bg-slate-700"
            >
              <Mail className="h-8 w-8 text-sky-300" />
              <div>
                <h3 className="font-semibold text-slate-100 group-hover:text-sky-300">
                  Email
                </h3>
                <p className="text-sm text-slate-400">
                  ryan.flynn001@gmail.com
                </p>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/ryan-flynn04/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-lg bg-slate-800 p-4 transition-colors hover:bg-slate-700"
            >
              <Linkedin className="h-8 w-8 text-sky-300" />
              <div>
                <h3 className="font-semibold text-slate-100 group-hover:text-sky-300">
                  LinkedIn
                </h3>
                <p className="text-sm text-slate-400">
                  Connect with me professionally
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Right Pane: Contact Form */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              Send a Message
            </h2>
            <EmailStatusIndicatorWithStatus emailServiceAvailable={emailServiceAvailable} />
          </div>
          {!showForm && state.success ? (
            state.emailSent ? (
              // Email was sent successfully - green success UI
              <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-500 bg-slate-800 p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="mt-4 font-semibold text-slate-50">
                  Message Sent Successfully!
                </h3>
                <p className="mt-2 text-slate-400">
                  {state.message || "Thank you for reaching out. I'll get back to you shortly."}
                </p>
              </div>
            ) : (
              // Email service unavailable - amber warning UI
              <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500 bg-slate-800 p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
                <h3 className="mt-4 font-semibold text-slate-50">
                  Message Cannot Be Sent
                </h3>
                <p className="mt-2 max-w-md text-slate-400">
                  {state.message || "Email service is currently unavailable. Your message cannot and will not be sent. No message has been saved or stored. Please use the direct email link above or try again later."}
                </p>
                <Button
                  onClick={handleGoBack}
                  className="mt-6"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back to Form
                </Button>
              </div>
            )
          ) : (
            <form
              key={formKey}
              ref={formRef}
              action={formAction}
              className="mt-4 space-y-4"
            >
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="Your Name"
                  className="w-full rounded-md border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 ring-offset-slate-900 transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="Your Email"
                  className="w-full rounded-md border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 ring-offset-slate-900 transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={5}
                  placeholder="Your Message"
                  className="w-full rounded-md border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 ring-offset-slate-900 transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {state.error && (
                    <p className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      {state.error}
                    </p>
                  )}
                </div>
                <SubmitButton />
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
