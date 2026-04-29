"use client";

import React from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import { SiGmail } from "react-icons/si";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function GetInTouch() {
  return (
    <div className="relative z-10 mt-8 mb-10 w-full">
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <div className="flex w-full items-center justify-between py-2">
        <h1 className="font-custom text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
          <span className="link--elara">Get in touch</span>
        </h1>
      </div>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      <div className="flex flex-col items-start space-y-6">
        <p className="font-custom2 mt-3 mb-6 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-2 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          Hi there — I’m currently open to meaningful work.
        </p>

        <div className="flex w-full max-w-2xl gap-4">
          <Link
            href="mailto:sehajmakkar@gmail.com?subject=New%20Project%20Inquiry&body=Hi%20Sehaj%2C%0A%0AI%E2%80%99d%20love%20to%20connect%20about%20%5Bproject%20name%2Frole%5D.%0A%0AContext%3A%0A-%20Company%2FTeam%3A%0A-%20Timeline%3A%0A-%20Budget%2FScope%3A%0A%0AThanks!"
            target="_blank"
            rel="noreferrer"
            aria-label="Shoot a DM on Gmail"
          >
            <AnimatedButton className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800">
              <span className="relative z-10 flex items-center gap-2">
                <SiGmail className="h-4 w-4" />
                Shoot a DM
              </span>
            </AnimatedButton>
          </Link>

          <Link href="https://cal.com/sehajm/meeting" target="_blank">
            <AnimatedButton className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800">
              <span className="relative z-10 flex items-center gap-2">
                Book a call
                <Phone className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </span>
            </AnimatedButton>
          </Link>
        </div>
      </div>

      {/* Decorative Grid Pattern */}
      <div
        className="pointer-events-none absolute -right-2 -bottom-12 -z-10 h-40 w-80 opacity-60 md:-right-14 md:-bottom-20 dark:opacity-40"
        style={{
          maskImage:
            "radial-gradient(circle at bottom right, black, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at bottom right, black, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:24px_24px] bg-right-bottom shadow-[inset_20px_20px_40px_rgba(255,255,255,0.8)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] dark:shadow-[inset_20px_20px_40px_rgba(10,10,10,0.8)]"></div>
      </div>
    </div>
  );
}
