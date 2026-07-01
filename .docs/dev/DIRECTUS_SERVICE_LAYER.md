# Directus Service Layer Architecture

Developer reference for the Directus service module at `lib/services/directus/`.

---

## Module Structure

```
lib/services/directus/
├── index.ts          # Barrel re-export — the ONLY public import path
├── client.ts         # SDK client init, config checks, asset URLs
├── errors.ts         # Error classification (pure utility, no deps)
├── blogs.ts          # Blog collection queries
├── contact.ts        # Contact message write operations
└── transforms.ts     # Raw Directus → frontend type converters
```

**Import rule**: Consumers always import from `@/lib/services/directus` (the barrel). Never import internal modules directly.

---

## Key Design Decisions

### Type Safety at the Boundary

The Directus SDK's generic typing is complex and version-sensitive. We type the client as `RestClient<DirectusSchema>` at the **single initialization boundary** in `client.ts`. All downstream code uses our own typed interfaces from `types/directus.ts`:

- `DirectusBlogPost` — raw `blogs` collection row
- `DirectusContactMessage` — raw `contact_messages` row
- `DirectusSchema` — maps collection names → row types

The frontend-facing `Post` type (in `types/index.ts`) is the clean shape that UI components consume. The `transforms.ts` module bridges the raw → clean conversion.

### Error Handling

`errors.ts` classifies raw SDK errors into a `DirectusErrorType` discriminated union:

| Type                   | Trigger                       |
| ---------------------- | ----------------------------- |
| `authentication_error` | HTTP 401, 403                 |
| `not_found`            | HTTP 404                      |
| `validation_error`     | HTTP 400, 422                 |
| `server_error`         | HTTP 500+                     |
| `network_error`        | fetch/ECONNREFUSED/ETIMEDOUT  |
| `not_configured`       | (manual, not auto-classified) |
| `unknown_error`        | fallback                      |

### Environment Modes

All service functions respect the environment mode from `lib/env/env.ts`:

| Mode          | Behavior                                 |
| ------------- | ---------------------------------------- |
| `production`  | Must be configured. Errors are critical. |
| `live-dev`    | Must be configured. Mirrors production.  |
| `offline-dev` | No service calls. Returns empty/null.    |
| `test`        | No service calls. Returns empty/null.    |

---

## Adding a New Collection

1. **Define the raw type** in `types/directus.ts` (e.g. `DirectusCounter`)
2. **Add to `DirectusSchema`** interface (e.g. `counters: DirectusCounter[]`)
3. **Create a query module** at `lib/services/directus/<collection>.ts`
4. **Re-export** from `index.ts`
5. **Add tests** in `tests/unit/directus-<collection>.test.ts`

---

## Testing Patterns

- **Pure utilities** (`errors.ts`, `transforms.ts`): Direct imports, no mocking needed
- **Query functions** (`blogs.ts`): Mock `@directus/sdk`, `@/lib/dev-tooling/logger`, and `@/lib/dev-tooling/features`. Use `vi.resetModules()` + dynamic imports since the client initializes at module load time
- **Integration tests**: Set `APP_MODE=test` to disable services, verify graceful degradation
