"use client";

import Container from "@/components/containers";
import { Github, Linkedin, Twitter } from "lucide-react";
import DisplacementText from "@/components/ui/displacement-text";


export default function Contact() {
  return (
    <div className="relative flex min-h-screen justify-center font-sans overflow-hidden">
      <Container className="min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10 mx-auto">
        {/* Background Pattern & Borders */}
        <div
          className="absolute right-0 top-0 h-full w-6 border-x border-x-(--pattern-fg) 
          bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
          bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"
        ></div>

        <div
          className="absolute left-0 top-0 h-full w-6 border-x border-x-(--pattern-fg) 
          bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
          bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"
        ></div>

        <h1 className="text-neutral-900 dark:text-neutral-50 font-custom font-semibold text-3xl tracking-tight">
          <span className="link--elara">Contact</span>
        </h1>
        <p className="tracking-tight font-custom2 text-neutral-600 dark:text-neutral-400 max-w-lg text-sm md:text-base mt-2 mb-12">
          Hi there — I’m currently open to meaningful work.
        </p>

        <div className="w-full max-w-2xl p-0 md:p-0 relative z-10">
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-custom2">
                Full name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Tyler Durden"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-transparent outline-none transition-all font-custom2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-custom2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="tyler@projectmayhem.com"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-transparent outline-none transition-all font-custom2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-custom2">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="You're crazy good, never change."
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-transparent outline-none transition-all font-custom2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 resize-none"
              />
            </div>

            <button
              type="button"
              className="group relative overflow-hidden rounded-lg  w-full
                            bg-linear-to-b from-white to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 
                            border border-neutral-200 dark:border-neutral-800 
                            text-neutral-800 dark:text-neutral-200 text-sm font-medium px-6 py-2.5 
                            transition-all duration-300 
                            hover:from-neutral-50 hover:to-neutral-100 dark:hover:from-neutral-800 dark:hover:to-neutral-800
                            shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] 
                            dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <span className="relative z-10">Send message</span>
            </button>
          </form>

          <div className="mt-10   flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-custom2">
            <div className="flex items-center gap-2">
              <p>Karn Singh</p>
            </div>

            {/* Displacement Text - Visible and Hoverable */}
            {/* Displacement Text - Visible and Hoverable */}

            <div className="flex items-center gap-4">
              <Twitter size={14} className="hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer transition-colors" />
              <Linkedin size={14} className="hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer transition-colors" />
              <Github size={14} className="hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="w-full h-60 relative overflow-hidden flex items-center justify-center ">
          <DisplacementText
            text="KARN"
            fontSize={450}
            className="h-full w-full"
            lightColor="#171717"
            darkColor="#e5e5e5"
          />
        </div>


      </Container>
    </div>
  );
}
