import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { incrementCounter } from "@/app/actions/counter";

vi.mock("@/lib/services/directus", () => ({
  incrementCounterByKey: vi.fn(),
  FUN_COUNTER_KEY: "contact-fun-counter",
}));

describe("incrementCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns success with value when Directus increments", async () => {
    const { incrementCounterByKey } = await import("@/lib/services/directus");
    vi.mocked(incrementCounterByKey).mockResolvedValueOnce({
      status: "success",
      counter: {
        id: "1",
        key: "contact-fun-counter",
        value: 42,
        metadata: null,
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    });

    const result = await incrementCounter();
    expect(result).toEqual({ status: "success", value: 42 });
  });

  it("returns error with null value when Directus is unavailable", async () => {
    const { incrementCounterByKey } = await import("@/lib/services/directus");
    vi.mocked(incrementCounterByKey).mockResolvedValueOnce({
      status: "error",
      counter: null,
    });

    const result = await incrementCounter();
    expect(result).toEqual({ status: "error", value: null });
  });

  it("returns error when increment succeeds but counter row is missing", async () => {
    const { incrementCounterByKey } = await import("@/lib/services/directus");
    vi.mocked(incrementCounterByKey).mockResolvedValueOnce({
      status: "success",
      counter: null,
    });

    const result = await incrementCounter();
    expect(result).toEqual({ status: "error", value: null });
  });
});
