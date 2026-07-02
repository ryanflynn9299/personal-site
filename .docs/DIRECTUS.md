# Directus CMS: Developer Guide

Single source of truth for Directus usage in this project: collections, security, local development, and the service-layer architecture in `lib/services/directus/` (this doc absorbed the former `dev/DIRECTUS_SERVICE_LAYER.md`).

---

## 1. Architecture overview

Directus 11+ runs as a Docker container (`ps-directus`) backed by PostgreSQL (`ps-database`).

- **Frontend:** Next.js 16 (App Router) talks to Directus via `@directus/sdk` over REST.
- **Service layer:** all Directus operations live in `lib/services/directus/` (see §5).
- **Server actions:** orchestration (e.g. the contact form) happens in `app/actions/`, which delegates to the service layer.
- **Import boundary:** never import `@/lib/services/*` from `"use client"` components ([DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §4).

---

## 2. Collections & schema

### `blogs` (active)

Blog posts.

- **Fields:** `id`, `status`, `title`, `content`, `summary`, `slug`, `publication_date`, `feature_image`, `blog_tags`, `author` (`first_name`, `last_name`).
- **Frontend filter:** `getPublishedPosts()` fetches only `status: 'published'`.
- Author display data is merged with static profiles in `data/authors.ts` — see [AUTHOR_PROFILES.md](./dev/AUTHOR_PROFILES.md). A dedicated `authors` collection (M2O from `blogs.author`) is the planned target schema in that doc.

### `contact_messages` (active)

Contact form submissions.

- **Fields:** `id`, `name`, `email`, `message`, `status` (`new` / `read` / `archived`), `date_created`.
- **Security:** Public role has **Create-only** access; READ is disabled for public.

### `counters` (proposed)

For site metrics / feature usage.

| Field          | Type     | Required | Notes              |
| -------------- | -------- | -------- | ------------------ |
| `id`           | uuid     | yes      |                    |
| `key`          | string   | yes      | Unique string key  |
| `value`        | integer  | yes      | Current count      |
| `metadata`     | json     | no       | Arbitrary metadata |
| `date_updated` | datetime | no       | Auto-updated       |

**Service layer:** `getCounterByKey`, `incrementCounterByKey` in `lib/services/directus/counters.ts`.  
**Consumer:** `app/actions/counter.ts` → contact-page fun counter (`FUN_COUNTER_KEY`).

### `authors` (proposed)

Dedicated author profiles; `blogs.author` will become M2O → `authors`.

| Field        | Type   | Required | Notes                                        |
| ------------ | ------ | -------- | -------------------------------------------- |
| `id`         | uuid   | yes      |                                              |
| `status`     | enum   | yes      | `published` / `draft`                        |
| `slug`       | string | yes      | URL-safe key, unique                         |
| `first_name` | string | yes      |                                              |
| `last_name`  | string | yes      |                                              |
| `emoji`      | string | yes      | Single emoji identity marker                 |
| `accent`     | string | no       | One of `AuthorAccentKey` in `types/index.ts` |
| `role`       | string | no       | e.g. "Software Engineer"                     |
| `bio_short`  | text   | no       | Short bio for popup/footer                   |

**Service layer:** `getPublishedAuthors`, `getAuthorBySlug` in `lib/services/directus/authors.ts`.  
**Fallback:** `data/authors.ts` until collection is populated — see [AUTHOR_PROFILES.md](./dev/AUTHOR_PROFILES.md).

### `blog_tags` (proposed)

Normalized tag taxonomy. Posts still use inline `blogs.blog_tags` strings until M2M migration.

| Field         | Type   | Required | Notes                 |
| ------------- | ------ | -------- | --------------------- |
| `id`          | uuid   | yes      |                       |
| `status`      | enum   | yes      | `published` / `draft` |
| `slug`        | string | yes      | Unique URL key        |
| `label`       | string | yes      | Display name          |
| `description` | text   | no       | Optional blurb        |
| `color`       | string | no       | Optional accent token |
| `sort`        | int    | no       | Nav ordering          |

**Service layer:** `getPublishedTags`, `getTagBySlug`, `getPostsByTagSlug` in `lib/services/directus/blog-tags.ts`.  
**UI:** Handler only — tag routes not implemented yet.

### `blog_series` (proposed)

Post series / collections. Requires `blogs.series` M2O + `blogs.series_order` for membership.

| Field         | Type   | Required | Notes                 |
| ------------- | ------ | -------- | --------------------- |
| `id`          | uuid   | yes      |                       |
| `status`      | enum   | yes      | `published` / `draft` |
| `slug`        | string | yes      | Unique URL key        |
| `title`       | string | yes      | Series title          |
| `description` | text   | no       | Series intro          |
| `cover_image` | file   | no       | Optional hero image   |
| `sort_order`  | int    | no       | Listing order         |

**Service layer:** `getPublishedSeries`, `getSeriesBySlug`, `getPostsInSeries` in `lib/services/directus/blog-series.ts`.  
**UI:** Handler only — series routes not implemented yet.

---

## 3. Security & authentication

Roles and permissions:

- **Administrator:** full access.
- **Public:** `blogs` READ (published only); `contact_messages` CREATE only; `counters` READ/UPDATE scoped by key if implemented.

Authentication:

- Use Directus's native user management for admin access — no custom password tables.
- For future server-to-server auth, use a **static token** on a service account.
- The Directus admin UI (`:8055`) must never be publicly exposed — lock it behind VPN/Tailscale at the reverse proxy ([ADMIN_ACCESS.md](./dev/ADMIN_ACCESS.md), [SECURITY.md](./SECURITY.md)).

---

## 4. Local development

```bash
docker network create backend-net   # first time only
docker compose up -d ps-directus ps-database
```

Environment (full reference: [ENV_VARIABLES.md](./dev/ENV_VARIABLES.md)):

```env
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055   # browser-facing
DIRECTUS_INTERNAL_URL=http://ps-directus:8055    # server-side (Docker network)
DIRECTUS_ADMIN_EMAIL=admin@example.com           # initial admin (container bootstrap)
DIRECTUS_ADMIN_PASSWORD=your_secure_password
```

With no Directus configured, the app runs in `offline-dev` behavior: service calls are skipped and empty states render. That is expected, not an error.

### Data migration

```bash
# Import a SQL dump
docker exec -i ps-database psql -U "$DB_USER" -d "$DB_NAME" < your_migration.sql

# Schema snapshots
npx directus schema snapshot ./snapshot.yaml
npx directus schema apply ./snapshot.yaml
```

---

## 5. Service layer (`lib/services/directus/`)

```
lib/services/directus/
├── index.ts          # Barrel re-export — the ONLY public import path
├── client.ts         # SDK client init, config checks, asset URLs
├── errors.ts         # Error classification (pure utility, no deps)
├── query-context.ts  # Shared guards and logging for query modules
├── constants.ts      # Collection keys (e.g. FUN_COUNTER_KEY)
├── blogs.ts          # Blog queries (published posts, by slug, adjacent)
├── contact.ts        # Contact message read/write
├── counters.ts       # Counter read/increment
├── authors.ts        # Author profile queries
├── blog-tags.ts      # Blog tag taxonomy queries
├── blog-series.ts    # Blog series queries
└── transforms.ts     # Raw Directus → frontend type converters (internal)
```

**Import rule:** consumers always import from `@/lib/services/directus` (the barrel), never internal modules.

### Type safety at the boundary

The SDK's generics are complex and version-sensitive, so the client is typed as `RestClient<DirectusSchema>` at the **single initialization boundary** in `client.ts`. Downstream code uses our own types from `types/directus.ts`:

- `DirectusBlogPost` — raw `blogs` row
- `DirectusContactMessage` — raw `contact_messages` row
- `DirectusCounter`, `DirectusAuthor`, `DirectusBlogTag`, `DirectusBlogSeries`
- `DirectusSchema` — collection name → row type map

The UI consumes clean types from `types/index.ts` (`Post`, `SiteCounter`, `BlogTag`, etc.); `transforms.ts` bridges raw → clean.

### Query options

`getPublishedPosts()` accepts optional `GetPostsOptions` (`limit`, `page`, `search`) and returns a `total` count for pagination — see [dev/BLOG.md](./dev/BLOG.md) for usage and scaling guidance.

### Error handling

`errors.ts` classifies SDK errors into a `DirectusErrorType` union:

| Type                   | Trigger                          |
| ---------------------- | -------------------------------- |
| `authentication_error` | HTTP 401, 403                    |
| `not_found`            | HTTP 404                         |
| `validation_error`     | HTTP 400, 422                    |
| `server_error`         | HTTP 500+                        |
| `network_error`        | fetch / ECONNREFUSED / ETIMEDOUT |
| `not_configured`       | (manual, not auto-classified)    |
| `unknown_error`        | fallback                         |

### Runtime modes

All service functions respect the runtime mode from `lib/config`:

| Mode          | Behavior                                |
| ------------- | --------------------------------------- |
| `production`  | Must be configured; errors are critical |
| `live-dev`    | Must be configured; mirrors production  |
| `offline-dev` | No service calls; returns empty/null    |
| `test`        | No service calls; returns empty/null    |

### Adding a new collection

1. Define the raw type in `types/directus.ts` (e.g. `DirectusCounter`)
2. Add it to the `DirectusSchema` interface
3. Create a query module at `lib/services/directus/<collection>.ts`
4. Re-export from `index.ts`
5. Add tests in `tests/unit/directus-<collection>.test.ts`
6. Update types in `types/` and this doc's §2

### Testing patterns

- **Pure utilities** (`errors.ts`, `transforms.ts`): direct imports, no mocking.
- **Query modules** (`blogs.ts`): mock `@directus/sdk`, the logger, and features; use `vi.resetModules()` + dynamic imports because the client initializes at module load.
- **Integration tests:** run with test mode so services are disabled and graceful degradation is verified.

---

## 6. Best practices

1. **Type safety:** update `types/directus.ts` whenever a collection changes.
2. **Graceful degradation:** gate calls on `isDirectusConfigured()` from `@/lib/services/directus`; client components should use client-safe checks from `@/lib/config` instead.
3. **Caching:** use Next.js `fetch` caching options for blog page loads.
