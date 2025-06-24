import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const openSans = Open_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-open-sans",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-montserrat",
    weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
    title: {
        default: "John Doe | Software Engineer & Writer",
        template: "%s | John Doe",
    },
    description: "The personal portfolio and blog of John Doe, a passionate software engineer.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${openSans.variable} ${montserrat.variable}`}>
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