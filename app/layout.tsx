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

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"], // 🛠 Fix missing subsets
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sehaj.works"),
  title: {
    default: "Sehaj Preet",
    template: "%s | Sehaj Preet",
  },
  description:
    "Full-Stack + AI developer building products across web, apps, and AI solutions.",
  applicationName: "Sehaj Preet",
  authors: [{ name: "Sehaj Preet", url: "https://www.sehaj.works" }],
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
    url: "https://www.sehaj.works",
    siteName: "Sehaj Preet",
    type: "website",
    images: [
      {
        url: "/myavatar.png",
        width: 1200,
        height: 1200,
        alt: "Sehaj Preet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sehaj Preet",
    description:
      "Full-Stack + AI developer building products across web, apps, and AI solutions.",
    creator: "@sehajmakkar",
    site: "@sehajmakkar",
    images: ["/myavatar.png"],
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
        className={`${instrumentSerif.className} bg-neutral-50 antialiased transition-colors duration-300 [--pattern-fg:var(--color-neutral-200)] dark:bg-neutral-950`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Analytics />
          <SpeedInsights />
          <FractalTree />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
