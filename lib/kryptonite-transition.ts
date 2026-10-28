import { playSpinback } from "@/lib/audio";

// Flipping between the two sides of the site. Strips of ink slide across like
// a tape being wound, the destination name is stamped in the middle, the route
// changes underneath, and the strips slide away again.
//
// The overlay lives directly on <body> (outside React) so it survives the
// client-side navigation it is covering.

type Router = { push(href: string): void };
type Side = "/kryptonite" | "/";

let running = false;

const STRIPS = 7;
const EASE = "cubic-bezier(.77,0,.18,1)";

export function flipSide(router: Router, to: Side) {
  if (running || typeof document === "undefined") return;
  running = true;

  const toKrypto = to === "/kryptonite";
  const dark = document.documentElement.classList.contains("dark");
  const ink = toKrypto ? "#0e0d0b" : dark ? "#0a0a0a" : "#fafafa";
  const paper = toKrypto ? "#e6dfcf" : dark ? "#f5f5f5" : "#171717";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  playSpinback(toKrypto);

  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "1000",
    pointerEvents: "all",
    overflow: "hidden",
  });

  const strips: HTMLDivElement[] = [];
  for (let i = 0; i < STRIPS; i++) {
    const s = document.createElement("div");
    Object.assign(s.style, {
      position: "absolute",
      left: "0",
      right: "0",
      top: `${(i * 100) / STRIPS}%`,
      height: `${100 / STRIPS + 0.3}%`,
      background: ink,
      transform: `translateX(${i % 2 ? "" : "-"}101%)`,
    });
    root.appendChild(s);
    strips.push(s);
  }

  const label = document.createElement("div");
  Object.assign(label.style, {
    position: "absolute",
    inset: "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    color: paper,
    opacity: "0",
  });
  const side = document.createElement("span");
  side.textContent = toKrypto ? "side b" : "side a";
  Object.assign(side.style, {
    fontFamily: "var(--nf-plex), ui-monospace, monospace",
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    opacity: "0.6",
  });
  const word = document.createElement("span");
  word.textContent = toKrypto ? "Kryptonite" : "Sehaj Preet";
  Object.assign(word.style, {
    fontFamily: "'Instrument Serif', serif",
    fontStyle: toKrypto ? "italic" : "normal",
    fontSize: "clamp(56px, 13vw, 176px)",
    lineHeight: "1",
    letterSpacing: "-0.02em",
  });
  label.append(side, word);
  root.appendChild(label);
  document.body.appendChild(root);

  const finish = () => {
    root.remove();
    running = false;
  };

  if (reduced) {
    strips.forEach((s) => (s.style.transform = "none"));
    root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "forwards" });
    setTimeout(() => {
      router.push(to);
      waitForRoute(to).then(() => {
        root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).onfinish = finish;
      });
    }, 180);
    return;
  }

  const inDuration = 520;
  const stagger = 45;
  strips.forEach((s, i) =>
    s.animate([{ transform: s.style.transform }, { transform: "translateX(0)" }], {
      duration: inDuration,
      delay: i * stagger,
      easing: EASE,
      fill: "forwards",
    }),
  );
  const covered = inDuration + stagger * (STRIPS - 1);

  setTimeout(() => {
    label.animate(
      [
        { opacity: 0, transform: "scale(1.04)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
    );
  }, covered - 120);

  setTimeout(async () => {
    router.push(to);
    await waitForRoute(to);
    await new Promise((r) => setTimeout(r, 380));
    label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
    let done = 0;
    strips.forEach((s, i) => {
      const anim = s.animate(
        [{ transform: "translateX(0)" }, { transform: `translateX(${i % 2 ? "-" : ""}101%)` }],
        { duration: inDuration, delay: 120 + i * stagger, easing: EASE, fill: "forwards" },
      );
      anim.onfinish = () => {
        if (++done === STRIPS) finish();
      };
    });
  }, covered + 340);
}

function waitForRoute(path: string) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const check = () => {
      if (window.location.pathname === path || performance.now() - start > 4000) {
        // give the new page a couple of frames to paint underneath
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      } else requestAnimationFrame(check);
    };
    check();
  });
}
