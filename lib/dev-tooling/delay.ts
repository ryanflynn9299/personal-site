/**
 * Utility function for introducing delays in async operations.
 *
 * This function is designed to be easily mockable in tests.
 * In test environments, the delay is automatically skipped to speed up tests.
 *
 * @param ms - The number of milliseconds to delay (default: 500)
 * @returns A promise that resolves after the specified delay
 *
 * @example
 * ```typescript
 * // In production/development
 * await delay(500); // Waits 500ms
 *
 * // In tests (automatically skipped)
 * await delay(500); // Resolves immediately
 *
 * // Mock in tests if needed
 * vi.mock('@/lib/delay', () => ({
 *   delay: vi.fn().mockResolvedValue(undefined),
 * }));
 * ```
 */
export async function delay(ms: number = 500): Promise<void> {
  // Skip delay in test environment to speed up tests
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}
