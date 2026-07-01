# SMTP / Email Launch Checklist

Contact form stores submissions in Directus when configured. Email delivery is **not yet implemented** — production/live-dev refuse mock sends and surface honest UI instead.

## Before launch — required (code)

Stop lying to users when email cannot be sent.

- [x] **Show warning when SMTP unavailable** — if email cannot be sent in production/live-dev, surface honest UI (amber warning + direct email link), never `emailSent: true` from mock path
- [x] If Directus stored the message, tell the user it was received even when email failed
- [x] If neither Directus nor email succeeded, show error (already partially implemented)
- [x] Add/update tests for: SMTP configured but mock send, Directus-only success, full failure

**Target files:** `lib/services/email-service.ts`, `app/actions/contact.ts`, `components/contact/ContactPageClient.tsx`

## After launch — real SMTP

- [ ] Choose provider: self-hosted Postfix (see [SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md)) or transactional API (Resend, etc.)
- [ ] Add dependency (`nodemailer` or provider SDK) to `package.json`
- [ ] Implement real send in `lib/services/email-service.ts`
- [ ] Configure production `.env`:
  ```bash
  SMTP_HOST=mail.yourdomain.com
  SMTP_PORT=587
  SMTP_FROM=contact@ryanflynn.org
  SMTP_TO=ryan.flynn001@gmail.com
  SMTP_USER=...    # if auth required
  SMTP_PASS=...    # if auth required
  ```
- [ ] Verify SPF, DKIM, DMARC for sending domain
- [ ] Test end-to-end: submit contact form → email arrives in inbox (not spam)

## Current Behavior

| Mode        | SMTP configured | Directus | Result today                          |
| ----------- | --------------- | -------- | ------------------------------------- |
| offline-dev | N/A             | —        | Dev message, no services              |
| production  | No              | No       | Error                                 |
| production  | No              | Yes      | Success (stored only) — **OK**        |
| production  | Yes (mock)      | Any      | Warning UI — email not sent (`messageStored` when Directus ok) |
| production  | Yes (real)      | Any      | Email sent (post-launch goal)         |

## Launch workaround (until real SMTP)

1. Ensure Directus `contact_messages` collection exists and is wired
2. Monitor submissions via Directus admin
3. Do **not** set SMTP env vars until real sending works **or** warning UI is shipped
4. Ship the **SMTP unavailable warning** before go-live regardless

## Related

- [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)
- [RELEASE_READINESS.md](./RELEASE_READINESS.md)
- [SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md)
