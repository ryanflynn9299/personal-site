import { createLogger } from "../../lib/dev-tooling/logger";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the config module
vi.mock("../../lib/config", () => {
  return {
    config: {
      logPrettyPrint: false,
      directus: { publicUrl: undefined },
      matomo: { url: undefined, siteId: undefined, enabled: false },
      siteUrl: "http://localhost:3000",
      runtimeMode: "offline-dev",
      previewFeatures: false,
    },
    runtime: {
      isProduction: false,
      isDevelopment: false,
      isLiveDev: false,
      isOfflineDev: true,
      isTest: false,
      connectToServices: false,
      treatServiceErrorsAsReal: false,
      previewFeatures: false,
      mode: "offline-dev",
    },
  };
});

describe("Logger", () => {
  let mockRuntime: {
    isProduction: boolean;
    isDevelopment: boolean;
    previewFeatures: boolean;
    mode: string;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRuntime = (await import("../../lib/config"))
      .runtime as typeof mockRuntime;
  });

  // Helper accurately detects empty functions output by ESBuild
  const isNoOp = (fn: unknown) =>
    typeof fn === "function" && fn.toString().length < 30;

  describe("createLogger", () => {
    describe("ALL context", () => {
      it("should always return a functional logger", () => {
        const logger = createLogger("ALL");
        expect(isNoOp(logger.info)).toBe(false);
      });
    });

    describe("PRODUCTION context", () => {
      it("should return a no-op logger if NOT in production", () => {
        mockRuntime.isProduction = false;
        const logger = createLogger("PRODUCTION");
        expect(isNoOp(logger.info)).toBe(true);
      });

      it("should return an active logger if IN production", () => {
        mockRuntime.isProduction = true;
        const logger = createLogger("PRODUCTION");
        expect(isNoOp(logger.info)).toBe(false);
      });
    });

    describe("DEV context", () => {
      it("should return a no-op logger if NOT in development", () => {
        mockRuntime.isDevelopment = false;
        mockRuntime.previewFeatures = false;
        const logger = createLogger("DEV");
        expect(isNoOp(logger.info)).toBe(true);
      });

      it("should return an active logger if IN development", () => {
        mockRuntime.isDevelopment = true;
        const logger = createLogger("DEV");
        expect(isNoOp(logger.info)).toBe(false);
      });

      it("should return a no-op logger if devModeUI requirement is missed", () => {
        mockRuntime.isDevelopment = true;
        mockRuntime.previewFeatures = false;
        const logger = createLogger("DEV", { devModeUI: true });
        expect(isNoOp(logger.info)).toBe(true);
      });

      it("should return an active logger if devModeUI requirement is met", () => {
        mockRuntime.isDevelopment = true;
        mockRuntime.previewFeatures = true;
        const logger = createLogger("DEV", { devModeUI: true });
        expect(isNoOp(logger.info)).toBe(false);
      });
    });
  });
});
