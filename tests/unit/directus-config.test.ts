import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isDirectusConfigured } from '@/lib/directus';

describe('isDirectusConfigured', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns false when no environment variables are set', () => {
    delete process.env.DIRECTUS_URL_SERVER_SIDE;
    delete process.env.NEXT_PUBLIC_DIRECTUS_URL;

    expect(isDirectusConfigured()).toBe(false);
  });

  it('returns false when only one URL is set', () => {
    process.env.DIRECTUS_URL_SERVER_SIDE = 'http://directus:8055';
    delete process.env.NEXT_PUBLIC_DIRECTUS_URL;

    expect(isDirectusConfigured()).toBe(false);
  });

  it('returns false when URLs contain placeholder values', () => {
    process.env.DIRECTUS_URL_SERVER_SIDE = 'http://your-directus:8055';
    process.env.NEXT_PUBLIC_DIRECTUS_URL = 'http://your-directus:8055';

    expect(isDirectusConfigured()).toBe(false);
  });

  it('returns false when URLs are default placeholders', () => {
    process.env.DIRECTUS_URL_SERVER_SIDE = 'http://ps-directus:8055';
    process.env.NEXT_PUBLIC_DIRECTUS_URL = 'http://localhost:8055';

    expect(isDirectusConfigured()).toBe(false);
  });

  it('returns false when URLs are empty strings', () => {
    process.env.DIRECTUS_URL_SERVER_SIDE = '';
    process.env.NEXT_PUBLIC_DIRECTUS_URL = '';

    expect(isDirectusConfigured()).toBe(false);
  });

  it('returns true when both URLs are properly configured', () => {
    process.env.DIRECTUS_URL_SERVER_SIDE = 'http://directus:8055';
    process.env.NEXT_PUBLIC_DIRECTUS_URL = 'https://api.example.com';

    expect(isDirectusConfigured()).toBe(true);
  });

  it('handles URLs with different protocols', () => {
    process.env.DIRECTUS_URL_SERVER_SIDE = 'http://internal:8055';
    process.env.NEXT_PUBLIC_DIRECTUS_URL = 'https://public.example.com';

    expect(isDirectusConfigured()).toBe(true);
  });
});

