import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/Navbar";
import { Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import FractalTree from "@/components/ui/fractal-tree";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/smooth-scroll";
import HideOnKryptonite from "@/components/hide-on-kryptonite";
import { fontVariables } from "@/lib/fonts";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"], // 🛠 Fix missing subsets
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sehaj.tech"),
  title: {
    default: "Sehaj Preet",
    template: "%s | Sehaj Preet",
  },
  description:
    "Full-Stack + AI developer building products across web, apps, and AI solutions.",
  applicationName: "Sehaj Preet",
  authors: [{ name: "Sehaj Preet", url: "https://www.sehaj.tech" }],
  creator: "Sehaj Preet",
  publisher: "Sehaj Preet",
  keywords: [
    "Sehaj Preet",
    "Sehaj Makkar",
    "sehajmakkar",
    "Full Stack Developer",
    "AI Developer",
    "Freelance",
    "Next.js",
    "TypeScript",
    "Portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/myavatar.png",
  },
  openGraph: {
    title: "Sehaj Preet",
    description:
      "Full-Stack + AI developer building products across web, apps, and AI solutions.",
    url: "https://www.sehaj.tech",
    siteName: "Sehaj Preet",
    type: "website",
    // image: app/opengraph-image.jpg (file convention)
  },
  twitter: {
    card: "summary_large_image",
    title: "Sehaj Preet",
    description:
      "Full-Stack + AI developer building products across web, apps, and AI solutions.",
    creator: "@kryptokodes",
    site: "@kryptokodes",
    // image: app/twitter-image.jpg (file convention)
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 🛠 Important for dark mode */}
      <body
        className={`${instrumentSerif.className} ${fontVariables} bg-neutral-50 antialiased transition-colors duration-300 [--pattern-fg:var(--color-neutral-200)] dark:bg-neutral-950`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SmoothScroll>
            <Analytics />
            <SpeedInsights />
            <HideOnKryptonite>
              <FractalTree />
              <Navbar />
            </HideOnKryptonite>
            <main className="min-h-screen">{children}</main>
            <HideOnKryptonite>
              <Footer />
            </HideOnKryptonite>
            <Toaster />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
