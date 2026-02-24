/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FunCounter } from "@/components/contact/FunCounter";

import { shouldShowDevIndicator } from "@/lib/features";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock Counter component
vi.mock("@/components/primitives/misc/Counter", () => ({
  default: ({ value }: { value: number }) => (
    <div data-testid="counter">{value}</div>
  ),
}));

// Mock the counter action to avoid async complexity
vi.mock("@/app/actions/counter", () => ({
  incrementCounter: vi.fn(),
}));

// Mock feature flags
vi.mock("@/lib/features", () => ({
  isFeatureEnabled: vi.fn(() => true),
  shouldShowDevIndicator: vi.fn(() => false),
}));

describe("FunCounter", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset mocks
    (shouldShowDevIndicator as any).mockReturnValue(false);
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the component with title and description", () => {
    render(<FunCounter />);
    expect(screen.getByText("Useless Counter Challenge")).toBeInTheDocument();
    expect(
      screen.getByText(/Click the button below to increment a counter/i)
    ).toBeInTheDocument();
  });

  it("renders the click button", () => {
    render(<FunCounter />);
    expect(screen.getByText("Click Me (For Science!)")).toBeInTheDocument();
  });

  it("shows placeholder when count is null", () => {
    render(<FunCounter />);
    expect(screen.getByText("---")).toBeInTheDocument();
  });

  it("reads sessionStorage on mount to determine if already clicked", () => {
    sessionStorage.setItem("contact_counter_clicked", "true");
    render(<FunCounter />);

    expect(
      screen.getByText("Already clicked this session!")
    ).toBeInTheDocument();
  });

  it("shows DEV badge when enabled", () => {
    // Override mock to show dev indicator
    (shouldShowDevIndicator as any).mockReturnValue(true);

    render(<FunCounter />);
    expect(screen.getByText("DEV")).toBeInTheDocument();
  });
});
