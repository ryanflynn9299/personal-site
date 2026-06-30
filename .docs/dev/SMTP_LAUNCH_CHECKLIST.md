# SMTP / Email Launch Checklist

Contact form delivery is **not yet implemented** — `lib/services/email-service.ts` still returns mock success. Directus storage works when configured.

## TODO: Implement SMTP before relying on email notifications

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
- [ ] Confirm production error when SMTP misconfigured (no false success)

## Current Behavior

| Mode        | SMTP configured | Result                                        |
| ----------- | --------------- | --------------------------------------------- |
| offline-dev | N/A             | Dev message, no services                      |
| production  | No              | Error if Directus also fails                  |
| production  | Yes (mock)      | **False success** until real SMTP implemented |
| production  | Yes (real)      | Email sent + Directus stored                  |

## Workaround at Launch

If SMTP is not ready:

1. Ensure Directus `contact_messages` collection exists and is wired
2. Monitor submissions via Directus admin
3. Do **not** set SMTP env vars until real sending works (avoids mock success path)

## Related

- [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)
- [SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md)
