"use client";

import Link from "next/link";
// import { usePathname } from "next/navigation";
import { Github, Linkedin, Twitter } from "lucide-react";
import { runtime } from "@/lib/config";
import { SITE_VERSION } from "@/lib/site/seo";

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/ryanflynn9299", // Replace with actual URL
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/ryan-flynn04/", // Replace with actual URL
    icon: Linkedin,
  },
  {
    name: "Twitter",
    href: "https://twitter.com", // Replace with actual URL
    icon: Twitter,
  },
];
const footerNav = [
  { name: "About", href: "/about", is_active: true, devOnly: false },
  { name: "Blog", href: "/blog", is_active: true, devOnly: false },
  { name: "Quotes", href: "/quotes", is_active: true, devOnly: true },
  { name: "Vitae", href: "/vitae", is_active: true, devOnly: false },
  { name: "Contact", href: "/contact", is_active: true, devOnly: false },
  // Example for future extensibility
  { name: "Talks", href: "/talks", is_active: false, devOnly: false },
  {
    name: "Privacy Policy",
    href: "/privacy",
    is_active: false,
    devOnly: false,
  },
];

export interface FooterNavItem {
  name: string;
  href: string;
  is_active?: boolean;
  devOnly?: boolean;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: React.ElementType<{ className?: string }>;
}

export function Footer() {
  // const pathname = usePathname();
  // const isProjectsCabinetPage = pathname === "/projects-cabinet";

  return (
    <footer className="border-t border-slate-700 bg-slate-800 relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold font-heading text-slate-50">
              Ryan Flynn
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              A personal site for showcasing projects, sharing thoughts, and
              documenting my journey in software development.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Navigate
              </h4>
              <ul className="mt-4 space-y-2">
                {footerNav
                  .filter((item: FooterNavItem) => {
                    // Filter by active status
                    if (!item.is_active) {
                      return false;
                    }
                    // Filter by dev-only status (use dev mode UI toggle)
                    if (item.devOnly && !runtime.previewFeatures) {
                      return false;
                    }
                    return true;
                  })
                  .map((item: FooterNavItem) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 px-2 py-1 -ml-2 text-base text-slate-300 hover:text-sky-300 rounded-md"
                        data-testid={`footer-nav-link-${item.name.toLowerCase()}`}
                      >
                        <span>{item.name}</span>
                        {item.devOnly && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                            DEV
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                {/* Dev-only link */}
                {runtime.previewFeatures && (
                  <li>
                    <Link
                      href="/projects-cabinet"
                      className="flex items-center gap-2 text-base text-slate-300 hover:text-sky-300"
                    >
                      <span>Project Cabinet</span>
                      <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                        DEV
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Legal
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/policies?tab=privacy"
                    className="inline-block px-2 py-1 -ml-2 text-base text-slate-300 hover:text-sky-300 rounded-md"
                    data-testid="footer-privacy-link"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policies?tab=terms"
                    className="inline-block px-2 py-1 -ml-2 text-base text-slate-300 hover:text-sky-300 rounded-md"
                    data-testid="footer-terms-link"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Connect
              </h4>
              <ul className="mt-4 flex space-x-4">
                {socialLinks.map((link: SocialLink) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-sky-300"
                    >
                      <span className="sr-only">{link.name}</span>
                      <link.icon className="h-6 w-6" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-8 grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
          <div className="hidden sm:block" />
          <p className="text-sm text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Ryan Flynn. All rights reserved.
          </p>
          <div className="flex justify-center sm:justify-end">
            <Link
              href="#"
              className="group flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-400 transition-all hover:border-sky-500/30 hover:bg-slate-700/50 hover:text-sky-400"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-20"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500/50"></span>
              </span>
              v{SITE_VERSION}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
