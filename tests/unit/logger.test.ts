import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock pino
const mockPinoLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

vi.mock("pino", () => {
  const createPino = vi.fn(() => mockPinoLogger);
  return {
    default: createPino,
  };
});

describe("logger.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Default to test mode
    vi.stubEnv("APP_MODE", "test");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("DEV_MODE_UI", "");
    vi.stubEnv("ENABLE_PINO_PRETTY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("createLogger", () => {
    describe("ALL context", () => {
      it("always logs in test mode", async () => {
        vi.stubEnv("APP_MODE", "test");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("ALL");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("test message");
      });

      it("always logs in production mode", async () => {
        vi.stubEnv("APP_MODE", "production");
        vi.stubEnv("NODE_ENV", "production");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("ALL");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("test message");
      });

      it("always logs in live-dev mode", async () => {
        vi.stubEnv("APP_MODE", "live-dev");
        vi.stubEnv("NODE_ENV", "development");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("ALL");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("test message");
      });

      it("always logs in offline-dev mode", async () => {
        vi.stubEnv("APP_MODE", "offline-dev");
        vi.stubEnv("NODE_ENV", "development");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("ALL");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("test message");
      });
    });

    describe("PRODUCTION context", () => {
      it("logs in production mode", async () => {
        vi.stubEnv("APP_MODE", "production");
        vi.stubEnv("NODE_ENV", "production");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("PRODUCTION");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith(
          "[PRODUCTION] test message"
        );
      });

      it("does not log in test mode", async () => {
        vi.stubEnv("APP_MODE", "test");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("PRODUCTION");

        logger.info("test message");
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
      });

      it("does not log in live-dev mode", async () => {
        vi.stubEnv("APP_MODE", "live-dev");
        vi.stubEnv("NODE_ENV", "development");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("PRODUCTION");

        logger.info("test message");
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
      });

      it("does not log in offline-dev mode", async () => {
        vi.stubEnv("APP_MODE", "offline-dev");
        vi.stubEnv("NODE_ENV", "development");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("PRODUCTION");

        logger.info("test message");
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
      });
    });

    describe("DEV context", () => {
      it("logs in live-dev mode", async () => {
        vi.stubEnv("APP_MODE", "live-dev");
        vi.stubEnv("NODE_ENV", "development");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("[DEV] test message");
      });

      it("logs in offline-dev mode", async () => {
        vi.stubEnv("APP_MODE", "offline-dev");
        vi.stubEnv("NODE_ENV", "development");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV");

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("[DEV] test message");
      });

      it("does not log in production mode", async () => {
        vi.stubEnv("APP_MODE", "production");
        vi.stubEnv("NODE_ENV", "production");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV");

        logger.info("test message");
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
      });

      it("does not log in test mode", async () => {
        vi.stubEnv("APP_MODE", "test");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV");

        logger.info("test message");
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
      });

      it("logs when devModeUI is enabled and required", async () => {
        vi.stubEnv("APP_MODE", "live-dev");
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("DEV_MODE_UI", "true");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV", { devModeUI: true });

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("[DEV] test message");
      });

      it("does not log when devModeUI is disabled but required", async () => {
        vi.stubEnv("APP_MODE", "live-dev");
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("DEV_MODE_UI", "false");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV", { devModeUI: true });

        logger.info("test message");
        expect(mockPinoLogger.info).not.toHaveBeenCalled();
      });

      it("logs in dev mode even when devModeUI is disabled if not required", async () => {
        vi.stubEnv("APP_MODE", "live-dev");
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("DEV_MODE_UI", "false");
        const { createLogger } = await import("@/lib/logger");
        const logger = createLogger("DEV", { devModeUI: false });

        logger.info("test message");
        expect(mockPinoLogger.info).toHaveBeenCalledWith("[DEV] test message");
      });
    });
  });

  describe("logger methods", () => {
    beforeEach(async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
    });

    it("info logs with string message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      logger.info("test message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith("test message");
    });

    it("info logs with object and message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = { key: "value" };
      logger.info(obj, "test message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith(obj, "test message");
    });

    it("info logs with object only", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = { key: "value" };
      logger.info(obj);
      expect(mockPinoLogger.info).toHaveBeenCalledWith(obj);
    });

    it("error logs with string message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      logger.error("error message");
      expect(mockPinoLogger.error).toHaveBeenCalledWith("error message");
    });

    it("error logs with object and message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = { error: "something went wrong" };
      logger.error(obj, "error message");
      expect(mockPinoLogger.error).toHaveBeenCalledWith(obj, "error message");
    });

    it("warn logs with string message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      logger.warn("warning message");
      expect(mockPinoLogger.warn).toHaveBeenCalledWith("warning message");
    });

    it("warn logs with object and message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = { warning: "something" };
      logger.warn(obj, "warning message");
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(obj, "warning message");
    });

    it("debug logs with string message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      logger.debug("debug message");
      expect(mockPinoLogger.debug).toHaveBeenCalledWith("debug message");
    });

    it("debug logs with object and message", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = { debug: "info" };
      logger.debug(obj, "debug message");
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(obj, "debug message");
    });

    it("formats PRODUCTION context messages with prefix", async () => {
      vi.stubEnv("APP_MODE", "production");
      vi.stubEnv("NODE_ENV", "production");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("PRODUCTION");

      logger.info("test message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        "[PRODUCTION] test message"
      );
    });

    it("formats DEV context messages with prefix", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("DEV");

      logger.info("test message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith("[DEV] test message");
    });

    it("does not add prefix for ALL context", async () => {
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      logger.info("test message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith("test message");
    });
  });

  describe("no-op behavior", () => {
    it("returns no-op functions when PRODUCTION logger is in dev mode", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("PRODUCTION");

      // These should be no-ops and not throw
      logger.info("test");
      logger.error("test");
      logger.warn("test");
      logger.debug("test");

      expect(mockPinoLogger.info).not.toHaveBeenCalled();
      expect(mockPinoLogger.error).not.toHaveBeenCalled();
      expect(mockPinoLogger.warn).not.toHaveBeenCalled();
      expect(mockPinoLogger.debug).not.toHaveBeenCalled();
    });

    it("returns no-op functions when DEV logger is in production mode", async () => {
      vi.stubEnv("APP_MODE", "production");
      vi.stubEnv("NODE_ENV", "production");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("DEV");

      // These should be no-ops and not throw
      logger.info("test");
      logger.error("test");
      logger.warn("test");
      logger.debug("test");

      expect(mockPinoLogger.info).not.toHaveBeenCalled();
      expect(mockPinoLogger.error).not.toHaveBeenCalled();
      expect(mockPinoLogger.warn).not.toHaveBeenCalled();
      expect(mockPinoLogger.debug).not.toHaveBeenCalled();
    });

    it("returns no-op functions when DEV logger requires devModeUI but it's disabled", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DEV_MODE_UI", "false");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("DEV", { devModeUI: true });

      // These should be no-ops and not throw
      logger.info("test");
      logger.error("test");
      logger.warn("test");
      logger.debug("test");

      expect(mockPinoLogger.info).not.toHaveBeenCalled();
      expect(mockPinoLogger.error).not.toHaveBeenCalled();
      expect(mockPinoLogger.warn).not.toHaveBeenCalled();
      expect(mockPinoLogger.debug).not.toHaveBeenCalled();
    });
  });

  describe("convenience exports", () => {
    it("exports default log logger", async () => {
      const log = await import("@/lib/logger");
      expect(log.default).toBeDefined();
      expect(typeof log.default.info).toBe("function");
    });

    it("exports log logger", async () => {
      const { log } = await import("@/lib/logger");
      expect(log).toBeDefined();
      expect(typeof log.info).toBe("function");
    });

    it("exports prodLog logger", async () => {
      const { prodLog } = await import("@/lib/logger");
      expect(prodLog).toBeDefined();
      expect(typeof prodLog.info).toBe("function");
    });

    it("exports devLog logger", async () => {
      const { devLog } = await import("@/lib/logger");
      expect(devLog).toBeDefined();
      expect(typeof devLog.info).toBe("function");
    });
  });

  describe("edge cases", () => {
    it("handles empty string messages", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      logger.info("");
      expect(mockPinoLogger.info).toHaveBeenCalledWith("");
    });

    it("handles null and undefined in object", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = { key: null, other: undefined };
      logger.info(obj, "message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith(obj, "message");
    });

    it("handles complex nested objects", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { createLogger } = await import("@/lib/logger");
      const logger = createLogger("ALL");

      const obj = {
        nested: {
          deep: {
            value: "test",
          },
        },
        array: [1, 2, 3],
      };
      logger.info(obj, "message");
      expect(mockPinoLogger.info).toHaveBeenCalledWith(obj, "message");
    });
  });
});
