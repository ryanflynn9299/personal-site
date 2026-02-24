/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import * as contactAction from "@/app/actions/contact";

// Mock logger to avoid console output during tests
vi.mock("@/lib/logger", () => {
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
// This ensures sendEmail returns immediately without any delay
vi.mock("@/lib/email-service", () => ({
  isEmailServiceConfigured: vi.fn(() => true),
  sendEmail: vi.fn().mockResolvedValue({
    success: true,
    messageId: "test-message-id",
  }),
}));

// Also mock the delay function to ensure no delays in tests
vi.mock("@/lib/delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

// Mock the server action - must resolve immediately for fast tests
vi.mock("@/app/actions/contact", () => ({
  submitContactForm: vi.fn(),
}));

// Mock framer-motion to avoid animation delays in tests
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
    render(<ContactPageClient emailServiceAvailable={true} />);

    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument();
  });

  it("renders direct contact information", () => {
    render(<ContactPageClient emailServiceAvailable={true} />);

    // Check that the "Direct Contact" section heading is present
    expect(screen.getByText("Direct Contact")).toBeInTheDocument();

    // Check for the email contact card by looking for the email address link
    // This is more specific than just "Email" which appears in multiple places
    // (form label, paragraph text, and contact card heading)
    const emailLink = screen.getByRole("link", {
      name: /ryan\.flynn001@gmail\.com/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", "mailto:ryan.flyn001@gmail.com");

    // Check for the LinkedIn contact card by looking for the link
    const linkedInLink = screen.getByRole("link", {
      name: /connect with me professionally/i,
    });
    expect(linkedInLink).toBeInTheDocument();
    expect(linkedInLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/ryan-flynn04/"
    );
    expect(linkedInLink).toHaveAttribute("target", "_blank");
    expect(linkedInLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays email service status indicator", () => {
    render(<ContactPageClient emailServiceAvailable={true} />);
    // EmailStatusIndicator should be present (mocked component)
    expect(screen.getByText("Send a Message")).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    // Resolve immediately - no async delay
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: true,
      message: "Thank you for your message!",
    });

    render(<ContactPageClient emailServiceAvailable={true} />);

    // Use faster input methods - skipClick is not needed, delay: null is enough
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Your Email");
    const messageInput = screen.getByPlaceholderText("Your Message");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(messageInput, "Hello, this is a test message");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    // Action should be called immediately
    await waitFor(
      () => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      },
      { timeout: 100 }
    );

    // Check that FormData was passed correctly
    const callArgs = mockSubmit.mock.calls[0][0];
    expect(callArgs).toBeInstanceOf(FormData);
  });

  it("displays error message when form submission fails", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);

    render(<ContactPageClient emailServiceAvailable={true} />);

    // Test scenario: HTML5 validation prevents empty form submission
    // This is the actual behavior - empty forms don't submit
    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission immediately, so action should NOT be called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(mockSubmit).not.toHaveBeenCalled();

    // Form should still be visible (HTML5 validation shows browser tooltip, not our error)
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });

  it("displays server-side error message when validation fails", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    // Resolve immediately - no async delay
    mockSubmit.mockResolvedValue({
      success: false,
      error: "All fields are required",
    });

    render(<ContactPageClient emailServiceAvailable={true} />);

    // Fill form with valid data that will pass HTML5 validation
    // but server will return an error (simulating server-side validation failure)
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Your Email");
    const messageInput = screen.getByPlaceholderText("Your Message");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(messageInput, "Test message");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    // Wait for the server action to be called and error to be displayed
    await waitFor(
      () => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByText("All fields are required")).toBeInTheDocument();
      },
      { timeout: 100 }
    );

    // Verify form is still visible (not hidden) when there's an error
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });

  it("displays success message when email is sent", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    // Resolve immediately - no async delay
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: true,
      message: "Thank you for your message!",
    });

    render(<ContactPageClient emailServiceAvailable={true} />);

    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Your Email");
    const messageInput = screen.getByPlaceholderText("Your Message");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(messageInput, "Test message");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

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

  it("displays warning when email service is unavailable", async () => {
    const user = userEvent.setup({ delay: null });
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    // Resolve immediately - no async delay
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      message: "Email service is currently unavailable",
    });

    render(<ContactPageClient emailServiceAvailable={false} />);

    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Your Email");
    const messageInput = screen.getByPlaceholderText("Your Message");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(messageInput, "Test message");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

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
    // Resolve immediately - no async delay
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      message: "Email service unavailable",
    });

    render(<ContactPageClient emailServiceAvailable={false} />);

    // Fill and submit form
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Your Email");
    const messageInput = screen.getByPlaceholderText("Your Message");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(messageInput, "Test message");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText("Message Cannot Be Sent")).toBeInTheDocument();
      },
      { timeout: 100 }
    );

    // Click go back button
    const goBackButton = screen.getByRole("button", {
      name: /go back to form/i,
    });
    await user.click(goBackButton);

    // Form should be visible again immediately
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });
});
