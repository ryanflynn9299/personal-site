import { vi } from "vitest";
import type { RuntimeMode } from "@/lib/config";

const PLACEHOLDER_PATTERNS = [
  "your-",
  "example.com",
  "DISABLED",
  "ps-directus:8055",
  "localhost:8055",
];

function isServiceUrlConfigured(url: string | undefined): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  return !PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

/**
 * Shared Vitest mock for `@/lib/config` with env-driven getters.
 * Use inside `vi.mock("@/lib/config", async () => createDynamicConfigMock())`.
 */
export async function createDynamicConfigMock() {
  const actual =
    await vi.importActual<typeof import("@/lib/config")>("@/lib/config");

  const mockedConfig = {
    ...actual.config,
    get directus() {
      return {
        publicUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
      };
    },
    get runtimeMode() {
      return (
        (process.env.RUNTIME_MODE as RuntimeMode | undefined) ||
        actual.config.runtimeMode
      );
    },
    get contactEmail() {
      return process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    },
  };

  const mockedRuntime = {
    get mode() {
      return process.env.RUNTIME_MODE || "offline-dev";
    },
    get isProduction() {
      return process.env.RUNTIME_MODE === "production";
    },
    get isDevelopment() {
      return (
        process.env.RUNTIME_MODE === "live-dev" ||
        process.env.RUNTIME_MODE === "offline-dev"
      );
    },
    get isLiveDev() {
      return process.env.RUNTIME_MODE === "live-dev";
    },
    get isOfflineDev() {
      return process.env.RUNTIME_MODE === "offline-dev";
    },
    get isTest() {
      return process.env.RUNTIME_MODE === "test";
    },
    get connectToServices() {
      return (
        process.env.RUNTIME_MODE === "production" ||
        process.env.RUNTIME_MODE === "live-dev"
      );
    },
    get treatServiceErrorsAsReal() {
      return (
        process.env.RUNTIME_MODE === "production" ||
        process.env.RUNTIME_MODE === "live-dev"
      );
    },
    get previewFeatures() {
      return process.env.ENABLE_PREVIEW_FEATURES === "true";
    },
  };

  return {
    ...actual,
    config: mockedConfig,
    runtime: mockedRuntime,
    isServiceUrlConfigured,
    isDirectusConfigured: () => {
      if (!mockedRuntime.connectToServices) {
        return false;
      }
      return isServiceUrlConfigured(mockedConfig.directus.publicUrl);
    },
  };
}

/**
 * Shared Vitest mock for `@/lib/config/server` with env-driven SMTP getters.
 */
export async function createDynamicServerConfigMock() {
  const actual = await vi.importActual<typeof import("@/lib/config/server")>(
    "@/lib/config/server"
  );

  return {
    ...actual,
    serverConfig: {
      ...actual.serverConfig,
      get smtp() {
        return {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          from: process.env.SMTP_FROM,
          to: process.env.SMTP_TO,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        };
      },
    },
  };
}
