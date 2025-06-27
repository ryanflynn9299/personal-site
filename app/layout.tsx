import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import React from "react";

// Font configuration according to our design document
const fontHeading = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-heading', // Exposes this font as a CSS variable
});

const fontSans = Open_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans',   // Exposes this font as a CSS variable
});

export const metadata: Metadata = {
    title: {
        default: "Ryan Flynn | Software Engineer & Tech Enthusiast",
        template: "%s | Ryan Flynn",
    },
    description: "The personal portfolio and blog of Ryan Flynn, a passionate software engineer.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${fontHeading.variable} ${fontSans.variable}`}>
        <body className="bg-slate-900 text-slate-200 antialiased">
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
        </body>
        </html>
    );
}