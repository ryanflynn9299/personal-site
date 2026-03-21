import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmailStatusIndicatorWithStatus } from "@/components/contact/EmailStatusIndicator";

// Mock the config module to allow it to be dynamic for tests
vi.mock("@/lib/config", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/config")>("@/lib/config");
  return {
    ...actual,
    config: {
      ...actual.config,
      get runtimeMode() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (process.env.RUNTIME_MODE as any) || actual.config.runtimeMode;
      },
    },
    runtime: {
      get mode() {
        return process.env.RUNTIME_MODE || "offline-dev";
      },
      get isProduction() {
        return process.env.RUNTIME_MODE === "production";
      },
      get isDevelopment() {
        return (
          process.env.RUNTIME_MODE === "live-dev" ||
          process.env.RUNTIME_MODE === "offline-dev"
        );
      },
      get isLiveDev() {
        return process.env.RUNTIME_MODE === "live-dev";
      },
      get isOfflineDev() {
        return process.env.RUNTIME_MODE === "offline-dev";
      },
      get isTest() {
        return process.env.RUNTIME_MODE === "test";
      },
      get connectToServices() {
        return (
          process.env.RUNTIME_MODE === "production" ||
          process.env.RUNTIME_MODE === "live-dev"
        );
      },
      get treatServiceErrorsAsReal() {
        return (
          process.env.RUNTIME_MODE === "production" ||
          process.env.RUNTIME_MODE === "live-dev"
        );
      },
      get previewFeatures() {
        return process.env.ENABLE_PREVIEW_FEATURES === "true";
      },
    },
  };
});

describe("EmailStatusIndicatorWithStatus", () => {
  beforeEach(() => {
    // Reset modules to ensure env object is recreated with new env vars
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

  it("shows offline-dev message in offline-dev mode", () => {
    vi.stubEnv("RUNTIME_MODE", "offline-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    fireEvent.mouseEnter(indicator);

    expect(screen.getByText(/offline dev mode/)).toBeInTheDocument();
  });

  it("shows development message in live-dev mode", () => {
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    fireEvent.mouseEnter(indicator);

    expect(screen.getByText(/SMTP environment variables/)).toBeInTheDocument();
  });

  it("shows production message in production mode", () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    fireEvent.mouseEnter(indicator);

    // In production, the message indicates service is unavailable
    expect(
      screen.getByText(/Email service is currently unavailable/)
    ).toBeInTheDocument();
  });

  it("has cursor-help class for accessibility", () => {
    render(<EmailStatusIndicatorWithStatus emailServiceAvailable={false} />);
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveClass("cursor-help");
  });
});
