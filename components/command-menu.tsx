"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Moon,
  Sun,
  Laptop,
  Search,
  Code,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Copy,
} from "lucide-react";
import { SiX, SiLinkedin, SiGithub } from "react-icons/si";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  const openExternal = React.useCallback((url: string) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.assign(url);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTypingField =
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT";

      if (!open) {
        return;
      }

      // When the command palette is open, we still want shortcuts to work
      // even if the search input is focused.
      if (e.shiftKey) {
        const key = e.key.toLowerCase();

        // Navigation
        if (key === "h") {
          e.preventDefault();
          runCommand(() => router.push("/"));
        } else if (key === "p") {
          e.preventDefault();
          runCommand(() => router.push("/projects"));
        } else if (key === "w") {
          e.preventDefault();
          runCommand(() => router.push("/blog"));
        }

        // Links
        else if (key === "x") {
          e.preventDefault();
          runCommand(() => openExternal("https://x.com/sehajmakkarr"));
        } else if (key === "l") {
          e.preventDefault();
          runCommand(() => openExternal("https://linkedin.com"));
        } else if (key === "g") {
          e.preventDefault();
          runCommand(() => openExternal("https://github.com"));
        } else if (key === "e") {
          e.preventDefault();
          runCommand(() => router.push("/Contact"));
        }

        // General
        else if (key === "c") {
          e.preventDefault();
          runCommand(() => navigator.clipboard.writeText(window.location.href));
        }

        // Theme
        else if (key === "t") {
          e.preventDefault();
          runCommand(() => setTheme("light"));
        } else if (key === "d") {
          e.preventDefault();
          runCommand(() => setTheme("dark"));
        } else if (key === "s") {
          e.preventDefault();
          runCommand(() => setTheme("system"));
        }
      } else if (isTypingField) {
        // Allow normal typing when no shortcut is being used
        return;
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, openExternal, runCommand, router, setTheme]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group hidden items-center gap-2 px-2 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 sm:flex dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <span className="inline-block text-xs text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300">
          <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-1.5 font-mono text-[10px] font-medium opacity-100 select-none dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs">⌘</span>K
          </kbd>
        </span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="font-custom2"
      >
        {/* Header Section */}
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Home
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              About me and what I&apos;m up to
            </p>
          </div>
        </div>

        <CommandInput
          placeholder="Search for actions..."
          className="font-custom2 border-none focus:ring-0"
        />

        <CommandList className="font-custom2 p-2">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
              className="rounded-lg py-3"
            >
              <LayoutDashboard className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Go to Home</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + H
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/projects"))}
              className="rounded-lg py-3"
            >
              <Code className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Go to Projects</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + P
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/blog"))}
              className="rounded-lg py-3"
            >
              <FileText className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Go to Writing</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + W
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="Links">
            <CommandItem
              onSelect={() =>
                runCommand(() => openExternal("https://x.com/sehajmakkarr"))
              }
              className="rounded-lg py-3"
            >
              <SiX className="mr-2 h-4 w-4 text-neutral-500" />
              <span>X Profile</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + X
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => openExternal("https://linkedin.com"))
              }
              className="rounded-lg py-3"
            >
              <SiLinkedin className="mr-2 h-4 w-4 text-neutral-500" />
              <span>LinkedIn Profile</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + L
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => openExternal("https://github.com"))
              }
              className="rounded-lg py-3"
            >
              <SiGithub className="mr-2 h-4 w-4 text-neutral-500" />
              <span>GitHub Profile</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + G
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/Contact"))}
              className="rounded-lg py-3"
            >
              <Mail className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Email</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + E
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="General">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  navigator.clipboard.writeText(window.location.href);
                })
              }
              className="rounded-lg py-3"
            >
              <Copy className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Copy Link</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + C
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runCommand(() => setTheme("light"))}
              className="rounded-lg py-3"
            >
              <Sun className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Light Mode</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + T
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme("dark"))}
              className="rounded-lg py-3"
            >
              <Moon className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Dark Mode</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + D
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme("system"))}
              className="rounded-lg py-3"
            >
              <Laptop className="mr-2 h-4 w-4 text-neutral-500" />
              <span>System</span>
              <CommandShortcut className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                shift + S
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex items-center gap-4 text-[10px] text-neutral-500">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <ArrowDown className="h-3 w-3" />
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              <span>to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="font-mono">esc</span>
            <span>to close</span>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
