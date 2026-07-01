import { vi } from "vitest";

export function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

export const mockLogger = createMockLogger();

export const loggerModuleMock = {
  createLogger: vi.fn(() => mockLogger),
  log: mockLogger,
  prodLog: mockLogger,
  devLog: mockLogger,
  default: mockLogger,
};
