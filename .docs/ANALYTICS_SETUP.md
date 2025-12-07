# Matomo Analytics Setup Guide

## Overview

Matomo analytics has been integrated into the website to track visitor metrics. This guide explains how to configure and use it.

## Environment Variables

Add the following variables to your `.env` file:

```bash
# Matomo Analytics Configuration
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-domain.com
NEXT_PUBLIC_MATOMO_SITE_ID=1
```

### Getting Your Matomo Site ID

1. Log into your Matomo dashboard
2. Go to Administration → Websites & Apps
3. Find your website in the list
4. The Site ID is shown in the first column (usually 1 for the first site)

### Matomo URL

- If Matomo is accessible via your domain: `https://analytics.yourdomain.com`
- If using Tailscale: `https://your-tailscale-ip` (if exposed)
- Internal Docker network: `http://ps-matomo:80` (for server-side only, not for client-side)

**Important**: The URL must be accessible from the browser (client-side), so use your public domain or Tailscale URL, not the Docker internal network name.

## What's Being Tracked

### Automatic Tracking (Built-in Matomo)

These metrics are automatically tracked by Matomo:

1. **Page Views**
   - Total page views across the site
   - Individual page views

2. **Unique Visitors**
   - Daily, weekly, monthly unique visitors
   - New vs returning visitors

3. **Visit Duration**
   - Average time spent on site
   - Time spent per page

4. **Referrers**
   - Direct traffic
   - Search engines
   - Social media
   - Other websites

5. **Device & Browser Info**
   - Desktop vs Mobile vs Tablet
   - Browser types
   - Operating systems

6. **Geographic Data**
   - Country/region of visitors

### Custom Event Tracking

Additional custom events are tracked:

1. **Page-Specific Views**
   - Homepage views
   - About page views
   - Vitae/Resume page views
   - Contact page views
   - Blog listing page views

2. **Blog Post Views**
   - Individual blog post views
   - Tracked by slug and title

3. **Download Events**
   - Resume/CV downloads
   - Tracked when download button is clicked

## Viewing Analytics

1. Log into your Matomo dashboard
2. Select your website from the dropdown
3. View reports:
   - **Visitors**: Unique visitors, returning visitors
   - **Behavior**: Page views, time on site, bounce rate
   - **Acquisition**: Referrers, search engines, social media
   - **Events**: Custom events (page views, downloads, blog posts)

## Privacy Considerations

- Matomo is privacy-focused and GDPR compliant
- No cookies required for basic tracking (can be configured)
- IP addresses can be anonymized in Matomo settings
- Respects Do Not Track headers (can be configured)
- All data stored on your own server

## Troubleshooting

### Analytics Not Working

1. **Check environment variables:**

   ```bash
   # Verify variables are set
   echo $NEXT_PUBLIC_MATOMO_URL
   echo $NEXT_PUBLIC_MATOMO_SITE_ID
   ```

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console for Matomo errors
   - Check Network tab for requests to Matomo

3. **Verify Matomo is accessible:**

   ```bash
   # Test from your server
   curl https://your-matomo-domain.com/matomo.js
   ```

4. **Check Matomo logs:**
   ```bash
   docker compose logs ps-matomo
   ```

### Events Not Showing

- Custom events may take a few minutes to appear in Matomo
- Ensure the Matomo script is loading (check Network tab)
- Verify environment variables are set correctly
- Check browser console for JavaScript errors

## Development Mode

In development, if Matomo is not configured, you'll see a warning in the console:

```
Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID
```

This is expected and won't affect functionality. Analytics will work once environment variables are set.

## Testing

To test analytics:

1. Set environment variables
2. Start the development server: `npm run dev`
3. Visit pages on your site
4. Check Matomo dashboard for new visits
5. Test download tracking by clicking the resume download button
6. Test blog post tracking by viewing a blog post

## Additional Resources

- [Matomo Documentation](https://matomo.org/docs/)
- [Matomo JavaScript Tracking Guide](https://developer.matomo.org/guides/tracking-javascript-guide)
