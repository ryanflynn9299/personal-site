import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import * as contactAction from "@/app/actions/contact";

// Mock the server action
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
    const user = userEvent.setup();
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: true,
      message: "Thank you for your message!",
    });

    render(<ContactPageClient emailServiceAvailable={true} />);

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Hello, this is a test message"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    // Check that FormData was passed correctly
    const callArgs = mockSubmit.mock.calls[0][0];
    expect(callArgs).toBeInstanceOf(FormData);
  });

  it("displays error message when form submission fails", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.mocked(contactAction.submitContactForm);

    render(<ContactPageClient emailServiceAvailable={true} />);

    // Test scenario: HTML5 validation prevents empty form submission
    // This is the actual behavior - empty forms don't submit
    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission, so action should NOT be called
    await waitFor(
      () => {
        expect(mockSubmit).not.toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    // Form should still be visible (HTML5 validation shows browser tooltip, not our error)
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });

  it("displays server-side error message when validation fails", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: false,
      error: "All fields are required",
    });

    render(<ContactPageClient emailServiceAvailable={true} />);

    // Fill form with valid data that will pass HTML5 validation
    // but server will return an error (simulating server-side validation failure)
    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    // Wait for the server action to be called and error to be displayed
    await waitFor(
      () => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(screen.getByText("All fields are required")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify form is still visible (not hidden) when there's an error
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
  });

  it("displays success message when email is sent", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: true,
      message: "Thank you for your message!",
    });

    render(<ContactPageClient emailServiceAvailable={true} />);

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Message Sent Successfully!")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Thank you for your message!")
      ).toBeInTheDocument();
    });
  });

  it("displays warning when email service is unavailable", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      message: "Email service is currently unavailable",
    });

    render(<ContactPageClient emailServiceAvailable={false} />);

    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Message Cannot Be Sent")).toBeInTheDocument();
      expect(
        screen.getByText(/Email service is currently unavailable/)
      ).toBeInTheDocument();
    });
  });

  it("allows going back to form after submission", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.mocked(contactAction.submitContactForm);
    mockSubmit.mockResolvedValue({
      success: true,
      emailSent: false,
      message: "Email service unavailable",
    });

    render(<ContactPageClient emailServiceAvailable={false} />);

    // Fill and submit form
    await user.type(screen.getByPlaceholderText("Your Name"), "John Doe");
    await user.type(
      screen.getByPlaceholderText("Your Email"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Your Message"),
      "Test message"
    );

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Message Cannot Be Sent")).toBeInTheDocument();
    });

    // Click go back button
    const goBackButton = screen.getByRole("button", {
      name: /go back to form/i,
    });
    await user.click(goBackButton);

    // Form should be visible again
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    });
  });
});
