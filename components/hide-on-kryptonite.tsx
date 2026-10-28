"use client";

import { usePathname } from "next/navigation";

// The Kryptonite side brings its own chrome, so the main site's navbar,
// footer and background tree step aside there.
export default function HideOnKryptonite({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/kryptonite")) return null;
  return <>{children}</>;
}
