"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// A link that shows a screenshot of the site on hover (or keyboard focus).
// Touch screens just follow the link: there's no hover to show it on.
export default function LinkPreview({
  href,
  image,
  className,
  children,
}: {
  href: string;
  image: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const domain = new URL(href).hostname.replace(/^www\./, "");
  const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => canHover() && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </a>
      <AnimatePresence>
        {open && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 block w-64 -translate-x-1/2"
          >
            <motion.span
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="block rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="block overflow-hidden rounded-md border border-neutral-100 dark:border-neutral-800">
                <Image src={image} alt="" width={640} height={400} className="block h-auto w-full" />
              </span>
              <span className="font-plex mt-1.5 block px-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                {domain} ↗
              </span>
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
