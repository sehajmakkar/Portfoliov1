"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { FileText, Github, Linkedin, Mail, Phone } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { ThemeToggleButton } from "@/components/ui/skiper-ui/skiper26";
import { skillGroups } from "@/components/skills";
import { experience } from "@/lib/experience";
import { featuredProjects } from "@/lib/projects-data";
import { levelScale, sliceRange, toWeeks, type ContributionData } from "@/lib/contributions";
import { SITE } from "@/lib/site";
import { startSwarm, type Role, type SwarmHandle, type SwarmStats } from "./engine";

// The Agent view: the same portfolio, assembled piece by piece by a crew of
// cursors. Every data-b element is one piece (see engine.ts). It renders once
// and never re-renders, so the engine can own inline styles safely.

const HAIR = "bg-neutral-300 dark:bg-neutral-800";
const LABEL = "font-plex text-[11px] text-neutral-500 dark:text-neutral-400";
const MUTED = "text-neutral-600 dark:text-neutral-400";
const H2 = "font-custom text-4xl leading-[1.05] font-bold tracking-tight text-neutral-950 md:text-5xl dark:text-neutral-50";

const METRICS = [
  { n: "<2 min", t: "to export 100K+ records at PowerPlay, down from 7+" },
  { n: "95K+", t: "records rechecked by a dedup engine I built there" },
  { n: "92%", t: "of first wrong steps found by Auto-Blame, on 50 planted bugs" },
  { n: "97%", t: "Recall@5 on McAgent's memory search" },
];

const CREW: { role: Role; job: string }[] = [
  { role: "layout", job: "drags out boxes" },
  { role: "type", job: "types the copy" },
  { role: "pen", job: "draws the rules" },
  { role: "image", job: "places screenshots" },
  { role: "review", job: "nudges what's off" },
];

function HLine({ className = "" }: { className?: string }) {
  return <i aria-hidden data-b="hline" className={`absolute left-1/2 block h-px w-screen -translate-x-1/2 ${HAIR} ${className}`} />;
}
function VLine({ className = "" }: { className?: string }) {
  return <i aria-hidden data-b="vline" className={`absolute block w-px ${HAIR} ${className}`} />;
}

function Section({ name, id, children, className = "" }: { name: string; id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} data-section={name} className={`relative ${className}`}>
      <HLine className="top-0" />
      <VLine className="top-0 left-0 h-full" />
      <VLine className="top-0 right-0 h-full" />
      {children}
    </section>
  );
}

const btn =
  "inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors";
const btnDark = `${btn} border-neutral-900 bg-neutral-900 text-neutral-50 hover:bg-neutral-700 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-300`;
const btnLight = `${btn} border-neutral-300 text-neutral-900 hover:border-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-neutral-300`;

const MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent("Hello from sehaj.tech")}`;

export default function AgentPage({
  contributions,
  onReady,
  onStats,
}: {
  contributions: ContributionData | null;
  onReady: (h: SwarmHandle | null) => void;
  onStats: (s: SwarmStats) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const cb = useRef({ onReady, onStats });

  const weeks = useMemo(() => (contributions ? toWeeks(sliceRange(contributions, "last")) : []), [contributions]);
  const level = useMemo(() => levelScale(contributions ? sliceRange(contributions, "last") : []), [contributions]);

  useEffect(() => {
    const el = root.current!;
    const { onReady, onStats } = cb.current;
    // reduced motion: the finished page, no cursors
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.remove("swarm");
      return;
    }
    const live = (k: string) => [...el.querySelectorAll<HTMLElement>(`[data-live="${k}"]`)];
    const nodes = { count: live("count"), agents: live("agents"), secs: live("secs"), bar: live("bar") };
    const roles = CREW.map(({ role }) => ({ role, n: live(role) }));
    const handle = startSwarm(el, canvas.current!, {
      intro: intro.current,
      onStats: (s) => {
        nodes.count.forEach((n) => (n.textContent = `${s.placed}/${s.total}`));
        nodes.agents.forEach((n) => (n.textContent = String(s.agents)));
        nodes.secs.forEach((n) => (n.textContent = String(Math.round(s.seconds))));
        nodes.bar.forEach((n) => (n.style.transform = `scaleX(${s.total ? s.placed / s.total : 0})`));
        roles.forEach(({ role, n }) =>
          n.forEach((e) => {
            e.textContent = s.done ? "done" : s.busy[role] ? `● ${s.busy[role]} working` : "○ waiting";
          }),
        );
        onStats(s);
      },
    });
    onReady(handle);
    return () => {
      handle.destroy();
      onReady(null);
    };
  }, []);

  return (
    <>
      <div ref={root} className="swarm font-custom2 relative overflow-x-clip bg-neutral-50 pb-28 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <div data-origin className="relative mx-auto max-w-5xl px-3 sm:px-8 lg:px-0">
          {/* header */}
          <header data-section="header" className="relative">
            <VLine className="top-0 left-0 h-full" />
            <VLine className="top-0 right-0 h-full" />
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
              <a href="#agent-top" data-b="text" className="text-base font-semibold tracking-tight">
                sehaj.
              </a>
              <nav aria-label="Sections" className={`flex items-center gap-5 text-sm ${MUTED}`}>
                {[["Work", "#a-work"], ["Experience", "#a-experience"], ["Stack", "#a-stack"], ["Contact", "#a-contact"]].map(([t, h]) => (
                  <a key={t} href={h} data-b="text" className="hidden hover:text-neutral-950 sm:block dark:hover:text-neutral-50">
                    {t}
                  </a>
                ))}
                <span data-b="pop" className="inline-flex">
                  <ThemeToggleButton variant="circle" start="top-right" className="h-5 w-5" />
                </span>
              </nav>
            </div>
          </header>

          {/* hero */}
          <Section name="hero" id="agent-top">
            <div className="grid gap-10 py-14 md:grid-cols-[1.35fr_1fr] md:py-20 px-4 sm:px-6 lg:px-10">
              <div>
                <h1 data-b="text" className="font-custom text-5xl leading-[1.02] font-bold tracking-tight text-balance text-neutral-950 md:text-6xl dark:text-neutral-50">
                  I build AI agents, evals and the backends they run on.
                </h1>
                <p data-b="text" className={`mt-6 max-w-md text-base leading-relaxed ${MUTED}`}>
                  {SITE.name}. Previously at 3 startups: Perf, PowerPlay and Reslink. Open to AI and backend roles.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a data-b="box" href={SITE.resume} target="_blank" rel="noopener" className={btnDark}>
                    <FileText size={15} aria-hidden /> <span data-b="text">Resume</span>
                  </a>
                  <a data-b="box" href={MAIL} className={btnLight}>
                    <Mail size={15} aria-hidden /> <span data-b="text">Email me</span>
                  </a>
                </div>
              </div>

              {/* live crew panel */}
              <div data-b="box" className="self-start rounded-lg motion-reduce:hidden border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-baseline justify-between">
                  <span data-b="text" className="font-plex text-xs text-neutral-900 dark:text-neutral-100">
                    portfolio.build()
                  </span>
                  <span data-b="text" className={LABEL}>
                    <span data-live="agents">0</span> cursors
                  </span>
                </div>
                <ul className="mt-3">
                  {CREW.map(({ role, job }) => (
                    <li key={role} className="flex items-baseline justify-between gap-3 border-t border-neutral-200 py-2 text-xs dark:border-neutral-800">
                      <span data-b="text">
                        <span className="font-plex">{role}</span> <span className={MUTED}>{job}</span>
                      </span>
                      <span data-b="pop" data-live={role} className={`font-plex shrink-0 text-[11px] tabular-nums ${MUTED}`}>
                        ○ waiting
                      </span>
                    </li>
                  ))}
                </ul>
                <div data-b="box" className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div data-live="bar" className="bg-brand h-full w-full origin-left" style={{ transform: "scaleX(0)" }} />
                </div>
                <p data-b="text" className={`mt-2 ${LABEL}`}>
                  <span data-live="count">0/0</span> pieces placed
                </p>
              </div>
            </div>
          </Section>

          {/* previously */}
          <Section name="previously">
            <div className="grid grid-cols-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div className="relative col-span-3 flex items-center py-5 sm:col-span-1 px-4 sm:px-6 lg:px-10">
                <span data-b="text" className={LABEL}>Previously at</span>
              </div>
              {experience.map((c) => (
                <div key={c.title} className="relative flex items-center justify-center py-6">
                  <VLine className="top-0 left-0 hidden h-full sm:block" />
                  <a data-b="text" href={c.href} target="_blank" rel="noopener noreferrer" className="text-base font-semibold hover:underline">
                    {c.title}
                  </a>
                </div>
              ))}
            </div>
          </Section>

          {/* work */}
          <Section name="work" id="a-work">
            <div className="grid gap-4 py-12 md:grid-cols-2 px-4 sm:px-6 lg:px-10">
              <h2 data-b="text" className={H2}>Selected work.</h2>
              <p data-b="text" className={`max-w-sm self-end text-sm leading-relaxed text-balance ${MUTED}`}>
                Agents, evals and the products around them. Most recent first.
              </p>
            </div>
            <div className="relative grid md:grid-cols-2">
              <HLine className="top-0" />
              <VLine className="top-0 left-1/2 hidden h-full md:block" />
              {featuredProjects.map((p, i) => (
                <article key={p.slug} className="relative px-4 py-8 sm:px-6 lg:px-10">
                  {i >= 1 && <i aria-hidden data-b="hline" className={`absolute top-0 left-0 block h-px w-full md:hidden ${HAIR}`} />}
                  {i >= 2 && <i aria-hidden data-b="hline" className={`absolute top-0 left-0 hidden h-px w-full md:block ${HAIR}`} />}
                  <div data-b="image" className="overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                    <Image src={p.src} alt={`${p.title} screenshot`} width={1200} height={750} className="aspect-[16/10] w-full object-cover object-top" />
                  </div>
                  <h3 data-b="text" className="mt-5 text-xl font-semibold tracking-tight">{p.title}</h3>
                  <p data-b="text" className={`mt-2 text-sm leading-relaxed ${MUTED}`}>{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.detail?.stack.slice(0, 4).map((s) => (
                      <span key={s} data-b="pop" className="font-plex rounded border border-neutral-300 px-2 py-0.5 text-[11px] text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-5 text-sm">
                    {p.live && (
                      <a data-b="text" href={p.live} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">live</a>
                    )}
                    {p.github && (
                      <a data-b="text" href={p.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">source</a>
                    )}
                    <a data-b="text" href={`/projects/${p.slug}`} className="underline underline-offset-4">how it works</a>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          {/* numbers */}
          <Section name="numbers">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {METRICS.map((m, i) => (
                <div key={m.n} className="relative px-4 py-9 sm:px-6 lg:px-10">
                  {i > 0 && <VLine className={`top-0 left-0 h-full ${i === 2 ? "hidden lg:block" : ""}`} />}
                  {i >= 2 && <i aria-hidden data-b="hline" className={`absolute top-0 left-0 block h-px w-full lg:hidden ${HAIR}`} />}
                  <p data-b="text" className="text-4xl font-semibold tracking-tight whitespace-nowrap">{m.n}</p>
                  <p data-b="text" className={`mt-2 text-xs leading-relaxed ${MUTED}`}>{m.t}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* experience */}
          <Section name="experience" id="a-experience">
            <div className="py-12 px-4 sm:px-6 lg:px-10">
              <h2 data-b="text" className={H2}>Experience.</h2>
            </div>
            {experience.map((c) =>
              c.content.map((r) => (
                <div key={r.title} className="relative grid gap-4 py-8 md:grid-cols-[14rem_1fr] px-4 sm:px-6 lg:px-10">
                  <HLine className="top-0" />
                  <div className="flex items-start gap-3">
                    <span data-b="image" className="block h-10 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800">
                      <Image src={r.src} alt="" width={40} height={40} className="h-full w-full object-contain" style={r.imageZoom ? { transform: `scale(${r.imageZoom})` } : undefined} />
                    </span>
                    <div>
                      <h3 data-b="text" className="font-semibold">{r.title}</h3>
                      <p data-b="text" className={`mt-0.5 text-xs ${MUTED}`}>{r.type}</p>
                      <p data-b="text" className={`mt-2 ${LABEL}`}>{r.dates}</p>
                      <p data-b="text" className={LABEL}>{r.location}</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm leading-relaxed">
                    {r.description
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean)
                      .map((line) => (
                        <li key={line} data-b="text" className="text-neutral-800 dark:text-neutral-200">{line}</li>
                      ))}
                  </ul>
                </div>
              )),
            )}
          </Section>

          {/* stack */}
          <Section name="stack" id="a-stack">
            <div className="py-12 px-4 sm:px-6 lg:px-10">
              <h2 data-b="text" className={H2}>Stack.</h2>
            </div>
            {skillGroups.map((g) => (
              <div key={g.label} className="relative grid gap-3 py-5 md:grid-cols-[14rem_1fr] px-4 sm:px-6 lg:px-10">
                <HLine className="top-0" />
                <h3 data-b="text" className={`self-center ${LABEL}`}>{g.label}</h3>
                <ul className="flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <li key={s.name} data-b="pop" className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs dark:border-neutral-700">
                      <s.icon className="h-4 w-4" style={s.color ? { color: s.color } : undefined} aria-hidden />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          {/* activity */}
          {weeks.length > 0 && (
            <Section name="activity">
              <div className="py-12 px-4 sm:px-6 lg:px-10">
                <h2 data-b="text" className={H2}>Proof of work.</h2>
                <p data-b="text" className={`mt-3 text-sm ${MUTED}`}>My contributions in the last year, straight from GitHub.</p>
                <svg
                  data-b="sweep"
                  viewBox={`0 0 ${weeks.length * 14} 98`}
                  role="img"
                  aria-label="Contribution heatmap for the last year"
                  className="mt-8 block w-full [--c0:#e9ebf2] [--c1:#c9d3f2] [--c2:#90a4e4] [--c3:#5470d4] [--c4:#2c4ec9] dark:[--c0:#1b1d24] dark:[--c1:#1d2852] dark:[--c2:#283f94] dark:[--c3:#3a5bd6] dark:[--c4:#8098f2]"
                >
                  {weeks.map((w, x) =>
                    w.map((d, y) => (d ? <rect key={d.date} x={x * 14} y={y * 14} width={11} height={11} rx={2} fill={`var(--c${level(d.count)})`} /> : null)),
                  )}
                </svg>
              </div>
            </Section>
          )}

          {/* education */}
          <Section name="education">
            <div className="grid gap-6 py-10 md:grid-cols-[14rem_1fr] px-4 sm:px-6 lg:px-10">
              <h2 data-b="text" className={LABEL}>Education</h2>
              <div>
                <p data-b="text" className="font-semibold">{SITE.education.school}</p>
                <p data-b="text" className={`mt-1 text-sm ${MUTED}`}>
                  {SITE.education.degree} · {SITE.education.years} · GPA {SITE.education.gpa}
                </p>
                <p data-b="text" className="mt-5 text-sm">1st place, Hackaccino 3.0, out of 250+ teams</p>
                <p data-b="text" className="mt-1 text-sm">President, MindFlare at MAIT</p>
              </div>
            </div>
          </Section>

          {/* sign-off */}
          <Section name="contact" id="a-contact">
            <div className="flex flex-col items-center py-24 text-center">
              <h2 data-b="text" data-finale className={`${H2} max-w-xl`}>Built by agents. Hire the human.</h2>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a data-b="box" href={MAIL} className={btnDark}>
                  <Mail size={15} aria-hidden /> <span data-b="text">Email me</span>
                </a>
                <a data-b="box" href="https://cal.com/sehajm/meeting" target="_blank" rel="noopener noreferrer" className={btnLight}>
                  <Phone size={14} aria-hidden /> <span data-b="text">Book a call</span>
                </a>
              </div>
              <div className={`mt-9 flex gap-5 ${MUTED}`}>
                {[
                  { n: "GitHub", h: SITE.links.github, I: Github },
                  { n: "LinkedIn", h: SITE.links.linkedin, I: Linkedin },
                  { n: "X", h: SITE.links.x, I: FaXTwitter },
                ].map(({ n, h, I }) => (
                  <a key={n} data-b="pop" href={h} target="_blank" rel="noopener noreferrer" aria-label={n} className="hover:text-neutral-950 dark:hover:text-neutral-50">
                    <I size={18} aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </Section>

          <footer data-section="" className="relative">
            <HLine className="top-0" />
            <div className="flex flex-wrap justify-between gap-3 py-6 px-4 sm:px-6 lg:px-10">
              <p data-b="text" className={`motion-reduce:hidden ${LABEL}`}>
                Placed by <span data-live="agents">0</span> cursors while you scrolled: <span data-live="count">0/0</span> pieces, <span data-live="secs">0</span>s.
              </p>
              <p data-b="text" className={LABEL}>
                Idea:{" "}
                <a href="https://califa.github.io/swarm-site/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  Swarm by Joel Califa
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>

      <div ref={intro} aria-hidden className="pointer-events-none fixed inset-0 z-[55] flex items-center justify-center opacity-0 transition-opacity duration-300">
        <span className="font-custom2 text-xl font-semibold tracking-tight text-neutral-400 dark:text-neutral-600">sehaj.</span>
      </div>
      <canvas ref={canvas} aria-hidden className="font-plex pointer-events-none fixed inset-0 z-[56]" />
    </>
  );
}
