"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GetInTouch() {
    return (
        <div className="w-full mt-12 mb-10 relative z-10">
            <div className="flex flex-col items-start space-y-6">
                <div className="flex w-full justify-between items-center">
                    <h1 className="text-3xl md:text-3xl font-bold font-custom tracking-tight text-neutral-900 dark:text-neutral-50">
                        <span className="link--elara">Get in touch</span>
                    </h1>
                </div>

                <p className="font-custom2 text-neutral-700 dark:text-neutral-300 px-4 py-2 text-sm inline-block bg-neutral-100 dark:bg-neutral-900 border-dashed border-neutral-300 dark:border-neutral-700 border">
                    Hi there drop any question you have whether related project or anything or just want to connect
                </p>

                <div className="w-full max-w-2xl">
                    <Link href="/Contact">
                        <button
                            className="group relative overflow-hidden rounded-lg 
                            bg-linear-to-b from-white to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 
                            border border-neutral-200 dark:border-neutral-800 
                            text-neutral-800 dark:text-neutral-200 text-sm font-medium px-6 py-2.5 
                            transition-all duration-300 
                            hover:from-neutral-50 hover:to-neutral-100 dark:hover:from-neutral-800 dark:hover:to-neutral-800
                            shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] 
                            dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Send Enquiry
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 opacity-70 group-hover:opacity-100" />
                            </span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
