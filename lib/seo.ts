/**
 * SEO Configuration and Utilities
 * Centralized SEO settings for consistent metadata across the site
 */

// Base URL configuration - use environment variable if available, otherwise default
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ryanflynn.org";

// Feature flags for SEO
export const ENABLE_BLOG_SEO = false; // Set to true when blog has meaningful content

// Site metadata
export const SITE_NAME = "Ryan Flynn";
export const SITE_DESCRIPTION =
  "The personal portfolio and blog of Ryan Flynn, a passionate software engineer and tech enthusiast.";
export const SITE_AUTHOR = "Ryan Flynn";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`; // You may want to create this

// Social media profiles (update these with your actual profiles)
export const SOCIAL_PROFILES = {
  twitter: "https://twitter.com", // Update with your Twitter handle
  github: "https://github.com", // Update with your GitHub username
  linkedin: "https://linkedin.com", // Update with your LinkedIn profile
};

// Default metadata for pages
export const defaultMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Software Engineer & Tech Enthusiast`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Ryan Flynn",
    "Software Engineer",
    "Web Development",
    "Portfolio",
    "Blog",
    "Technology",
    "Programming",
  ],
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  applicationName: SITE_NAME, // App name for PWA and mobile
  // Note: viewport, themeColor, and colorScheme are now exported separately
  // via the viewport export in app/layout.tsx
  // Format detection - disable automatic detection of phone numbers, addresses, etc.
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  // Icons configuration - Next.js App Router will use app/icon.png and app/apple-icon.png
  // These should be created as files, but we can also reference public icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/apple-touch-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  // Manifest for PWA (if you create app/manifest.ts)
  manifest: "/manifest.json", // Will be created as app/manifest.ts
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Software Engineer & Tech Enthusiast`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Software Engineer & Tech Enthusiast`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: SOCIAL_PROFILES.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  // Referrer policy for privacy
  referrer: "origin-when-cross-origin" as const,
  // Category for content classification
  category: "portfolio",
};

/**
 * Helper function to generate page-specific metadata
 */
export function generatePageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
