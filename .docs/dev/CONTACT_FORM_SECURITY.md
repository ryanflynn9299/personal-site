# Contact Form Security

The contact form uses server-side protections against spam and abuse. Client-side validation alone is not sufficient.

## Implemented Protections

### 1. Honeypot field

- **Field name:** `website` (constant: `CONTACT_HONEYPOT_FIELD`)
- **Behavior:** Hidden off-screen in `ContactPageClient.tsx`. Legitimate users never see or fill it.
- **Bot detection:** If the field contains any value, the submission is rejected silently — the server returns a fake success message so bots cannot learn the honeypot name.
- **Implementation:** `lib/services/contact-protection.ts` → `isHoneypotTriggered()`

### 2. Rate limiting

- **Limit:** 5 submissions per IP per 15 minutes
- **Scope:** In-memory per server process (same pattern as `/api/health`)
- **Response:** `"Too many messages sent recently. Please try again later."`
- **IP resolution:** `x-forwarded-for` (first hop) or `x-real-ip` via `lib/services/client-ip.ts`
- **Implementation:** `lib/services/contact-protection.ts` → `checkContactRateLimit()`

### 3. Server-side validation

- Required fields, email format check, trimmed inputs
- Length limits enforced server-side (name 100, email 254, message 5000 —
  constants in `lib/constants/contact.ts`, mirrored as `maxLength` in the UI)
- HTML escaping for email body content (`escapeHtml` in `app/actions/contact.ts`)

### 4. Mode-aware behavior

- **offline-dev:** No external services called; informational dev message
- **production / live-dev:** Requires Directus storage and/or SMTP (see SMTP todo)

## Configuration

No env vars required for honeypot or rate limiting — they are always active in production modes.

Ensure your reverse proxy (Nginx Proxy Manager, Cloudflare, etc.) forwards:

```
X-Forwarded-For: <client-ip>
X-Real-IP: <client-ip>
```

Without these headers, rate limiting falls back to `"unknown"` and rejects submissions conservatively.

## Future Improvements (not yet implemented)

- [ ] Redis-backed rate limiting for multi-instance deployments
- [ ] reCAPTCHA v3 if honeypot + rate limit prove insufficient
- [ ] Real SMTP delivery (see [EMAIL.md](./EMAIL.md))

## Testing

```bash
pnpm run test tests/unit/contact-protection.test.ts
pnpm run test tests/integration/contact-action.test.ts
```

## Related Files

| File                                       | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `app/actions/contact.ts`                   | Server action orchestration      |
| `components/contact/ContactPageClient.tsx` | Honeypot markup                  |
| `lib/services/contact-protection.ts`       | Honeypot + rate limit logic      |
| `lib/services/client-ip.ts`                | IP extraction for server actions |
| `lib/constants/contact.ts`                 | Honeypot field + length limits   |
