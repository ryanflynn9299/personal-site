import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FunCounter } from "@/components/contact/FunCounter";

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

describe("FunCounter", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
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
});
