import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import React from "react";
import { ToastProvider } from "@/context/ToastContext";
import { MatomoProvider } from "@/components/common/MatomoProvider";
import { DevModeIndicator } from "@/components/common/DevModeIndicator";
import { DevControls } from "@/components/common/DevControls";
import { utils } from "@/constants/theme";

// Font configuration according to our design document
// Critical fonts: preload and use swap for better performance
const fontHeading = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading", // Exposes this font as a CSS variable
  preload: true, // Preload critical heading font
});

const fontSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans", // Exposes this font as a CSS variable
  preload: true, // Preload critical body font
});

// Additional fonts for Mission Control view
// Non-critical fonts: use optional to reduce layout shift
const fontInter = Inter({
  subsets: ["latin"],
  display: "optional", // Non-critical, use optional to prevent blocking
  variable: "--font-inter",
  preload: false,
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "optional", // Non-critical, use optional to prevent blocking
  variable: "--font-mono",
  preload: false,
});

import { defaultMetadata } from "@/lib/seo";

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
    >
      <body className="text-slate-200 antialiased">
        <MatomoProvider />
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <DevModeIndicator />
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <DevControls />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
