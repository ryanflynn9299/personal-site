import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpaceThemedStatusPage } from "@/components/common/SpaceThemedStatusPage";
import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";

describe("SpaceThemedStatusPage", () => {
  it("renders code, title, description, and actions", () => {
    render(
      <SpaceThemedStatusPage
        code="404"
        title="You're lost in space"
        description="Bad URL copy"
        actions={[{ label: "Go home", href: "/" }]}
      />
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "You're lost in space" })
    ).toBeInTheDocument();
    expect(screen.getByText("Bad URL copy")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});

describe("UnderConstructionPage", () => {
  it("renders construction messaging", () => {
    render(<UnderConstructionPage />);

    expect(
      screen.getByRole("heading", { name: "Pardon our galactic dust" })
    ).toBeInTheDocument();
    expect(screen.getByText(/under construction/i)).toBeInTheDocument();
  });
});
