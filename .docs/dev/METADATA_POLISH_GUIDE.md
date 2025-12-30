# Metadata Polish Guide - What Well-Polished Sites Have

This document outlines all the metadata elements that well-polished, professional websites include, and the current status of each in your site.

---

## ✅ Currently Implemented

### Basic Metadata

- [x] **Title Tag** - Implemented with template (`%s | Ryan Flynn`)
  - Location: `lib/seo.ts` → `defaultMetadata.title`
  - Status: ✅ Complete
  - All pages use consistent title format

- [x] **Meta Description** - Implemented
  - Location: `lib/seo.ts` → `defaultMetadata.description`
  - Status: ✅ Complete
  - Unique descriptions per page via `generatePageMetadata()`

- [x] **Favicon** - Exists
  - Location: `app/favicon.ico`
  - Status: ✅ File exists
  - Note: Next.js App Router automatically serves this

- [x] **Language Attribute** - Implemented
  - Location: `app/layout.tsx` → `<html lang="en">`
  - Status: ✅ Complete

### SEO Metadata

- [x] **Open Graph Tags** - Fully implemented
  - Location: `lib/seo.ts` → `defaultMetadata.openGraph`
  - Includes: title, description, type, url, siteName, images, locale
  - Status: ✅ Complete

- [x] **Twitter Card Tags** - Fully implemented
  - Location: `lib/seo.ts` → `defaultMetadata.twitter`
  - Includes: card type, title, description, images, creator
  - Status: ✅ Complete

- [x] **Canonical URLs** - Implemented
  - Location: `lib/seo.ts` → `defaultMetadata.alternates.canonical`
  - Status: ✅ Complete
  - All pages have canonical URLs

- [x] **Robots Meta Tags** - Implemented
  - Location: `lib/seo.ts` → `defaultMetadata.robots`
  - Includes: index, follow, googleBot settings
  - Status: ✅ Complete

- [x] **Keywords** - Implemented
  - Location: `lib/seo.ts` → `defaultMetadata.keywords`
  - Status: ✅ Complete

- [x] **Authors/Creator/Publisher** - Implemented
  - Location: `lib/seo.ts` → `defaultMetadata.authors`, `creator`, `publisher`
  - Status: ✅ Complete

### Structured Data

- [x] **JSON-LD Component** - Created and ready
  - Location: `components/common/JsonLd.tsx`
  - Status: ✅ Structure complete (disabled for blog until content ready)

### Technical SEO

- [x] **Sitemap** - Implemented
  - Location: `app/sitemap.ts`
  - Status: ✅ Complete
  - Includes all static pages, blog posts conditionally

- [x] **Robots.txt** - Implemented
  - Location: `app/robots.ts`
  - Status: ✅ Complete
  - Properly configured with rules and sitemap reference

---

## ⚠️ Recently Added (Needs Assets)

### Enhanced Metadata (Just Added)

- [x] **Application Name** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.applicationName`
  - Status: ✅ Code added
  - Purpose: App name for PWA and mobile browsers

- [x] **Viewport Configuration** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.viewport`
  - Status: ✅ Code added
  - Note: Next.js handles viewport automatically, but we've customized it

- [x] **Theme Color** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.themeColor`
  - Status: ✅ Code added
  - Supports both light and dark modes

- [x] **Color Scheme** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.colorScheme`
  - Status: ✅ Code added
  - Set to "dark light" to support both themes

- [x] **Format Detection** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.formatDetection`
  - Status: ✅ Code added
  - Disables automatic detection of phone numbers, addresses, etc.

- [x] **Icons Configuration** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.icons`
  - Status: ✅ Code added
  - References existing favicon and apple-touch-icon.svg

- [x] **Referrer Policy** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.referrer`
  - Status: ✅ Code added
  - Set to "origin-when-cross-origin" for privacy

- [x] **Category** - Added to metadata
  - Location: `lib/seo.ts` → `defaultMetadata.category`
  - Status: ✅ Code added
  - Set to "portfolio"

---

## ❌ Missing - Need to Create/Configure

### Critical Assets

1. **Open Graph Default Image**
   - [ ] Create `/public/images/og-default.png` (1200x630px)
   - Current: Path configured but file doesn't exist
   - Priority: 🔴 Critical

2. **App Icons (Next.js App Router)**
   - [ ] Create `app/icon.png` (512x512px) - Main app icon
   - [ ] Create `app/apple-icon.png` (180x180px) - Apple touch icon
   - Current: Using `app/favicon.ico` and `public/apple-touch-icon.svg`
   - Priority: 🟡 High
   - Note: Next.js App Router prefers these file-based icons

3. **Web App Manifest**
   - [ ] Create `app/manifest.ts` for PWA support
   - Current: Manifest path configured but file doesn't exist
   - Priority: 🟡 High
   - Benefits: PWA capabilities, installable app, offline support

### Social Media Configuration

4. **Social Media Profiles**
   - [ ] Update Twitter handle in `lib/seo.ts`
   - [ ] Update GitHub username in `lib/seo.ts`
   - [ ] Update LinkedIn profile in `lib/seo.ts`
   - Current: All are placeholders
   - Priority: 🔴 Critical

### Environment Configuration

5. **Environment Variable**
   - [ ] Set `NEXT_PUBLIC_SITE_URL` in `.env`
   - Current: Using fallback value
   - Priority: 🔴 Critical

---

## 📋 Optional Enhancements

### Advanced Metadata

- [ ] **Alternate Languages** - If you have multilingual content
- [ ] **Geo Targeting** - If targeting specific regions
- [ ] **Publication Date** - For blog posts (already in blog metadata)
- [ ] **Modified Date** - Track content updates
- [ ] **Section/Category** - For categorized content

### PWA Features

- [ ] **Service Worker** - For offline functionality
- [ ] **App Shortcuts** - Quick actions from home screen
- [ ] **Splash Screens** - Custom launch screens

### Verification Tags

- [ ] **Google Search Console** - Verification meta tag
- [ ] **Bing Webmaster Tools** - Verification meta tag
- [ ] **Domain Verification** - Other ownership verification

### Additional Structured Data

- [ ] **Person Schema** - For author/owner
- [ ] **Organization Schema** - If publishing as organization
- [ ] **WebSite Schema** - With search action
- [ ] **BreadcrumbList** - For navigation
- [ ] **Article Schema** - For blog posts (when enabled)

---

## 🎯 Quick Reference: What Each Metadata Does

### Title & Description

- **Title**: Shows in browser tabs, search results, bookmarks
- **Description**: Shows in search results, social shares

### Icons & Favicons

- **favicon.ico**: Browser tab icon (16x16, 32x32)
- **icon.png**: App icon for PWA (512x512)
- **apple-icon.png**: iOS home screen icon (180x180)
- **apple-touch-icon.svg**: Fallback for older iOS

### Open Graph

- Controls how content appears when shared on Facebook, LinkedIn, etc.
- Requires OG image for best results

### Twitter Cards

- Controls how content appears when shared on Twitter/X
- Requires image for "summary_large_image" card type

### Theme Color

- Sets the color of browser UI (address bar, etc.) on mobile
- Supports light/dark mode preferences

### Viewport

- Ensures responsive design works correctly
- Controls initial zoom and scaling

### Format Detection

- Prevents browsers from auto-detecting phone numbers, emails, etc.
- Reduces unwanted formatting/linking

### Application Name

- Name shown when site is installed as PWA
- Appears in app switcher, home screen

### Referrer Policy

- Controls what referrer information is sent with requests
- Privacy-focused setting

---

## 📊 Current Status Summary

### Implementation Status

- **Basic Metadata**: 100% ✅
- **SEO Metadata**: 100% ✅
- **Technical SEO**: 100% ✅
- **Enhanced Metadata**: 100% ✅ (code complete)
- **Assets**: 0% ❌ (need to create files)
- **Configuration**: 0% ❌ (need to update placeholders)

### What's Working

- All metadata structure is in place
- All pages use consistent metadata
- SEO foundation is solid
- Enhanced metadata code is complete

### What's Missing

- Physical asset files (images, icons)
- Social media profile updates
- Environment variable configuration
- Manifest file creation

---

## 🚀 Next Steps (Priority Order)

### Week 1: Critical Items

1. Create OG default image (1200x630px)
2. Update social media profiles in `lib/seo.ts`
3. Set `NEXT_PUBLIC_SITE_URL` environment variable

### Week 2: High Priority

4. Create `app/icon.png` (512x512px)
5. Create `app/apple-icon.png` (180x180px)
6. Create `app/manifest.ts` for PWA support

### Week 3: Optional Enhancements

7. Add structured data schemas
8. Add verification tags
9. Test all metadata with validation tools

---

## 📝 Notes

### Next.js App Router Metadata

- Next.js 14+ App Router automatically handles many metadata elements
- File-based icons (`app/icon.png`, `app/apple-icon.png`) are preferred
- Viewport is automatically added, but can be customized
- Manifest can be created as `app/manifest.ts` or `app/manifest.ts`

### Best Practices

- Keep title under 60 characters
- Keep description 120-155 characters
- Use unique titles/descriptions per page
- Test all metadata with validation tools
- Ensure OG images are 1200x630px for best results

---

**Last Updated:** December 2025
