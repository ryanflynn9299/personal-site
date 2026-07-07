/**
 * Vitae timeline bullet twinkle — timing config.
 *
 * Production intervals are long and irregular so a flash is easy to miss.
 * Enable fast mode in dev controls (/vitae, preview features on) for ad-hoc testing.
 */
export const vitaeTwinkleConfig = {
  /** One twinkle animation length */
  durationMs: 420,

  /** Default: rare, almost subliminal */
  production: {
    intervalMinMs: 14_000,
    intervalMaxMs: 34_000,
  },

  /** Dev fast mode: frequent enough to verify without waiting */
  devFast: {
    intervalMinMs: 700,
    intervalMaxMs: 2_200,
  },
} as const;

export function getVitaeTwinkleDelayMs(fastMode: boolean): number {
  const { intervalMinMs, intervalMaxMs } = fastMode
    ? vitaeTwinkleConfig.devFast
    : vitaeTwinkleConfig.production;

  return intervalMinMs + Math.random() * (intervalMaxMs - intervalMinMs);
}
