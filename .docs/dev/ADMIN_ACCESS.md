# Admin Dashboard Access

The admin dashboard at `/admin/dashboard` is protected by middleware, passcode auth, and optional Tailscale enforcement.

> **DECIDED (2026-07-02): Admin is Tailscale-only.** `/admin` is **not**
> published on the public domain — no reverse-proxy (NPM) route may forward
> it. Access is exclusively via the server's Tailscale IP / MagicDNS, with
> `ADMIN_REQUIRE_TAILSCALE=true` as an application-level backstop against
> proxy misconfiguration. Publishing `/admin` publicly requires revisiting
> this decision and updating `.docs/SECURITY.md` §9.

## Current Implementation (done)

- [x] Root `middleware.ts` protects `/admin` routes
- [x] Unauthenticated requests redirect to `/admin/dashboard/login`
- [x] Passcode login sets an `httpOnly` cookie containing a **signed,
      expiring session token** (HMAC-SHA256 over the expiry, keyed by
      `ADMIN_SESSION_SECRET`) — the raw secret never leaves the server
- [x] Constant-time passcode comparison (`secretsEqual`)
- [x] Login rate limiting: 5 failed attempts per IP per 15 minutes
      (`lib/services/login-protection.ts`), plus 1s synthetic delay on failure
- [x] Middleware verifies token signature and expiry (`lib/auth/session-token.ts`)

### Session token design

- Cookie: `admin_session` = `<expiresAtMs>.<hmacSha256Hex(secret, expiresAtMs)>`
- Lifetime: 24 hours (`SESSION_MAX_AGE_SECONDS`)
- Verification is edge-safe (Web Crypto) so middleware and server actions
  share one implementation
- Rotating `ADMIN_SESSION_SECRET` instantly invalidates all sessions

## Environment Variables

```bash
ADMIN_PASSCODE=your-strong-passcode             # min 8 chars (enforced at startup)
ADMIN_SESSION_SECRET=your-64-char-hex-secret    # min 32 chars; openssl rand -hex 32
ADMIN_REQUIRE_TAILSCALE=false                   # set true for production hardening
```

Generate secrets:

```bash
openssl rand -hex 32   # ADMIN_SESSION_SECRET
```

## TODO: Make admin Tailscale-only (launch blocker — operator)

Tracked prominently in [TODO.md](./TODO.md). Steps:

- [ ] Install Tailscale on the home server hosting the Docker stack
- [ ] Join the server to your tailnet
- [ ] Configure NPM so `/admin` is **not** routed on the public domain
      (no forwarding rule; public requests must dead-end at the proxy)
- [ ] Access admin via Tailscale IP or MagicDNS (e.g. `https://server-name/admin/dashboard`)
- [ ] Set `ADMIN_REQUIRE_TAILSCALE=true` in production `.env` (backstop if
      the proxy is ever misconfigured)
- [ ] Verify from an off-tailnet network: `https://<public-domain>/admin/dashboard`
      returns the proxy's 404/error page, **not** the login screen
- [ ] Verify from the tailnet: login works and middleware allows the session
- [ ] Verify middleware returns 403 from non-Tailscale IPs (100.64.0.0/10 range)
- [ ] Document your tailnet device list and who has access

### Tailscale IP check behavior

When `ADMIN_REQUIRE_TAILSCALE=true` and `RUNTIME_MODE=production`:

- Requests from `100.64.x.x` – `100.127.x.x` are allowed (after passcode auth)
- All other IPs receive `403 Subspace Access Denied: Tailscale Connection Required`
- Disabled in dev modes for local testing

### Production posture (decided)

**Option A (strict) is the committed posture:** admin only via Tailscale URL;
`/admin` is not published on the public domain. The middleware Tailscale gate
and passcode/session auth remain active as defense-in-depth behind the
network boundary.

_Option B (public domain + passcode + Tailscale gate) was considered and
rejected — it leaves the login surface reachable by the public internet._

## Directus & Matomo Admin

The Next.js dashboard is separate from:

- **Directus admin** (`:8055`) — CMS; lock behind VPN/proxy
- **Matomo admin** — analytics; lock behind VPN/proxy (see [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md))

## Related Files

| File                               | Purpose                                   |
| ---------------------------------- | ----------------------------------------- |
| `middleware.ts`                    | Auth + Tailscale + preview route blocking |
| `app/actions/auth.ts`              | Login/logout server actions               |
| `lib/auth/session-token.ts`        | Signed session token create/verify        |
| `lib/services/login-protection.ts` | Failed-attempt rate limiting              |
| `app/(admin)/admin/dashboard/`     | Dashboard UI                              |
