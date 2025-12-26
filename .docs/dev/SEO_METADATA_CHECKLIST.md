# SEO Metadata Polish Checklist

**Last Updated:** December 2025  
**Status:** In Progress

This checklist tracks the implementation of SEO metadata improvements for the personal site.

---

## ✅ Completed Items

### Infrastructure & Core Setup
- [x] **Centralized SEO configuration** - Created `lib/seo.ts` with shared constants and helpers
- [x] **Root layout metadata** - Implemented `defaultMetadata` in `app/layout.tsx`
- [x] **Metadata helper function** - Created `generatePageMetadata()` for consistent page metadata
- [x] **All pages using helper** - All portfolio pages use `generatePageMetadata()`
- [x] **Robots.txt configured** - Properly configured with rules and sitemap reference
- [x] **Sitemap implemented** - All static pages included, blog posts conditionally included
- [x] **Canonical URLs** - All pages have canonical URLs set
- [x] **Language attribute** - HTML has `lang="en"` attribute
- [x] **Favicon exists** - `app/favicon.ico` is present

### Metadata Structure
- [x] **Title template** - Consistent title format with template (`%s | Ryan Flynn`)
- [x] **Description** - Site description configured
- [x] **Keywords** - Default keywords array in metadata
- [x] **Authors field** - Author information in metadata
- [x] **Creator/Publisher** - Creator and publisher fields set
- [x] **Open Graph structure** - Open Graph metadata structure implemented
- [x] **Twitter Card structure** - Twitter Card metadata structure implemented
- [x] **Robots directives** - Proper robots configuration with googleBot settings
- [x] **Metadata base URL** - `metadataBase` configured for relative URL resolution

### Blog SEO (Structure Ready)
- [x] **JSON-LD component** - Structured data component created and ready
- [x] **Blog post metadata** - Dynamic metadata generation for blog posts
- [x] **Blog SEO flag** - Feature flag system for enabling/disabling blog SEO
- [x] **Blog sitemap integration** - Blog posts conditionally added to sitemap

---

## ❌ Critical - Must Fix

### 1. Open Graph Default Image
- [ ] **Create OG image** - Create `/public/images/og-default.png` (1200x630px)
  - Current status: Image does not exist
  - Path configured: `${SITE_URL}/images/og-default.png`
  - Action needed: Design and create the image file

### 2. Social Media Profiles
- [ ] **Update Twitter profile** - Replace placeholder in `lib/seo.ts`
  - Current: `"https://twitter.com"` (placeholder)
  - Needed: `"https://twitter.com/yourhandle"` or `"@yourhandle"`
- [ ] **Update GitHub profile** - Replace placeholder in `lib/seo.ts`
  - Current: `"https://github.com"` (placeholder)
  - Needed: `"https://github.com/yourusername"`
- [ ] **Update LinkedIn profile** - Replace placeholder in `lib/seo.ts`
  - Current: `"https://linkedin.com"` (placeholder)
  - Needed: `"https://linkedin.com/in/yourprofile"`
- [ ] **Update Twitter creator** - Update `creator` field in Twitter metadata
  - Current: Uses placeholder URL
  - Needed: Use actual Twitter handle

### 3. Environment Variable
- [ ] **Set NEXT_PUBLIC_SITE_URL** - Add to `.env` file
  - Current: Not set (using fallback `https://www.ryanflynn.org`)
  - Needed: `NEXT_PUBLIC_SITE_URL=https://www.ryanflynn.org` (or your actual domain)
  - Verify: Ensure it's set in production environment variables

---

## ⚠️ High Priority - Recommended

### 4. App Icons and Manifest
- [ ] **Create manifest.ts** - Add `app/manifest.ts` for PWA metadata
- [ ] **Create icon.png** - Add `app/icon.png` (512x512) for Next.js App Router
- [ ] **Create apple-icon.png** - Add `app/apple-icon.png` (180x180) for Apple devices
- [ ] **Verify apple-touch-icon** - Ensure `public/apple-touch-icon.svg` is properly referenced
  - Current: File exists at `public/apple-touch-icon.svg`
  - Action: Verify it's being used correctly

### 5. Additional Metadata Fields
- [ ] **Add applicationName** - Add to `defaultMetadata` in `lib/seo.ts`
- [ ] **Add category** - If applicable for content categorization
- [ ] **Add classification** - For content classification
- [ ] **Add referrer policy** - Add `referrer: "origin-when-cross-origin"` or appropriate policy

### 6. Enhanced Open Graph
- [ ] **Add locale array** - If supporting multiple languages
- [ ] **Add countryName** - If targeting specific regions
- [ ] **Add seeAlso** - Links to related sites/profiles

### 7. Twitter Card Enhancements
- [ ] **Add site field** - Add `site: "@yourhandle"` to Twitter metadata
- [ ] **Verify card type** - Confirm `summary_large_image` is appropriate
- [ ] **Consider summary card** - Evaluate if `summary` is better for text-heavy content

---

## 📋 Medium Priority - Nice to Have

### 8. Structured Data (JSON-LD)
- [ ] **Add Person schema** - Create Person structured data for author
- [ ] **Add Organization/Person schema** - For site publisher
- [ ] **Add WebSite schema** - With search action if applicable
- [ ] **Add BreadcrumbList** - For navigation breadcrumbs
- [ ] **Add Article schema** - For blog posts (when blog SEO enabled)
  - Current: BlogPosting schema exists but disabled
  - Action: Enable when blog has content

### 9. Page-Specific Improvements
- [ ] **Add unique keywords** - Per-page keywords beyond defaults
- [ ] **Add modifiedTime** - Where applicable (blog posts, etc.)
- [ ] **Add section** - For categorized content
- [ ] **Custom OG images** - Per-page Open Graph images where appropriate

### 10. Language and Localization
- [ ] **Verify lang attribute** - Confirm `lang="en"` matches content
- [ ] **Add alternateLanguages** - If multilingual content exists
- [ ] **Add locale variants** - If targeting multiple regions

### 11. Verification and Ownership
- [ ] **Google Search Console** - Add verification meta tag
- [ ] **Bing Webmaster Tools** - Add verification meta tag
- [ ] **Domain ownership** - Add verification tags if needed

---

## 🎨 Low Priority - Polish

### 12. Additional Metadata
- [ ] **Add formatDetection** - Disable telephone, address, email detection if needed
- [ ] **Add colorScheme** - Add `"dark"` or `"light dark"` for theme
- [ ] **Add themeColor** - For mobile browser theme color
- [ ] **Add manifest link** - Link to manifest in layout if created

### 13. Performance and SEO
- [ ] **Add other metadata** - Custom tags if needed
- [ ] **Add archives** - For historical content links
- [ ] **Add bookmarks** - Related links

### 14. Testing and Validation
- [ ] **Google Rich Results Test** - Test all pages
- [ ] **Facebook Sharing Debugger** - Validate Open Graph tags
- [ ] **Twitter Card Validator** - Test Twitter cards
- [ ] **Schema.org Validator** - Validate JSON-LD structured data
- [ ] **Mobile previews** - Test on various devices
- [ ] **Sitemap validation** - Verify `/sitemap.xml` is accessible
- [ ] **Robots.txt validation** - Verify `/robots.txt` is accessible

---

## 📊 Progress Summary

### Overall Completion
- **Completed:** 24 items
- **Critical (Must Fix):** 0/3 completed
- **High Priority:** 0/4 completed
- **Medium Priority:** 0/4 completed
- **Low Priority:** 0/3 completed

### Completion Rate
- **Infrastructure:** 100% ✅
- **Core Metadata:** 100% ✅
- **Critical Items:** 0% ❌
- **High Priority:** 0% ⚠️
- **Medium Priority:** 0% 📋
- **Low Priority:** 0% 🎨

### Next Steps (Priority Order)
1. **Week 1:** Complete all Critical items (#1-3)
   - Create OG default image
   - Update social media profiles
   - Set environment variable
2. **Week 2:** Complete High Priority items (#4-7)
   - App icons and manifest
   - Additional metadata fields
   - Enhanced Open Graph
   - Twitter Card enhancements
3. **Week 3:** Complete Medium Priority items (#8-11)
   - Structured data
   - Page-specific improvements
   - Language/localization
   - Verification tags
4. **Ongoing:** Low Priority items and testing (#12-14)

---

## 📝 Notes

### Current State
- The metadata infrastructure is **fully implemented** and well-structured
- All pages are using the centralized helper function
- The foundation is solid - most remaining work is content/asset completion
- Blog SEO is properly disabled until content is ready

### Quick Wins (5 minutes each)
1. Update social profiles in `lib/seo.ts`
2. Set `NEXT_PUBLIC_SITE_URL` environment variable
3. Create simple OG image (1200x630px)
4. Add `applicationName` to metadata
5. Add `themeColor` for mobile browsers

### Files to Update
- `lib/seo.ts` - Social profiles, additional metadata fields
- `.env` - Environment variables
- `public/images/og-default.png` - Create this file
- `app/manifest.ts` - Create this file (if doing PWA)
- `app/icon.png` - Create this file
- `app/apple-icon.png` - Create this file

---

## 🔗 Resources

### Testing Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)

### Documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)

---

**Last Review:** December 2024

