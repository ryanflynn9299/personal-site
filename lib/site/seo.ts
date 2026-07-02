/**
 * SEO Configuration and Utilities
 * Centralized SEO settings for consistent metadata across the site
 */

import { config } from "../config";

// Base URL configuration - use environment variable if available, otherwise default
export const SITE_URL = config.siteUrl;

// Feature flags for SEO
export const ENABLE_BLOG_SEO = false; // Set to true when blog has meaningful content

// Site metadata
export const SITE_NAME = "Ryan Flynn";
export { SITE_VERSION } from "./version";
export const SITE_DESCRIPTION =
  "The personal portfolio and blog of Ryan Flynn, a passionate software engineer and tech enthusiast.";
export const SITE_AUTHOR = "Ryan Flynn";

/** Site identity asset for JSON-LD publisher logo (no dedicated OG image). */
export const SITE_IDENTITY_IMAGE = `${SITE_URL}/apple-touch-icon.svg`;

// Social media profiles (update these with your actual profiles)
export const SOCIAL_PROFILES = {
  twitter: "https://twitter.com", // Update with your Twitter handle
  github: "https://github.com", // Update with your GitHub username
  linkedin: "https://linkedin.com", // Update with your LinkedIn profile
};

function buildSocialMetadata(image: string | undefined, alt: string) {
  if (!image) {
    return {
      twitter: {
        card: "summary" as const,
      },
    };
  }

  return {
    openGraph: {
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [image],
    },
  };
}

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
  applicationName: SITE_NAME,
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Software Engineer & Tech Enthusiast`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary" as const,
    title: `${SITE_NAME} | Software Engineer & Tech Enthusiast`,
    description: SITE_DESCRIPTION,
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
  referrer: "origin-when-cross-origin" as const,
  category: "portfolio",
};

/**
 * Helper function to generate page-specific metadata.
 * Social images are included only when an explicit `image` is provided —
 * there is no site-wide default OG image.
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
  const social = buildSocialMetadata(image, title);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...social.openGraph,
    },
    twitter: {
      title,
      description,
      ...social.twitter,
    },
    alternates: {
      canonical: url,
    },
  };
}
