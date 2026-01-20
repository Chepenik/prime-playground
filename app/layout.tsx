import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Prime Playground",
  description: "Explore the fascinating world of prime numbers through interactive visualizations, games, and creative tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-auto pb-16 lg:pb-0">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
