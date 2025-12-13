import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isEmailServiceConfigured } from '@/lib/email-service';

describe('isEmailServiceConfigured', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns false when no environment variables are set', () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_TO;

    expect(isEmailServiceConfigured()).toBe(false);
  });

  it('returns false when required variables are missing', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    // Missing SMTP_FROM and SMTP_TO

    expect(isEmailServiceConfigured()).toBe(false);
  });

  it('returns false when variables contain placeholder values', () => {
    process.env.SMTP_HOST = 'your-smtp-host';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_FROM = 'your-email@example.com';
    process.env.SMTP_TO = 'your-email@example.com';

    expect(isEmailServiceConfigured()).toBe(false);
  });

  it('returns false when port is invalid', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = 'invalid';
    process.env.SMTP_FROM = 'sender@example.com';
    process.env.SMTP_TO = 'recipient@example.com';

    expect(isEmailServiceConfigured()).toBe(false);
  });

  it('returns false when email addresses are invalid', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_FROM = 'not-an-email';
    process.env.SMTP_TO = 'also-not-an-email';

    expect(isEmailServiceConfigured()).toBe(false);
  });

  it('returns true when all required variables are properly configured', () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_FROM = 'sender@example.com';
    process.env.SMTP_TO = 'recipient@example.com';

    expect(isEmailServiceConfigured()).toBe(true);
  });

  it('returns true even without optional authentication variables', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_FROM = 'sender@example.com';
    process.env.SMTP_TO = 'recipient@example.com';
    // SMTP_USER and SMTP_PASS are optional

    expect(isEmailServiceConfigured()).toBe(true);
  });
});

