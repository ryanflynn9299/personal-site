# Email & Contact Form Delivery

Single source of truth for contact-form email delivery: current behavior, the launch posture, and the path to real SMTP. (This doc absorbed the former `SMTP_LAUNCH_CHECKLIST.md` and the decision record from `CONTACT_FORM_OPTIONS.md` — both in git history.)

Contact-form **security** (honeypot, rate limiting, validation) is documented separately in [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md).

---

## Current state

**Real email sending is not implemented.** `lib/services/email-service.ts` contains a mock send path; submissions are stored in Directus (`contact_messages`) when configured. The UI is honest about this:

| Mode        | SMTP configured | Directus | Result today                                                         |
| ----------- | --------------- | -------- | -------------------------------------------------------------------- |
| offline-dev | N/A             | —        | Dev message, no services                                             |
| production  | No              | No       | Error shown                                                          |
| production  | No              | Yes      | Success (stored only) — **acceptable launch posture**                |
| production  | Yes (mock)      | Any      | Amber warning UI — email not sent (`messageStored` when Directus ok) |
| production  | Yes (real)      | Any      | Email sent (post-launch goal)                                        |

**UX rule (non-negotiable):** never report `emailSent: true` from the mock path in production/live-dev. If email cannot be sent but Directus stored the message, tell the user it was received; if nothing succeeded, show an error. This is enforced by tests and by policy (`.cursor/rules/ux-and-ui.mdc`, [AI_GUARDRAILS.md](../prompting/AI_GUARDRAILS.md) §4).

**Key files:** `lib/services/email-service.ts`, `app/actions/contact.ts`, `components/contact/ContactPageClient.tsx`.

### Launch workaround (until real SMTP)

1. Ensure the Directus `contact_messages` collection exists and is wired
2. Monitor submissions via the Directus admin
3. Do **not** set `SMTP_*` env vars until real sending works

---

## Architecture decision (record)

Chosen approach: **Next.js server action + Directus storage now; self-hosted/relay SMTP later.**

```
ContactPageClient → app/actions/contact.ts (validate, rate limit)
                    ├→ Directus contact_messages (storage — active)
                    └→ lib/services/email-service.ts (send — mock, pending)
```

Options considered (full analysis in git history: `CONTACT_FORM_OPTIONS.md`):

| Option                                    | Verdict                                                                                                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Third-party form service (Formspree etc.) | Rejected — external data storage, less control                                                                                                                  |
| Managed email API (Resend/SendGrid)       | Viable fallback — free tiers cover expected volume; revisit if self-hosted deliverability disappoints                                                           |
| Directus Flows for email automation       | Rejected — more moving parts than a direct send from the action                                                                                                 |
| **Self-hosted SMTP relay (Postfix)** ⭐   | **Chosen direction** — homelab-friendly, $0, full data ownership; start with a relay through an existing account, upgrade to a full mail server only if desired |

---

## Path to real SMTP (post-launch TODO)

- [ ] Choose provider: self-hosted Postfix relay (see [SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md)) or transactional API (Resend etc.)
- [ ] Add the dependency (`nodemailer` or provider SDK) to `package.json`
- [ ] Implement the real send in `lib/services/email-service.ts` (replace the mock path; keep the honest-UX fallbacks)
- [ ] Configure production `.env`:
  ```bash
  SMTP_HOST=mail.yourdomain.com
  SMTP_PORT=587
  SMTP_FROM=contact@ryanflynn.org
  SMTP_TO=<your inbox>
  SMTP_USER=...    # if auth required
  SMTP_PASS=...    # if auth required
  ```
- [ ] Verify SPF, DKIM, and DMARC for the sending domain
- [ ] Set `Reply-To` to the visitor's email for easy replies
- [ ] Test end-to-end: submit form → email arrives in inbox (not spam)
- [ ] Keep `escapeHtml` on all user input rendered into email bodies ([SECURITY.md](../SECURITY.md) §3)

Deliverability notes for self-hosted sending (details in [SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md)): configure SPF/DKIM/DMARC and reverse DNS; a relay through an established provider avoids IP-reputation warmup entirely.

---

## Related docs

- [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md) — honeypot, rate limiting, validation
- [SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md) — Postfix relay / Docker Mailserver setup guide
- [RELEASE_READINESS.md](./RELEASE_READINESS.md) — launch gate
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) — `SMTP_*` reference
