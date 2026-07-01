# Directus CMS: Developer Guide

This document is the **single source of truth** for Directus usage, collections, and security in this project.

---

## 1. Architecture Overview

This project uses **Directus 11+** as a Headless CMS, running in a Docker container named `ps-directus`.

- **Frontend**: Next.js 15 (App Router).
- **Communication**: The frontend communicates with Directus via the `@directus/sdk` using REST.
- **Service Layer**: Directus operations live in `lib/services/directus/` — a modular directory with separate files for client init, blog queries, contact writes, error handling, and data transforms. See [DIRECTUS_SERVICE_LAYER.md](.docs/dev/DIRECTUS_SERVICE_LAYER.md) for the full architecture reference.
- **Server Actions**: Server-side orchestration (e.g. contact form) happens in `app/actions/`, which delegates to the service layer.

---

## 2. Collections & Schema

### `blogs` (Active)

Stores all blog posts for the site.

- **Fields**: `id`, `status`, `title`, `content`, `summary`, `slug`, `publication_date`, `feature_image`, `blog_tags`, `author`.
- **Frontend Filter**: Only items with `status: 'published'` are fetched by `getPublishedPosts()`.

### `counters` (Proposed)

For tracking site metrics or feature usage.

- **Fields**: `id`, `key` (String, Unique), `value` (Integer), `metadata` (JSON), `date_updated`.

### `contact_messages` (Active)

Stores submissions from the Contact Me form.

- **Fields**: `id`, `name`, `email`, `message`, `status` (`new`, `read`, `archived`), `date_created`.
- **Security**: Public role has **Create-only** access. READ is disabled for public.

---

## 3. Security & Authentication

### Roles & Permissions

- **Administrator**: Full access to all collections and system settings.
- **Public**:
  - `blogs`: READ (where status is 'published').
  - `contact_messages`: CREATE (no read/update/delete).
  - `counters`: READ/UPDATE (scoped by key if necessary).

### Authentication

- Use Directus's native **User Management** for admin access.
- Avoid creating custom "password" tables; instead, create a User in Directus with the `Administrator` role.
- For Secure Server-to-Server communication (Future), use a **Static Token** associated with a Service Account.

---

## 4. Local Development

### Starting the Stack

Ensure you have Docker installed and the `backend-net` network created.

```bash
docker network create backend-net
docker compose up -d ps-directus ps-database
```

### Environment Variables

Required in your `.env` file:

```env
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_URL_SERVER_SIDE=http://ps-directus:8055
ADMIN_EMAIL=admin@example.com
ADMIN_PW=your_secure_password
```

---

## 5. Data Migration

### Offline Database Import

If you have a SQL dump (`.sql`) from a previous version:

1. Copy the file to the project root.
2. Run the following command:
   ```bash
   docker exec -i ps-database psql -U $DB_USER -d $DB_NAME < your_migration.sql
   ```

### Schema Snapshots

To export or apply the Directus schema schema:

```bash
# Export
npx directus schema snapshot ./snapshot.yaml
# Apply
npx directus schema apply ./snapshot.yaml
```

---

## 6. Best Practices

1. **Type Safety**: Always update types in `types/` when modifying Directus collections.
2. **Feature Flags**: Use `isDirectusEnabled()` from `lib/directus.ts` to handle cases where the CMS might be offline.
3. **Caching**: Utilize Next.js 15 `fetch` caching options for high-performance blog page loads.
