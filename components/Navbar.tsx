"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/containers";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ThemeToggleButton } from "@/components/ui/skiper-ui/skiper26";
import { CommandMenu } from "@/components/command-menu";

const Navbar = () => {
  const navItems = [
    { title: "Projects", href: "/projects" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/Contact" },
  ];

  const [hovered, setHovered] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === "undefined") return;
      setIsDesktop(window.innerWidth >= 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <Container>
      <motion.nav
        initial={false}
        animate={{
          boxShadow: scrolled ? "var(--shadow-input)" : "none",
          width: scrolled
            ? isDesktop
              ? "40rem"
              : "90%"
            : isDesktop
              ? "48rem"
              : "100%",
          top: scrolled ? 12 : 0,
          borderRadius: "2.5rem",
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        className="font-custom fixed inset-x-0 top-0 z-50 mx-auto flex w-full items-center justify-between bg-neutral-50/80 px-4 py-3 tracking-wide text-neutral-900 backdrop-blur-lg transition-colors duration-300 dark:bg-neutral-950/70 dark:text-neutral-50"
      >
        <Link
          href="/"
          className="transition-opacity duration-300 hover:opacity-75"
        >
          <Image
            className="h-9 w-9 rounded-full shadow-sm"
            src="/Avatar11.jpg"
            width={100}
            height={100}
            alt="Avatar"
          />
        </Link>

        {/* Navigation links on the right */}
        <div
          className="ml-auto flex items-center justify-end gap-2"
          onMouseLeave={() => setHovered(null)}
        >
          {navItems.map((item, idx) => (
            <Link
              className="font-custom relative px-3 py-1.5 text-md tracking-normal text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
              href={item.href}
              key={idx}
              onMouseEnter={() => setHovered(idx)}
            >
              {hovered === idx && (
                <motion.span
                  layoutId="nav-item-pill"
                  className="absolute inset-0 -z-10 rounded-md bg-neutral-300/25 dark:bg-neutral-800/50"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {item.title}
            </Link>
          ))}

          {/* Separator */}
          <div className="mx-1 h-5 w-px bg-neutral-300/40 dark:bg-neutral-700/50" />

          {/* Theme Toggle */}
          <div
            className="relative px-1 py-1"
            onMouseEnter={() => setHovered(3)}
          >
            {hovered === 3 && (
              <motion.span
                layoutId="nav-item-pill"
                className="absolute inset-0 -z-10 rounded-md bg-neutral-300/25 dark:bg-neutral-800/50"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <motion.div
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
            >
              <ThemeToggleButton variant="circle" start="top-right" />
            </motion.div>
          </div>

          {/* Command Menu */}
          {/* <div
            className="relative hidden px-1 py-1 sm:block"
            onMouseEnter={() => setHovered(4)}
          >
            {hovered === 4 && (
              <motion.span
                layoutId="nav-item-pill"
                className="absolute inset-0 -z-10 rounded-md bg-neutral-300/25 dark:bg-neutral-800/50"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <CommandMenu />
          </div> */}
        </div>
      </motion.nav>
    </Container>
  );
};

export default Navbar;
