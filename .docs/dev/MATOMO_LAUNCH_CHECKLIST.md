# Matomo Launch Checklist

Matomo will be **live at launch**. The client integration is implemented; these steps complete production readiness.

## Code Status (done)

- [x] `MatomoProvider` loads tracking when `config.matomo.enabled` is true
- [x] Both `NEXT_PUBLIC_MATOMO_URL` and `NEXT_PUBLIC_MATOMO_SITE_ID` must be set and not `DISABLED`
- [x] Privacy policy documents self-hosted Matomo (`data/policies/privacy-policy.md`)
- [x] Docker stack includes `ps-matomo` + `ps-matomo-db`
- [x] Build args wired in `Dockerfile` and `docker-compose.yml`

## Before Launch (operator tasks)

### Infrastructure

- [ ] **Public URL:** Configure NPM/reverse proxy so Matomo is reachable at a browser-facing URL (e.g. `https://analytics.ryanflynn.org`)
- [ ] **Do not use** internal Docker hostname (`ps-matomo:8181`) in `NEXT_PUBLIC_MATOMO_URL` — the browser cannot resolve it
- [ ] Set production `.env`:
  ```bash
  NEXT_PUBLIC_MATOMO_URL=https://analytics.yourdomain.com
  NEXT_PUBLIC_MATOMO_SITE_ID=1
  ```
- [ ] Rebuild frontend after setting Matomo vars (they are baked at build time)

### Matomo setup (first run)

- [ ] Complete Matomo web installer at the public URL
- [ ] Create site entry; note the **Site ID** (usually `1`)
- [ ] Enable **Do Not Track** respect in Matomo → Privacy settings
- [ ] Configure **IP anonymization** (last octet) in Matomo → Privacy
- [ ] Set data retention period (recommend 180 days or per your policy)
- [ ] Enable MFA on Matomo admin account
- [ ] Restrict Matomo admin to VPN/Tailscale or internal network only

### Verification

- [ ] Visit production site; confirm `_paq` requests in browser Network tab to your Matomo URL
- [ ] Matomo dashboard shows real-time visit within 60 seconds
- [ ] Blog post views and download events appear (if exercising those flows)
- [ ] Cookie/consent behavior matches privacy policy claims

### Post-launch (from TODO)

- [ ] Matomo analytics summary page on admin dashboard (`/admin/dashboard`)
- [ ] Deep dive: review Matomo goals, custom dimensions, and email reports

## Troubleshooting

| Symptom               | Likely cause                                             |
| --------------------- | -------------------------------------------------------- |
| No tracking requests  | `NEXT_PUBLIC_MATOMO_*` not set at **build** time         |
| CORS / blocked script | Matomo URL not publicly reachable or wrong domain        |
| Site ID mismatch      | `NEXT_PUBLIC_MATOMO_SITE_ID` does not match Matomo admin |
| Tracking in dev only  | `DISABLED` still set in production `.env`                |

## Related Docs

- [ANALYTICS.md](../ANALYTICS.md) — integration overview
- [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)
- [ENV_VARIABLES.md](./ENV_VARIABLES.md)
