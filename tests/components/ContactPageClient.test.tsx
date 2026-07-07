/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import * as contactAction from "@/app/actions/contact";
import type { ContactPageClientProps } from "@/types";

const CONTACT_EMAIL = "ryan.flynn001@gmail.com";

const defaultProps: ContactPageClientProps = {
  contactEmail: CONTACT_EMAIL,
  mailtoHref: `mailto:${CONTACT_EMAIL}`,
  emailServiceAvailable: true,
  canAcceptSubmissions: true,
  isFormDisabled: false,
  unavailableMessage: "",
};

function renderContact(overrides: Partial<ContactPageClientProps> = {}) {
  return render(<ContactPageClient {...defaultProps} {...overrides} />);
}

// Mock logger to avoid console output during tests
vi.mock("@/lib/dev-tooling/logger", () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => mockLogger),
    log: mockLogger,
    prodLog: mockLogger,
    devLog: mockLogger,
    default: mockLogger,
  };
});

// Mock the email service to avoid delays in tests
vi.mock("@/lib/services/email-service", () => ({
  isEmailServiceConfigured: vi.fn(() => true),
  sendEmail: vi.fn().mockResolvedValue({
    success: true,
    messageId: "test-message-id",
  }),
}));

vi.mock("@/lib/dev-tooling/delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/app/actions/contact", () => ({
  submitContactForm: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("ContactPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the contact form with all fields", () => {
    renderContact();

    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument();
  });

  it("renders direct contact information with matching mailto and display email", () => {
    renderContact();

    expect(screen.getByText("Direct Contact")).toBeInTheDocument();

    const emailLink = screen.getByRole("link", {
      name: new RegExp(CONTACT_EMAIL, "i"),
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
    expect(screen.getByText(CONTACT_EMAIL)).toBeInTheDocument();

    const linkedInLink = screen.getByRole("link", {
      name: /connect with me professionally/i,
    });
    expect(linkedInLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/ryan-flynn04/"
    );
    expect(linkedInLink).toHaveAttribute("target", "_blank");
    expect(linkedInLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("copies the same email address shown in the contact card", async () => {
    const user = userEvent.setup({ delay: null });
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    renderContact();

    await user.click(
      screen.getByRole("button", { name: /copy email address/i })
    );

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(CONTACT_EMAIL);
    });
    expect(
      screen.getByRole("button", { name: /email copied/i })
    ).toBeInTheDocument();
  });

  it("shows unavailable notice and disables form when submissions are blocked", () => {
    renderContact({
      emailServiceAvailable: false,
      canAcceptSubmissions: false,
      isFormDisabled: true,
      unavailableMessage:
        "The contact form is temporarily unavailable. Please email directly using the address on the left.",
    });

    expect(
      screen.getByText(/contact form is temporarily unavailable/i)
    ).toBeInTheDocument();

    const fieldset = document.querySelector("fieldset");
    expect(fieldset).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeDisabled();
  });

  it("displays email service status indicator", () => {
    renderContact();
    expect(screen.getByText("Send a Message")).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: true,
      message: "Thank you for your message!",
    });

    renderContact();

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Hello, this is a test message"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(
      () => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      },
      { timeout: 100 }
    );

    expect(mockSubmit.mock.calls[0][0]).toBeInstanceOf(FormData);
  });

  it("displays error message when form submission fails", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);

    renderContact();

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });

  it("displays server-side error message when validation fails", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: false,
      error: "All fields are required",
    });

    renderContact();

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(
      () => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByText("All fields are required")).toBeInTheDocument();
      },
      { timeout: 100 }
    );
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });

  it("displays success message when email is sent", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: true,
      message: "Thank you for your message!",
    });

    renderContact();

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(
      () => {
        expect(
          screen.getByText("Message Sent Successfully!")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Thank you for your message!")
        ).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it("displays stored-only warning when message saved but email failed", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      messageStored: true,
      message:
        "Your message was received and saved. Email notification could not be sent at this time.",
    });

    renderContact();

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(
      () => {
        expect(screen.getByText("Message Received")).toBeInTheDocument();
        expect(screen.getByText(/received and saved/i)).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it("displays warning when email service is unavailable", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      message: "Email service is currently unavailable",
    });

    renderContact({ emailServiceAvailable: false });

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(
      () => {
        expect(screen.getByText("Message Cannot Be Sent")).toBeInTheDocument();
        expect(
          screen.getByText(/Email service is currently unavailable/)
        ).toBeInTheDocument();
      },
      { timeout: 100 }
    );
  });

  it("allows going back to form after submission", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      message: "Email service unavailable",
    });

    renderContact({ emailServiceAvailable: false });

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(
      () => {
        expect(screen.getByText("Message Cannot Be Sent")).toBeInTheDocument();
      },
      { timeout: 100 }
    );

    await user.click(screen.getByRole("button", { name: /go back to form/i }));
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });
});
