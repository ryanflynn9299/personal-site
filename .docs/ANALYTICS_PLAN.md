# Matomo Analytics Implementation Plan

## Overview

This document outlines the proposed analytics tracking for the personal portfolio website, with a focus on understanding visitor numbers and engagement.

## Proposed Analytics to Track

### ✅ Core Visitor Metrics (Essential)

These are the most important metrics for understanding visitor numbers:

1. **Page Views**
   - Total page views across the site
   - Page views per individual page
   - **Why**: Direct measure of traffic volume
   - **Implementation**: Automatic with Matomo base integration

2. **Unique Visitors**
   - Total unique visitors (daily, weekly, monthly)
   - New vs returning visitors
   - **Why**: Core metric for understanding actual visitor count
   - **Implementation**: Automatic with Matomo base integration

3. **Visit Duration**
   - Average time spent on site
   - Time spent per page
   - **Why**: Indicates engagement level
   - **Implementation**: Automatic with Matomo base integration

### 📊 Page-Specific Tracking (Recommended)

Understanding which content is most popular:

4. **Page-Specific Views**
   - Homepage views
   - Blog post views (individual posts)
   - About page views
   - Vitae/Resume page views
   - Contact page views
   - **Why**: Identify most popular content
   - **Implementation**: Custom event tracking on page loads

5. **Blog Engagement**
   - Most viewed blog posts
   - Blog post read time
   - Blog search queries (if search is used)
   - **Why**: Understand which blog content resonates
   - **Implementation**: Custom tracking on blog post views and search

### 🔍 Traffic Sources (Recommended)

Understanding where visitors come from:

6. **Referrers**
   - Direct traffic
   - Search engines (Google, Bing, etc.)
   - Social media (LinkedIn, Twitter, etc.)
   - Other websites
   - **Why**: Understand how people find your site
   - **Implementation**: Automatic with Matomo base integration

7. **Search Engine Keywords**
   - Keywords that led visitors to your site
   - **Why**: Understand what people are searching for
   - **Implementation**: Automatic with Matomo (if available)

### 📱 Technical Metrics (Optional)

Basic technical information:

8. **Device & Browser Info**
   - Desktop vs Mobile vs Tablet
   - Browser types
   - **Why**: Understand visitor technology preferences
   - **Implementation**: Automatic with Matomo base integration

9. **Geographic Data**
   - Country/region of visitors
   - **Why**: Understand audience location
   - **Implementation**: Automatic with Matomo base integration

### 🎯 User Actions (Optional)

Understanding user interactions:

10. **Download Events**
    - Resume/CV downloads
    - **Why**: Track if people download your resume
    - **Implementation**: Custom event tracking on download clicks

11. **External Link Clicks**
    - Clicks on social media links
    - Clicks on project links
    - **Why**: Understand what external content interests visitors
    - **Implementation**: Custom event tracking on external links

12. **Contact Form Submissions**
    - Form submission events
    - **Why**: Track engagement with contact form
    - **Implementation**: Custom event tracking on form submit

13. **Navigation Patterns**
    - Most common navigation paths
    - Entry and exit pages
    - **Why**: Understand user journey through site
    - **Implementation**: Automatic with Matomo base integration

## Implementation Priority

### Phase 1: Essential (Implement First)

- ✅ Page Views (automatic)
- ✅ Unique Visitors (automatic)
- ✅ Visit Duration (automatic)
- ✅ Referrers (automatic)
- ✅ Device & Browser Info (automatic)

### Phase 2: Recommended (Implement Second)

- 📊 Page-Specific Views (custom tracking)
- 📊 Blog Post Views (custom tracking)
- 📊 Download Events (custom tracking)

### Phase 3: Optional (Implement if Needed)

- 🔍 Search Engine Keywords
- 🎯 External Link Clicks
- 🎯 Contact Form Submissions
- 🎯 Navigation Patterns

## Privacy Considerations

- Matomo is privacy-focused and GDPR compliant
- No cookies required for basic tracking (can use cookieless tracking)
- IP addresses can be anonymized
- Respects Do Not Track headers
- All data stored on your own server

## Approval Checklist

Please approve each category:

- [ ] **Core Visitor Metrics** (1-3) - Essential for visitor count
- [ ] **Page-Specific Tracking** (4-5) - Recommended for content insights
- [ ] **Traffic Sources** (6-7) - Recommended for understanding reach
- [ ] **Technical Metrics** (8-9) - Optional, basic info
- [ ] **User Actions** (10-13) - Optional, engagement tracking

## Next Steps

Once approved, I will:

1. Create Matomo integration component
2. Add tracking script to root layout
3. Implement custom event tracking for approved metrics
4. Add environment variables for Matomo configuration
5. Test tracking in development
6. Document usage in README
