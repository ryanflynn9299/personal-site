/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "@/components/primitives/Toast";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("Toast", () => {
  const defaultProps = {
    id: 1,
    type: "success" as const,
    title: "Test Title",
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders toast with title", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders toast with message when provided", () => {
    render(<Toast {...defaultProps} message="Test message" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders success icon for success type", () => {
    render(<Toast {...defaultProps} type="success" />);
    // Check for the success icon (CheckCircle from lucide-react)
    const icon = document.querySelector(".text-green-400");
    expect(icon).toBeInTheDocument();
  });

  it("renders error icon for error type", () => {
    render(<Toast {...defaultProps} type="error" />);
    const icon = document.querySelector(".text-red-400");
    expect(icon).toBeInTheDocument();
  });

  it("renders info icon for info type", () => {
    render(<Toast {...defaultProps} type="info" />);
    const icon = document.querySelector(".text-sky-400");
    expect(icon).toBeInTheDocument();
  });

  it("calls onDismiss after default duration (5000ms)", () => {
    render(<Toast {...defaultProps} />);

    expect(defaultProps.onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(defaultProps.onDismiss).toHaveBeenCalledWith(1);
  });

  it("calls onDismiss after custom duration", () => {
    render(<Toast {...defaultProps} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(defaultProps.onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(defaultProps.onDismiss).toHaveBeenCalledWith(1);
  });

  it("calls onDismiss when close button is clicked", async () => {
    vi.useRealTimers(); // Need real timers for user interaction
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole("button");
    await user.click(closeButton);

    expect(onDismiss).toHaveBeenCalledWith(1);
  });

  it("clears timeout on unmount", () => {
    const { unmount } = render(<Toast {...defaultProps} />);

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // onDismiss should not be called after unmount
    expect(defaultProps.onDismiss).not.toHaveBeenCalled();
  });
});
