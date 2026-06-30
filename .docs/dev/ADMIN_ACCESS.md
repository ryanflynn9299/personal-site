# Admin Dashboard Access

The admin dashboard at `/admin/dashboard` is protected by middleware, passcode auth, and optional Tailscale enforcement.

## Current Implementation (done)

- [x] Root `middleware.ts` protects `/admin` routes
- [x] Unauthenticated requests redirect to `/admin/dashboard/login`
- [x] Passcode login sets `httpOnly` session cookie (`ADMIN_SESSION_SECRET`)
- [x] Login brute-force delay (1s synthetic wait on failure)

## Environment Variables

```bash
ADMIN_PASSCODE=your-strong-passcode
ADMIN_SESSION_SECRET=your-64-char-hex-secret   # openssl rand -hex 32
ADMIN_REQUIRE_TAILSCALE=false                   # set true for production hardening
```

Generate secrets:

```bash
openssl rand -hex 32   # ADMIN_SESSION_SECRET
```

## TODO: Configure Tailscale for Admin (before/at launch)

- [ ] Install Tailscale on the home server hosting the Docker stack
- [ ] Join the server to your tailnet
- [ ] Access admin via Tailscale IP or MagicDNS (e.g. `https://server-name/admin/dashboard`)
- [ ] Set `ADMIN_REQUIRE_TAILSCALE=true` in production `.env`
- [ ] Verify middleware returns 403 from non-Tailscale IPs (100.64.0.0/10 range)
- [ ] Configure NPM so `/admin` is **not** exposed on the public internet, OR rely on Tailscale gate
- [ ] Document your tailnet device list and who has access

### Tailscale IP check behavior

When `ADMIN_REQUIRE_TAILSCALE=true` and `RUNTIME_MODE=production`:

- Requests from `100.64.x.x` – `100.127.x.x` are allowed (after passcode auth)
- All other IPs receive `403 Subspace Access Denied: Tailscale Connection Required`
- Disabled in dev modes for local testing

### Recommended production posture

**Option A (strict):** Admin only via Tailscale URL; do not publish `/admin` on public domain.

**Option B (layered):** Public domain + passcode + `ADMIN_REQUIRE_TAILSCALE=true` so only tailnet clients can authenticate.

## Directus & Matomo Admin

The Next.js dashboard is separate from:

- **Directus admin** (`:8055`) — CMS; lock behind VPN/proxy
- **Matomo admin** — analytics; lock behind VPN/proxy (see [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md))

## Related Files

| File                           | Purpose                                   |
| ------------------------------ | ----------------------------------------- |
| `middleware.ts`                | Auth + Tailscale + preview route blocking |
| `app/actions/auth.ts`          | Login/logout server actions               |
| `app/(admin)/admin/dashboard/` | Dashboard UI                              |
