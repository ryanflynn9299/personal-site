/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Counter from "@/components/primitives/misc/Counter";

// Mock framer-motion to avoid animation issues in tests
vi.mock("motion/react", () => ({
  motion: {
    span: ({ children, style, ...props }: any) => (
      <span style={style} {...props}>
        {children}
      </span>
    ),
  },
  useSpring: (value: number) => ({ get: () => value, set: vi.fn() }),
  useTransform: (_mv: any, fn: (v: number) => number) => {
    return fn(0);
  },
}));

describe("Counter", () => {
  it("renders with default props", () => {
    const { container } = render(<Counter value={123} />);
    expect(container).toBeInTheDocument();
  });

  it("renders with custom value", () => {
    const { container } = render(<Counter value={4567} />);
    expect(container).toBeInTheDocument();
  });

  it("renders with custom places", () => {
    const { container } = render(<Counter value={123} places={[100, 10, 1]} />);
    expect(container).toBeInTheDocument();
  });

  it("renders with custom fontSize", () => {
    const { container } = render(<Counter value={123} fontSize={48} />);
    expect(container).toBeInTheDocument();
  });

  it("renders with custom textColor", () => {
    const { container } = render(<Counter value={123} textColor="#ff0000" />);
    expect(container).toBeInTheDocument();
  });

  it("renders with custom styles", () => {
    const { container } = render(
      <Counter
        value={123}
        containerStyle={{ margin: "10px" }}
        counterStyle={{ padding: "5px" }}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it("renders with zero value", () => {
    const { container } = render(<Counter value={0} />);
    expect(container).toBeInTheDocument();
  });

  it("renders with large value", () => {
    const { container } = render(<Counter value={99999} />);
    expect(container).toBeInTheDocument();
  });
});
