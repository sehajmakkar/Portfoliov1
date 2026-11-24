import { ArrowUp, FileText, Github, Linkedin } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { SiClaude, SiOpenai, SiPerplexity, SiX } from "react-icons/si";
import Container from "./containers";
import DiwaliGreeting from "./diwali/greeting";
import VisitorCount from "./visitor-count";
import GridName from "./grid-name";
import { SITE, SITE_URL } from "@/lib/site";

// "Ask an AI about me": opens each assistant with the question pre-filled,
// pointing it at llms.txt so the answer comes from this site.
const PROMPT = `Who is ${SITE.name} (sehaj.tech)? Read ${SITE_URL}/llms.txt and tell me about his experience, his projects, and what roles he's open to.`;
const q = encodeURIComponent(PROMPT);
const ASK = [
  { name: "Claude", icon: SiClaude, href: `https://claude.ai/new?q=${q}` },
  { name: "ChatGPT", icon: SiOpenai, href: `https://chatgpt.com/?hints=search&q=${q}` },
  { name: "Perplexity", icon: SiPerplexity, href: `https://www.perplexity.ai/search?q=${q}` },
  { name: "Grok", icon: SiX, href: `https://grok.com/?q=${q}` },
];

const rail =
  "pointer-events-none absolute top-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12";

const hatch =
  "h-5 border-y border-[var(--pattern-fg)] bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] opacity-80 dark:opacity-40";

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <Container className="pt-10">
        {/* same hatched rails as the page above (bg-fixed keeps the stripes aligned) */}
        <div aria-hidden className={`left-0 ${rail}`} />
        <div aria-hidden className={`right-0 ${rail}`} />
        {/* Ask an AI */}
        <div className="font-custom2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Curious? Ask an AI about me.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ASK.map(({ name, icon: Icon, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {name}
              </a>
            ))}
          </div>
        </div>

        <div className={`-mx-8 mt-8 sm:-mx-10 md:-mx-14 ${hatch}`} />

        {/* Bottom bar */}
        <div className="font-custom2 flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-2">
            © {new Date().getFullYear()} {SITE.name} ·{" "}
            <a className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100" href="https://github.com/sehajmakkar/Portfoliov1" target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <DiwaliGreeting />
          </span>
          <span className="flex items-center gap-2">
            <span className="font-plex text-[10px] tracking-[0.16em] uppercase">Visitor no.</span>
            <VisitorCount />
          </span>
          <span className="flex items-center gap-4">
            {[
              { name: "GitHub", href: SITE.links.github, icon: Github },
              { name: "LinkedIn", href: SITE.links.linkedin, icon: Linkedin },
              { name: "X", href: SITE.links.x, icon: FaXTwitter },
            ].map(({ name, href, icon: Icon }) => (
              <a key={name} href={href} target="_blank" rel="me noopener noreferrer" aria-label={name} title={name} className="opacity-70 transition hover:opacity-100">
                <Icon size={15} aria-hidden />
              </a>
            ))}
            <a href="/resume.pdf" target="_blank" rel="noopener" aria-label="Resume" title="Resume" className="opacity-70 transition hover:opacity-100">
              <FileText size={15} aria-hidden />
            </a>
            <a href="#top" className="inline-flex items-center gap-1 border-l border-neutral-300 pl-4 transition hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100">
              Back to top <ArrowUp size={13} aria-hidden />
            </a>
          </span>
        </div>

        {/* Giant name in drafting-grid letters; cells light up under the cursor */}
        <div className="relative -mx-8 h-[clamp(4.5rem,17vw,10.5rem)] overflow-hidden sm:-mx-10 md:-mx-14">
          <GridName text="sehaj." />
        </div>
      </Container>
    </footer>
  );
}
