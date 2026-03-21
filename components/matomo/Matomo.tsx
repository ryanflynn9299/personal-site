/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface MatomoProps {
  matomoUrl?: string;
  siteId?: string;
}

/**
 * Matomo Analytics Component
 *
 * Tracks:
 * - Page views (automatic)
 * - Unique visitors (automatic)
 * - Visit duration (automatic)
 * - Referrers (automatic)
 * - Device & browser info (automatic)
 * - Custom page-specific events
 */
export function Matomo({ matomoUrl, siteId }: MatomoProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only initialize if Matomo URL and Site ID are provided
    if (!matomoUrl || !siteId) {
      return;
    }

    // Initialize Matomo tracking
    if (typeof window !== "undefined" && !(window as any)._paq) {
      (window as any)._paq = [];

      // Configure Matomo
      (window as any)._paq.push(["setTrackerUrl", `${matomoUrl}/matomo.php`]);
      (window as any)._paq.push(["setSiteId", siteId]);

      // Enable features
      (window as any)._paq.push(["enableLinkTracking"]);
      (window as any)._paq.push(["enableHeartBeatTimer", 30]); // Track time on page

      // Load Matomo script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${matomoUrl}/matomo.js`;
      document.head.appendChild(script);
    }
  }, [matomoUrl, siteId]);

  // Track page views on route change
  useEffect(() => {
    if (
      !matomoUrl ||
      !siteId ||
      typeof window === "undefined" ||
      !(window as any)._paq
    ) {
      return;
    }

    // Get full URL with search params
    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Track page view
    (window as any)._paq.push(["setCustomUrl", url]);
    (window as any)._paq.push(["setDocumentTitle", document.title]);
    (window as any)._paq.push(["trackPageView"]);

    // Track page-specific events
    trackPageSpecificEvents(pathname);
  }, [pathname, searchParams, matomoUrl, siteId]);

  return null;
}

/**
 * Track page-specific events based on the current route
 */
function trackPageSpecificEvents(pathname: string) {
  if (typeof window === "undefined" || !(window as any)._paq) {
    return;
  }

  const _paq = (window as any)._paq;

  // Track homepage views
  if (pathname === "/") {
    _paq.push(["trackEvent", "Page View", "Homepage", pathname]);
  }
  // Track About page views
  else if (pathname === "/about") {
    _paq.push(["trackEvent", "Page View", "About Page", pathname]);
  }
  // Track Vitae/Resume page views
  else if (pathname === "/vitae") {
    _paq.push(["trackEvent", "Page View", "Vitae Page", pathname]);
  }
  // Track Contact page views
  else if (pathname === "/contact") {
    _paq.push(["trackEvent", "Page View", "Contact Page", pathname]);
  }
  // Track Blog listing page views
  else if (pathname === "/blog") {
    _paq.push(["trackEvent", "Page View", "Blog Listing", pathname]);
  }
  // Track individual blog post views
  else if (pathname.startsWith("/blog/")) {
    const slug = pathname.replace("/blog/", "");
    _paq.push(["trackEvent", "Blog Post", "View", slug]);
  }
}

/**
 * Track custom events (to be called from other components)
 */
export function trackMatomoEvent(
  category: string,
  action: string,
  name?: string,
  value?: number
) {
  if (typeof window !== "undefined" && (window as any)._paq) {
    const params: any[] = ["trackEvent", category, action];
    if (name) {
      params.push(name);
    }
    if (value !== undefined) {
      params.push(value);
    }
    (window as any)._paq.push(params);
  }
}

/**
 * Track file downloads
 */
export function trackDownload(fileName: string, fileType: string = "PDF") {
  trackMatomoEvent("Downloads", "File Download", `${fileType}: ${fileName}`);
}

/**
 * Track blog post views (can be called from blog post pages for additional tracking)
 */
export function trackBlogPostView(slug: string, title: string) {
  trackMatomoEvent("Blog Post", "View", slug, undefined);
  // Also track with title for better reporting
  trackMatomoEvent("Blog Post", "View with Title", title);
}

/**
 * Track blog search queries
 */
export function trackBlogSearch(query: string, resultCount: number) {
  trackMatomoEvent("Blog Search", "Query", query, resultCount);
}
