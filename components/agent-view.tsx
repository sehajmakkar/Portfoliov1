"use client";

import { useEffect, useState } from "react";
import { Bot, Check, Copy, User } from "lucide-react";

// "View: Human | Agent". Agent view shows the site the way an AI reads it:
// the same markdown served at /llms.txt (and at / for Accept: text/markdown).
export default function AgentView() {
  const [agent, setAgent] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!agent) return;
    if (text === null)
      fetch("/llms.txt")
        .then((r) => r.text())
        .then(setText)
        .catch(() => setText("Couldn't load /llms.txt."));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAgent(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [agent, text]);

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const btn = (on: boolean) =>
    `inline-flex items-center gap-1.5 px-2.5 py-1.5 transition-colors ${on ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`;

  return (
    <>
      {agent && (
        <div
          data-lenis-prevent
          role="dialog"
          aria-label="Agent view: this site as markdown"
          className="fixed inset-0 z-[60] overflow-y-auto bg-neutral-50 dark:bg-neutral-950"
        >
          <div className="font-plex mx-auto max-w-3xl px-6 pt-10 pb-28 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-neutral-300 pb-3 text-[11px] text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <span>GET / · Accept: text/markdown · what an AI agent reads</span>
              <span className="flex gap-3">
                <button onClick={copy} className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100">
                  {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <a href="/llms.txt" target="_blank" className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100">
                  /llms.txt
                </a>
              </span>
            </div>
            {text === null ? (
              <p>Loading…</p>
            ) : (
              <div className="whitespace-pre-wrap">
                {text.split("\n").map((line, i) =>
                  line.startsWith("#") ? (
                    <div key={i} className="mt-4 font-medium text-neutral-950 dark:text-neutral-50">
                      {line}
                    </div>
                  ) : line.startsWith(">") ? (
                    <div key={i} className="text-neutral-500 dark:text-neutral-400">
                      {line}
                    </div>
                  ) : (
                    <div key={i}>{line || " "}</div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        role="group"
        aria-label="View this site as"
        className="font-plex fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center border border-neutral-300 bg-neutral-50/90 text-[10px] tracking-[0.16em] uppercase backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90"
      >
        <span className="px-2.5 text-neutral-500 dark:text-neutral-400">View</span>
        <button aria-pressed={!agent} onClick={() => setAgent(false)} className={btn(!agent)}>
          <User size={12} aria-hidden /> Human
        </button>
        <button aria-pressed={agent} onClick={() => setAgent(true)} className={btn(agent)}>
          <Bot size={12} aria-hidden /> Agent
        </button>
      </div>
    </>
  );
}
