# Matomo Analytics

## What is Matomo?

Matomo is a privacy-focused, self-hosted web analytics platform. Unlike Google Analytics, Matomo runs on your own server, giving you complete control over visitor data. It's GDPR-compliant, doesn't require cookies for basic tracking, and all data is stored locally in your infrastructure.

## How It Works in This Project

Matomo is integrated into the Next.js application via client-side JavaScript tracking. The tracking script is loaded on every page through the `MatomoProvider` component in the root layout. When visitors interact with the site, events are sent to your Matomo instance running in a Docker container.

### Active Components

- **`MatomoProvider`** (`components/MatomoProvider.tsx`) - Client wrapper that reads environment variables and conditionally renders the Matomo component
- **`Matomo`** (`components/Matomo.tsx`) - Main tracking component that initializes Matomo, tracks page views, and provides utility functions for custom events
- **`BlogPostTracker`** (`components/BlogPostTracker.tsx`) - Tracks individual blog post views with slug and title
- **`DownloadButton`** (`components/DownloadButton.tsx`) - Tracks file download events (e.g., resume downloads)

### Implementation Overview

The tracking implementation uses Matomo's JavaScript API (`_paq`). The `Matomo` component:
1. Loads the Matomo tracking script dynamically
2. Configures the tracker URL and site ID from environment variables
3. Automatically tracks page views on route changes
4. Provides utility functions (`trackMatomoEvent`, `trackDownload`, `trackBlogSearch`, `trackBlogPostView`) for custom event tracking

Custom events are tracked by calling these utility functions from various components throughout the application.

## Tracked Metrics

### Automatic Metrics (Built-in Matomo)

These are automatically tracked by Matomo without any additional code:

- **Page Views** - Total and per-page views
- **Unique Visitors** - Daily, weekly, monthly unique visitors; new vs returning
- **Visit Duration** - Average time spent on site and per page
- **Referrers** - Direct traffic, search engines, social media, other websites
- **Device & Browser Info** - Desktop/Mobile/Tablet, browser types, operating systems
- **Geographic Data** - Country/region of visitors
- **Navigation Patterns** - Entry and exit pages, user journey paths

### Custom Event Tracking

Additional custom events are tracked via code:

1. **Page-Specific Views** - Custom events for:
   - Homepage (`/`)
   - About page (`/about`)
   - Vitae/Resume page (`/vitae`)
   - Contact page (`/contact`)
   - Blog listing page (`/blog`)

2. **Blog Post Views** - Individual blog post views tracked by slug and title

3. **Blog Search Queries** - Search queries entered in the blog search dialog, including result count

4. **Download Events** - Resume/CV downloads tracked when download button is clicked

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-domain.com
NEXT_PUBLIC_MATOMO_SITE_ID=1
```

**Important**: The `NEXT_PUBLIC_MATOMO_URL` must be accessible from the browser (client-side). Use your public domain or Tailscale URL, not the Docker internal network name (`ps-matomo:80`).

### Getting Your Site ID

1. Log into your Matomo dashboard
2. Go to **Administration → Websites & Apps**
3. Find your website in the list
4. The Site ID is shown in the first column (usually `1` for the first site)

## Accessing Matomo Dashboard

### Prerequisites

- You must be connected to Tailscale to access the Matomo dashboard
- Matomo must be exposed via Nginx Proxy Manager (or similar) on your Tailscale network

### Steps to Access

1. **Connect to Tailscale**
   - Ensure your device is connected to the same Tailscale network as your server

2. **Navigate to Matomo URL**
   - Open your browser and go to the Matomo URL configured in Nginx Proxy Manager
   - Example: `https://analytics.yourdomain.com` or `https://matomo.your-tailscale-domain`

3. **Log In**
   - Use the admin credentials set during Matomo initial setup
   - If you haven't set up Matomo yet, you'll need to complete the initial installation wizard

4. **View Analytics**
   - Select your website from the dropdown in the top navigation
   - Navigate through different reports:
     - **Visitors** - Unique visitors, returning visitors, visitor logs
     - **Behavior** - Page views, time on site, bounce rate, site search
     - **Acquisition** - Referrers, search engines, social media
     - **Events** - Custom events (page views, downloads, blog posts, search queries)

### Viewing Custom Events

To view custom events in Matomo:

1. Go to **Behavior → Events**
2. You'll see event categories:
   - **Page View** - Page-specific view events
   - **Blog Post** - Blog post view events
   - **Blog Search** - Search query events
   - **Downloads** - File download events

3. Click on any category to see detailed event data including:
   - Event names (specific pages, blog post slugs, search queries, file names)
   - Event counts
   - Associated page URLs

## Docker Services

Matomo runs as part of the Docker Compose stack:

- **`ps-matomo`** - Matomo application container (port 80 internally)
- **`ps-matomo-db`** - MariaDB database for Matomo data storage

Both services are on the `backend-net` network and start automatically with `docker compose up -d`.

## Troubleshooting

### Analytics Not Working

1. **Check environment variables are set:**
   ```bash
   echo $NEXT_PUBLIC_MATOMO_URL
   echo $NEXT_PUBLIC_MATOMO_SITE_ID
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for Matomo errors in Console
   - Check Network tab for requests to Matomo URL

3. **Verify Matomo is accessible:**
   - Ensure Matomo URL is reachable from your browser
   - Test: `curl https://your-matomo-domain.com/matomo.js`

4. **Check Docker services:**
   ```bash
   docker compose ps ps-matomo
   docker compose logs ps-matomo
   ```

### Events Not Showing

- Custom events may take a few minutes to appear in Matomo
- Ensure the Matomo script is loading (check Network tab)
- Verify environment variables are set correctly
- Check browser console for JavaScript errors

### Development Mode

In development, if Matomo is not configured, you'll see a console warning:
```
Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID
```

This is expected and won't affect functionality. Analytics will work once environment variables are set.

## Privacy Considerations

- Matomo is privacy-focused and GDPR compliant
- No cookies required for basic tracking (can be configured)
- IP addresses can be anonymized in Matomo settings
- Respects Do Not Track headers (can be configured)
- All data stored on your own server

## Additional Resources

- [Matomo Documentation](https://matomo.org/docs/)
- [Matomo JavaScript Tracking Guide](https://developer.matomo.org/guides/tracking-javascript-guide)

