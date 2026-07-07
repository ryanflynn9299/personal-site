import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmailStatusIndicatorWithStatus } from "@/components/contact/EmailStatusIndicator";

vi.mock("@/lib/config", async () => {
  const { createDynamicConfigMock } = await import("../mocks/config");
  return createDynamicConfigMock();
});

describe("EmailStatusIndicatorWithStatus", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing when email service is available", () => {
    const { container } = render(
      <EmailStatusIndicatorWithStatus emailServiceAvailable={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders indicator when email service is unavailable", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows alert icon when email service is unavailable", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    expect(document.querySelector(".text-amber-400")).toBeInTheDocument();
  });

  it("has accessible aria-label", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveAttribute("aria-label");
    expect(indicator.getAttribute("aria-label")).toContain("messaging");
  });

  it("shows tooltip on hover", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");

    expect(screen.queryByText(/messaging/i)).not.toBeInTheDocument();

    fireEvent.mouseEnter(indicator);
    expect(screen.getByText(/messaging/i)).toBeInTheDocument();

    fireEvent.mouseLeave(indicator);
    expect(screen.queryByText(/messaging/i)).not.toBeInTheDocument();
  });

  it("shows offline-dev message in offline-dev mode", () => {
    vi.stubEnv("RUNTIME_MODE", "offline-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    fireEvent.mouseEnter(screen.getByRole("status"));

    expect(screen.getByText(/Development mode/i)).toBeInTheDocument();
  });

  it("shows development message in live-dev mode without env names", () => {
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    fireEvent.mouseEnter(screen.getByRole("status"));

    expect(
      screen.getByText(/not configured in this environment/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/SMTP/i)).not.toBeInTheDocument();
  });

  it("shows production message without internal configuration detail", () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    fireEvent.mouseEnter(screen.getByRole("status"));

    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/SMTP/i)).not.toBeInTheDocument();
  });

  it("has cursor-help class for accessibility", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    expect(screen.getByRole("status")).toHaveClass("cursor-help");
  });
});
