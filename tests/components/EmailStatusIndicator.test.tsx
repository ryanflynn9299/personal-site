import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmailStatusIndicatorWithStatus } from "@/components/contact/EmailStatusIndicator";

describe("EmailStatusIndicatorWithStatus", () => {
  it("renders nothing when email service is available", () => {
    const { container } = render(
      <EmailStatusIndicatorWithStatus emailServiceAvailable={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders indicator when email service is unavailable", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    expect(indicator).toBeInTheDocument();
  });

  it("shows alert icon when email service is unavailable", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    // AlertCircle icon should be present with amber color
    const icon = document.querySelector(".text-amber-400");
    expect(icon).toBeInTheDocument();
  });

  it("has accessible aria-label", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveAttribute("aria-label");
    expect(indicator.getAttribute("aria-label")).toContain("Email");
  });

  it("shows tooltip on hover", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");

    // Initially tooltip should not be visible
    expect(screen.queryByText(/Email service/)).not.toBeInTheDocument();

    // Hover to show tooltip
    fireEvent.mouseEnter(indicator);
    expect(screen.getByText(/Email service/)).toBeInTheDocument();

    // Mouse leave to hide tooltip
    fireEvent.mouseLeave(indicator);
    expect(screen.queryByText(/Email service/)).not.toBeInTheDocument();
  });

  it("shows development message in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    fireEvent.mouseEnter(indicator);

    expect(screen.getByText(/SMTP environment variables/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it("shows production message in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    fireEvent.mouseEnter(indicator);

    expect(screen.getByText(/currently unavailable/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it("has cursor-help class for accessibility", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveClass("cursor-help");
  });
});
