# Security Posture & Secure Development Standards

Single source of truth for security in this project. Read this before touching
authentication, server actions, API routes, configuration, CI, or
infrastructure. The vulnerability disclosure policy lives in the root
[SECURITY.md](../SECURITY.md).

**Last full review:** 2026-07-02 (security hardening pass — see PR history)

---

## 1. Threat model

### What we protect

| Asset                        | Impact if compromised                              |
| ---------------------------- | -------------------------------------------------- |
| Admin dashboard (`/admin`)   | Content tampering, pivot to Directus data          |
| Directus CMS + Postgres      | Blog/content integrity, contact message PII        |
| Contact form pipeline        | Spam relay, PII leakage, resource exhaustion       |
| Secrets (`.env`)             | Full stack compromise (admin, DB, SMTP, CF tunnel) |
| CI/CD + `main` branch        | Supply-chain code execution on the home server     |
| Visitor trust (public pages) | XSS, defacement, SEO poisoning                     |

### Who we defend against

- **Opportunistic scanners/bots** — the dominant real-world threat for a
  public personal site (credential stuffing, form spam, CVE scanning).
- **Malicious CMS content** — a compromised Directus account must not lead to
  XSS on the public site (defense in depth).
- **Supply-chain attacks** — malicious or vulnerable npm packages.

Nation-state attackers and physical access are explicitly out of scope.

### Entry points

1. Public pages and assets (Next.js, port 3000 behind reverse proxy)
2. Contact form server action
3. Admin login server action + `/admin` middleware — **Tailscale-only by
   decision**: not published on the public domain (see
   [ADMIN_ACCESS.md](./dev/ADMIN_ACCESS.md)); middleware auth remains as
   defense-in-depth behind the network boundary
4. `/api/health` (internal-only by design)
5. Directus (`:8055`) and Matomo (`:8181`) — must never be publicly exposed
6. CI pipeline and dependency graph

---

## 2. Security controls inventory

| Control                        | Implementation                                                                      | Documentation                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Admin session tokens           | `lib/auth/session-token.ts` (HMAC-SHA256, 24h expiry)                               | [ADMIN_ACCESS.md](./dev/ADMIN_ACCESS.md)                              |
| Admin route gating             | `middleware.ts` (token verify + optional Tailscale)                                 | [ADMIN_ACCESS.md](./dev/ADMIN_ACCESS.md)                              |
| Login brute-force protection   | `lib/services/login-protection.ts` (5 fails / 15 min)                               | This file                                                             |
| Timing-safe secret comparison  | `secretsEqual` in `lib/auth/session-token.ts`                                       | This file                                                             |
| Contact form abuse protection  | `lib/services/contact-protection.ts` (honeypot + rate limit)                        | [CONTACT_FORM_SECURITY.md](./dev/CONTACT_FORM_SECURITY.md)            |
| Contact input limits           | `lib/constants/contact.ts` + `app/actions/contact.ts`                               | [CONTACT_FORM_SECURITY.md](./dev/CONTACT_FORM_SECURITY.md)            |
| Security headers + CSP         | `next.config.ts` (`headers()`)                                                      | §5 below                                                              |
| CMS content sanitization       | `rehype-sanitize` in `BlogContentRenderer`, escaped plaintext, JSON-LD `<` escaping | This file                                                             |
| Env validation + secret policy | `lib/config/schemas.ts` (Zod, min secret lengths)                                   | §6 below                                                              |
| Server/client secret boundary  | `lib/config/server.ts` (`server-only`)                                              | [DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §4 |
| Health endpoint isolation      | `app/api/health/route.ts` + `lib/dev-tooling/ip-validation.ts`                      | [SECURITY_HEALTH_CHECK.md](./SECURITY_HEALTH_CHECK.md)                |
| Dependency audit gate          | CI `dependency-audit` job + Dependabot + CodeQL                                     | §7 below                                                              |
| Container hardening            | Non-root frontend, `no-new-privileges`, internal-only ports                         | `Dockerfile`, `docker-compose.yml`                                    |

---

## 3. Secure development standards

These rules apply to every change, human- or AI-authored. The scoped Cursor
rule `.cursor/rules/security.mdc` enforces them at edit time.

### Authentication and sessions

- Never store a raw secret in a cookie, log line, or client-visible payload.
  Sessions use signed expiring tokens (`lib/auth/session-token.ts`).
- Compare secrets with `secretsEqual` (constant-time), never `===`.
- Any new privileged route goes under `/admin` so `middleware.ts` gates it —
  do not build per-page auth checks.
- Session cookies: `httpOnly`, `sameSite: "strict"`, `secure` in production.

### Server actions and API routes

- Every server action is a public, unauthenticated endpoint unless it checks
  auth itself. Do not export helpers from `"use server"` files — each export
  becomes remotely callable.
- Validate all inputs server-side: type, required, format, **and length**.
  Client-side validation is UX, not security.
- Rate limit anything that writes, sends, or is expensive (follow the
  in-memory pattern in `contact-protection.ts` / `login-protection.ts`).
- Return generic error messages; log details server-side with the pino logger.

### Secrets and configuration

- `lib/config/schemas.ts` is the only module that reads `process.env`
  (documented exceptions: `middleware.ts` (Edge runtime) and `next.config.ts`
  (build time)).
- Secrets belong in `serverConfig` (`lib/config/server.ts`, `server-only`).
  Never add a secret to the public config or a `NEXT_PUBLIC_*` variable.
- Never import `@/lib/services/*` or `@/lib/config/server` from
  `"use client"` components.
- New secrets get Zod validation with minimum-strength constraints and an
  entry in `.env.example` (placeholder only, never a real value).

### Output and content handling

- CMS/user content rendered as HTML must pass through `rehype-sanitize`
  (see `BlogContentRenderer`). Never add `rehypeRaw` without `rehypeSanitize`
  after it.
- Any `dangerouslySetInnerHTML` requires escaping proof in review. For inline
  JSON (`JsonLd`), escape `<` as `\u003c`.
- Never render user input into emails without `escapeHtml`.

### Client-side code

- No secrets, tokens, or PII in `localStorage`/`sessionStorage`.
- External scripts may only load from origins allow-listed in the CSP
  (`next.config.ts`). Extending the CSP is a security-relevant change —
  justify it in the PR.

### Infrastructure and CI

- Containers: non-root user where the image supports it, `no-new-privileges`,
  `expose` (internal) instead of `ports` (public) — the reverse proxy is the
  only public entry.
- Workflows declare least-privilege `permissions`. Never echo secrets in CI.
  Skip patterns (`[skip ci]`) do not work on protected branches — do not
  reintroduce that bypass.

---

## 4. Dependency policy

- **Gate:** the CI `dependency-audit` job fails on any known vulnerability in
  production dependencies, and on high+ in dev dependencies.
- **Updates:** Dependabot opens weekly PRs against `dev` (npm + GitHub
  Actions). Security patches take priority over feature work.
- **Overrides:** transitive vulnerabilities are patched with same-major
  `pnpm.overrides` in `package.json`. Remove an override once the direct
  dependency ships a fixed version.
- **New packages:** prefer zero-dependency or well-maintained packages;
  check publish recency and weekly downloads before adding. Run
  `pnpm audit` after adding.
- **SAST:** CodeQL runs on `main` pushes/PRs and weekly (`codeql.yml`).

## 5. Security headers and CSP

Configured centrally in `next.config.ts` and applied to all routes:

- `Content-Security-Policy` — `default-src 'self'`; Matomo/Directus origins
  are appended only when configured via env. `unsafe-inline` script/style is
  currently required by Next.js inline bootstrapping (no nonce pipeline);
  `unsafe-eval` and `ws:` are development-only.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (+
  `frame-ancestors 'none'`), `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (camera/mic/geolocation denied),
  `Strict-Transport-Security` (production only), `poweredByHeader: false`.

When adding a third-party integration, extend the CSP with the narrowest
origin that works and record why in the PR description.

## 6. Secrets management

- All secrets live in `.env` (gitignored). `.env.example` carries
  placeholders only.
- Minimum strengths are enforced at startup by Zod: `ADMIN_PASSCODE` ≥ 8
  chars, `ADMIN_SESSION_SECRET` ≥ 32 chars. Generate with
  `openssl rand -hex 32`.
- Rotation: rotating `ADMIN_SESSION_SECRET` invalidates all admin sessions
  (safe, immediate). Rotate after any suspected leak and at least yearly.
- Never commit `.env*` files with values, `*.pem`, or Cloudflare tunnel
  credentials (already gitignored — keep it that way).

## 7. Monitoring and incident response

- **Logs:** Docker `json-file` logging with rotation; pino structured logs in
  the app. Watch for repeated login failures and 404s on `/api/health`.
- **If a secret leaks:** rotate it in `.env`, restart the stack, review
  Directus users, check access logs for the exposure window.
- **If a dependency CVE drops:** CI will start failing the audit job. Patch
  via update or same-major override; don't silence the gate.
- **If the site is defaced/XSS is found:** take the reverse-proxy route
  offline, snapshot container logs, patch, then restore.

## 8. Review cadence

- Every PR: standards in §3 (enforced by review + Cursor rules).
- Quarterly (with the code health review, see
  [DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §7):
  re-run `pnpm audit`, review this document, re-check accepted risks below.

## 9. Accepted risks (deliberate, reviewed)

| Risk                                          | Rationale                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| CSP allows `unsafe-inline` scripts            | Next.js App Router inline bootstrapping; nonce pipeline is post-launch work                                     |
| In-memory rate limiting (resets on restart)   | Single-instance deployment; Redis unjustified at this scale                                                     |
| Single shared admin passcode (no users/MFA)   | Single operator; admin is Tailscale-only (not publicly routed) with signed sessions behind the network boundary |
| `directus/directus:latest` not yet pinned     | Operator must pick the running version — see deploy action items                                                |
| Health endpoint trusts proxy-stripped headers | Reverse proxy must strip/overwrite `X-Forwarded-For` (deploy checklist)                                         |
