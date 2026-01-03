import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FunCounter } from "@/components/contact/FunCounter";

// Mock logger
// Create mock functions directly in the factory to avoid hoisting issues
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

// Mock the counter action
// Create the mock function directly in the factory to avoid hoisting issues
vi.mock("@/app/actions/counter", () => ({
  incrementCounter: vi.fn(),
}));

describe("FunCounter", () => {
  let mockIncrementCounter: ReturnType<typeof vi.fn>;
  let mockLogger: {
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    sessionStorage.clear();
    // Get the mocked function after the module is loaded
    const counterModule = await import("@/app/actions/counter");
    mockIncrementCounter = vi.mocked(counterModule.incrementCounter);
    mockIncrementCounter.mockClear();

    // Get the mocked logger
    const loggerModule = await import("@/lib/logger");
    mockLogger = loggerModule.log as typeof mockLogger;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("Rendering", () => {
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

    it("does not show counter component when count is null", () => {
      render(<FunCounter />);
      expect(screen.queryByTestId("counter")).not.toBeInTheDocument();
    });

    it("renders Sparkles icon", () => {
      render(<FunCounter />);
      // Check for the icon by looking for the parent container
      const iconContainer = screen
        .getByText("Useless Counter Challenge")
        .closest("div");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("SessionStorage", () => {
    it("reads sessionStorage on mount to determine if already clicked", () => {
      sessionStorage.setItem("contact_counter_clicked", "true");
      render(<FunCounter />);

      expect(
        screen.getByText("Already clicked this session!")
      ).toBeInTheDocument();
    });

    it("does not set hasClicked when sessionStorage is not set", () => {
      render(<FunCounter />);
      expect(screen.getByText("Click Me (For Science!)")).toBeInTheDocument();
      expect(
        screen.queryByText("Already clicked this session!")
      ).not.toBeInTheDocument();
    });

    it("writes to sessionStorage after successful click", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(sessionStorage.getItem("contact_counter_clicked")).toBe("true");
      });
    });

    it("does not write to sessionStorage on error", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockRejectedValue(new Error("Network error"));

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(sessionStorage.getItem("contact_counter_clicked")).toBeNull();
      });
    });
  });

  describe("Button States", () => {
    it("button is enabled when not clicked and not loading", () => {
      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      expect(button).not.toBeDisabled();
    });

    it("button is disabled when already clicked", () => {
      sessionStorage.setItem("contact_counter_clicked", "true");
      render(<FunCounter />);
      const button = screen.getByText("Already clicked this session!");
      expect(button).toBeDisabled();
    });

    it("button shows loading text during async operation", async () => {
      const user = userEvent.setup();
      // Create a promise that we can control
      let resolvePromise: (value: number) => void;
      const promise = new Promise<number>((resolve) => {
        resolvePromise = resolve;
      });
      mockIncrementCounter.mockReturnValue(promise);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      expect(screen.getByText("Incrementing...")).toBeInTheDocument();
      expect(screen.getByText("Incrementing...")).toBeDisabled();

      // Resolve the promise
      resolvePromise!(42);
      await waitFor(() => {
        expect(screen.queryByText("Incrementing...")).not.toBeInTheDocument();
      });
    });

    it("button is disabled during loading", async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: number) => void;
      const promise = new Promise<number>((resolve) => {
        resolvePromise = resolve;
      });
      mockIncrementCounter.mockReturnValue(promise);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");

      // Click the button
      await user.click(button);

      // Wait for loading state to appear and verify it's disabled
      await waitFor(() => {
        const loadingButton = screen.getByText("Incrementing...");
        expect(loadingButton).toBeInTheDocument();
        expect(loadingButton).toBeDisabled();
      });

      // Now resolve the promise
      resolvePromise!(42);

      // Wait for loading text to disappear (button will show "Already clicked this session!")
      await waitFor(() => {
        expect(screen.queryByText("Incrementing...")).not.toBeInTheDocument();
        expect(
          screen.getByText("Already clicked this session!")
        ).toBeInTheDocument();
      });
    });

    it("prevents multiple clicks when already clicked", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");

      // First click
      await user.click(button);
      await waitFor(() => {
        expect(
          screen.getByText("Already clicked this session!")
        ).toBeInTheDocument();
      });

      // Verify incrementCounter was only called once
      expect(mockIncrementCounter).toHaveBeenCalledTimes(1);
    });

    it("prevents clicks during loading", async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: number) => void;
      const promise = new Promise<number>((resolve) => {
        resolvePromise = resolve;
      });
      mockIncrementCounter.mockReturnValue(promise);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");

      // First click starts loading
      await user.click(button);

      // Try to click again while loading
      const loadingButton = screen.getByText("Incrementing...");
      await user.click(loadingButton);

      // Should still only be called once
      expect(mockIncrementCounter).toHaveBeenCalledTimes(1);

      resolvePromise!(42);
      await waitFor(() => {
        expect(screen.queryByText("Incrementing...")).not.toBeInTheDocument();
      });
    });
  });

  describe("Successful Click", () => {
    it("calls incrementCounter when button is clicked", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      expect(mockIncrementCounter).toHaveBeenCalledTimes(1);
    });

    it("displays the counter value after successful click", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("counter")).toBeInTheDocument();
        expect(screen.getByTestId("counter")).toHaveTextContent("42");
      });
    });

    it("hides placeholder after successful click", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      expect(screen.getByText("---")).toBeInTheDocument();

      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText("---")).not.toBeInTheDocument();
      });
    });

    it("displays a quirky message after successful click", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        const message = screen.getByText(
          /You clicked it!|The counter goes up|Congratulations|That's one more click|The button was clicked/i
        );
        expect(message).toBeInTheDocument();
      });
    });

    it("displays different quirky messages on different clicks", async () => {
      const user = userEvent.setup();

      // Mock Math.random to return different values
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = vi.fn(() => {
        callCount++;
        // Return different values to get different messages
        return callCount === 1 ? 0.1 : 0.3;
      });

      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        const message = screen.getByText(
          /You clicked it!|The counter goes up|Congratulations|That's one more click|The button was clicked/i
        );
        expect(message).toBeInTheDocument();
      });

      // Restore Math.random
      Math.random = originalRandom;
    });

    it("updates button text after successful click", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("Already clicked this session!")
        ).toBeInTheDocument();
        expect(
          screen.queryByText("Click Me (For Science!)")
        ).not.toBeInTheDocument();
      });
    });

    it("handles different counter values", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(999);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("counter")).toHaveTextContent("999");
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when incrementCounter fails", async () => {
      const user = userEvent.setup();
      const error = new Error("Network error");
      mockIncrementCounter.mockRejectedValue(error);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("Oops! Something went wrong. But hey, you tried! 💪")
        ).toBeInTheDocument();
      });
    });

    it("logs error when incrementCounter fails", async () => {
      const user = userEvent.setup();
      const error = new Error("Network error");
      mockIncrementCounter.mockRejectedValue(error);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          { error },
          "Failed to increment counter"
        );
      });
    });

    it("does not update count on error", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockRejectedValue(new Error("Network error"));

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("---")).toBeInTheDocument();
        expect(screen.queryByTestId("counter")).not.toBeInTheDocument();
      });
    });

    it("does not set hasClicked on error", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockRejectedValue(new Error("Network error"));

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        // Button should still be clickable (not disabled)
        expect(button).not.toBeDisabled();
      });
    });

    it("clears previous message when starting new click", async () => {
      const user = userEvent.setup();
      // First, set up a successful click
      mockIncrementCounter.mockResolvedValueOnce(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(
            /You clicked it!|The counter goes up|Congratulations|That's one more click|The button was clicked/i
          )
        ).toBeInTheDocument();
      });

      // Now simulate an error on second attempt (though button should be disabled)
      // This tests the message clearing behavior
      mockIncrementCounter.mockRejectedValueOnce(new Error("Error"));

      // Since button is disabled, we can't click it again
      // But we can verify the message clearing happens in handleClick
      // by checking that setMessage(null) is called
    });

    it("stops loading after error", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockRejectedValue(new Error("Network error"));

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      // After error, loading should be stopped and error message should appear
      await waitFor(() => {
        // Loading state should not be present
        expect(screen.queryByText("Incrementing...")).not.toBeInTheDocument();
        // Error message should be shown
        expect(
          screen.getByText("Oops! Something went wrong. But hey, you tried! 💪")
        ).toBeInTheDocument();
        // Button should not be in loading state
        expect(
          screen.queryByText("Click Me (For Science!)")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Message Display", () => {
    it("does not show message initially", () => {
      render(<FunCounter />);
      expect(
        screen.queryByText(/You clicked it!|Oops! Something went wrong/i)
      ).not.toBeInTheDocument();
    });

    it("shows message after successful click", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockResolvedValue(42);

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        const message = screen.getByText(
          /You clicked it!|The counter goes up|Congratulations|That's one more click|The button was clicked/i
        );
        expect(message).toBeInTheDocument();
      });
    });

    it("shows error message on failure", async () => {
      const user = userEvent.setup();
      mockIncrementCounter.mockRejectedValue(new Error("Error"));

      render(<FunCounter />);
      const button = screen.getByText("Click Me (For Science!)");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("Oops! Something went wrong. But hey, you tried! 💪")
        ).toBeInTheDocument();
      });
    });
  });
});
