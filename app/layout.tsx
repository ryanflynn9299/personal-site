import type { Metadata } from "next";
import { Montserrat, Open_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import React from "react";
import { ToastProvider } from "@/context/ToastContext";
import { MatomoProvider } from "@/components/common/MatomoProvider";
import { DevModeIndicator } from "@/components/common/DevModeIndicator";
import { DevControls } from "@/components/common/DevControls";

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

import { defaultMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...defaultMetadata,
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
