import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import React from "react";
import { ToastProvider } from "@/context/ToastContext";
import { MatomoProvider } from "@/components/matomo/MatomoProvider";
import { DevModeIndicator } from "@/components/common/DevModeIndicator";
import { FloatingUtilityDock } from "@/components/common/FloatingUtilityDock";
import { utils } from "@/constants/theme";
import { runtime } from "@/lib/config";

// Font configuration according to our design document
const fontHeading = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading", // Exposes this font as a CSS variable
});

const fontSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans", // Exposes this font as a CSS variable
});

// Additional fonts for Mission Control view
const fontInter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

import { defaultMetadata } from "@/lib/site/seo";

export const metadata: Metadata = {
  ...defaultMetadata,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: utils.seo.light },
    { media: "(prefers-color-scheme: dark)", color: utils.seo.dark }, // slate-900
  ],
  colorScheme: "dark light", // Supports both dark and light modes
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontSans.variable} ${fontInter.variable} ${fontMono.variable}`}
      data-runtime-mode={runtime.mode}
      data-test-mode={runtime.isTest ? "true" : "false"}
    >
      <body className="text-slate-200 antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sky-500 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          Skip to main content
        </a>
        <MatomoProvider />
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            {runtime.isDevelopment && <DevModeIndicator />}
            <Header />
            <main id="main-content" className="flex-grow">
              {children}
            </main>
            <Footer />
            <FloatingUtilityDock />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
