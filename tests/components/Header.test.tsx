import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/common/Header";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  it("renders primary navigation links on desktop", () => {
    render(<Header />);

    expect(screen.getByTestId("nav-link-home")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-about")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-blog")).toBeInTheDocument();
    expect(screen.getByTestId("nav-link-contact")).toBeInTheDocument();
  });

  it("toggles the mobile menu and exposes aria state", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggle = screen.getByTestId("mobile-menu-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("mobile-nav-link-blog")).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
