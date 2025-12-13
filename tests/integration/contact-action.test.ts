import { describe, it, expect, beforeEach, vi } from 'vitest';
import { submitContactForm } from '@/app/actions/contact';
import * as emailService from '@/lib/email-service';

// Mock the email service module
vi.mock('@/lib/email-service', () => ({
  isEmailServiceConfigured: vi.fn(),
}));

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV to test
    process.env.NODE_ENV = 'test';
  });

  it('validates that all fields are required', async () => {
    const formData = new FormData();
    formData.set('name', '');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('validates email format', async () => {
    const formData = new FormData();
    formData.set('name', 'John Doe');
    formData.set('email', 'invalid-email');
    formData.set('message', 'Hello world');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('accepts valid email formats', async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    const formData = new FormData();
    formData.set('name', 'John Doe');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello world');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
  });

  it('handles missing email service in development', async () => {
    process.env.NODE_ENV = 'development';
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);

    const formData = new FormData();
    formData.set('name', 'John Doe');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello world');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.message).toContain('Email service is not configured');
  });

  it('handles missing email service in production', async () => {
    process.env.NODE_ENV = 'production';
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);

    const formData = new FormData();
    formData.set('name', 'John Doe');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello world');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.message).toContain('Email service is currently unavailable');
  });

  it('returns success when email service is configured', async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    const formData = new FormData();
    formData.set('name', 'John Doe');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello world');

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.message).toContain('Thank you');
  });

  it('handles various valid email formats', async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    const validEmails = [
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.co.uk',
      'user_name@example-domain.com',
    ];

    for (const email of validEmails) {
      const formData = new FormData();
      formData.set('name', 'Test User');
      formData.set('email', email);
      formData.set('message', 'Test message');

      const result = await submitContactForm(formData);
      expect(result.success).toBe(true);
    }
  });
});

