# Changelog

All notable changes to this project are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning policy: [.docs/dev/VERSIONING.md](.docs/dev/VERSIONING.md).

## [Unreleased]

### Added

- Blog table of contents — top placement, shows when more than two h2–h4 headings ([BLOG_TABLE_OF_CONTENTS.md](.docs/dev/BLOG_TABLE_OF_CONTENTS.md))

### Changed

- Home "Recent Writings" uses shared `PostCard` (same look as blog index; HUD-style duplicate removed)

## [0.2.0] - 2026-07-01

### Added

- Formal pre-1.0 versioning policy ([VERSIONING.md](.docs/dev/VERSIONING.md))
- `CHANGELOG.md` and `pnpm run version:check` / `version:patch|minor|major` scripts
- `lib/site/version.ts` — `SITE_VERSION` derived from `package.json` (single source of truth)

### Changed

- Reset displayed version from informal `1.1.0` to `0.2.0` under the new policy (site not yet at 1.0 launch)

### Included in this line (already on `dev` before policy)

- Author popup and post-footer card on blog posts
- Back-to-top button, reading time estimates, archived unused components
- Contact form honest SMTP-unavailable warning

## [0.1.0] - 2025-12-01

### Added

- Initial portfolio site: Next.js App Router, Directus CMS, blog, contact form, vitae
- Docker compose stack, CI pipeline, E2E and unit tests
- Admin middleware, Matomo integration, privacy/terms policies

_Note: `0.1.0` and dates before the versioning policy are reconstructed for context. Legacy ad-hoc `1.1.0` in `package.json` is superseded by `0.2.0`._
