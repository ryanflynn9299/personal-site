"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {Menu, X, Atom} from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Vitae", href: "/vitae" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

// The text next to my name in the header
const epithet = "// Building Scalable Systems";
// const epithet2 = "// Crafting Code and Content";
// const epithet3 = "// Java • Python • PostgreSQL ";

// Home icon component - placeholder for custom SVG
// TODO: Replace with custom SVG icon when ready
const HomeIcon = () => {
  // Placeholder: code-themed icon from lucide-react
  // Replace this entire component with your custom SVG when ready
  return (
    <Atom className="h-5 w-5 text-sky-400 sm:h-6 sm:w-6" aria-hidden="true" />
  );
  
  // Future SVG implementation example:
  // return (
  //   <svg className="h-5 w-5 text-sky-400 sm:h-6 sm:w-6" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
  //     {/* Your SVG path here */}
  //   </svg>
  // );
};

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };
    // Listen for navigation events
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm shadow-md shadow-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Icon, Name and Epithet */}
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-2.5">
              <Link
                href="/"
                className="flex items-center gap-2 flex-shrink-0 text-lg font-bold text-slate-50 font-heading sm:text-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon />
                <span>Ryan Flynn</span>
              </Link>
              <span className="hidden truncate text-xs text-slate-400 md:inline-block md:text-sm">
                {epithet}
              </span>
            </div>

            {/* Desktop Navigation - Show on sm and above */}
            <nav className="hidden items-center sm:flex">
              <ul className="flex items-center gap-4 xl:gap-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-slate-300 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus:visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Menu Button - Show below sm breakpoint */}
            <button
              type="button"
              className="flex items-center justify-center rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 sm:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Bubble Dropdown from Top Right */}
      {mobileMenuOpen && (
        <>
          {/* Solid Backdrop - High contrast, no blur issues */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/95 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Bubble - Fixed size, deploys from bottom edge of menu button */}
          <nav
            className="fixed top-24 right-0 z-50 w-64 rounded-tl-lg rounded-bl-lg rounded-br-lg bg-slate-800 shadow-2xl sm:hidden menu-bubble-animation"
            aria-label="Mobile navigation"
            role="dialog"
            aria-modal="true"
          >
            {/* Navigation Links */}
            <ul className="flex flex-col py-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-sky-300 focus:outline-none focus:bg-slate-700 focus:text-sky-300 focus:ring-2 focus:ring-inset focus:ring-sky-400 first:rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
