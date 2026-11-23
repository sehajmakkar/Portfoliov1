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
import { SITE, SITE_URL } from "@/lib/site";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"], // 🛠 Fix missing subsets
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [
    "Sehaj Preet",
    "Sehaj Makkar",
    "sehajmakkar",
    "AI engineer",
    "Backend engineer",
    "Full stack developer",
    "AI agents",
    "LLM evals",
    "Next.js",
    "TypeScript",
    "Python",
    "Delhi",
  ],
  // canonical is set per page (see lib/seo.ts); a root canonical would be
  // inherited by every route and mark them all as copies of the home page
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/myavatar.png",
  },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    siteName: SITE.name,
    type: "website",
    locale: "en_IN",
    // image: app/opengraph-image.jpg (file convention)
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
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
