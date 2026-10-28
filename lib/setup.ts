// Everything on the desk that's about me rather than about code. Edit freely.
//
// Frames show the pictures in /public/desk. Swap a file (or the path) to
// change one; with `image` removed a painted placeholder is used instead.

export const frames = {
  messi: {
    image: "/desk/messi.jpg" as string | undefined,
    aspect: 736 / 920,
    quote:
      "I start early, and I stay late, day after day, year after year. It took me 17 years and 114 days to become an overnight success.",
    by: "lionel messi",
  },
  whatIf: {
    image: "/desk/what-if.jpg" as string | undefined,
    aspect: 658 / 1000,
    lines: ["what if", "it works", "out?"],
  },
  bayaan: {
    image: "/desk/bayaan.jpg" as string | undefined,
    aspect: 1,
    title: "Bayaan",
    titleDevanagari: "बयान",
    artist: "Seedhe Maut",
  },
};

export const perfume = {
  label: "eau de parfum",
};

export const scarf = {
  text: "MÉS QUE UN CLUB",
};

export type ItemId =
  | "monitor"
  | "macbook"
  | "keyboard"
  | "mouse"
  | "speakers"
  | "headphones"
  | "watch"
  | "perfume"
  | "notebook"
  | "clawd"
  | "messi"
  | "whatIf"
  | "bayaan"
  | "lamp"
  | "mug"
  | "floppies"
  | "scarf"
  | "football"
  | "sunset"
  | "lights";

// `tag` is what shows next to the cursor; `title` and `note` are the card
// you get after clicking something.
export const items: Record<ItemId, { tag: string; title?: string; note?: string }> = {
  monitor: { tag: "the macintosh · click to use it" },
  macbook: {
    tag: "macbook",
    title: "MacBook",
    note: "The one doing the actual work, wired into the Mac like it's 1984. Everything on this site was written on it.",
  },
  keyboard: { tag: "keyboard · type on yours, watch this one" },
  mouse: { tag: "mouse" },
  speakers: { tag: "speakers · click for some music" },
  headphones: {
    tag: "headphones",
    title: "Headphones",
    note: "For 3am sessions when the speakers are too much. Half my verses get written with these on.",
  },
  watch: {
    tag: "casio · ice blue dial",
    title: "Casio, ice blue dial",
    note: "Steel, simple, never needs charging. It's showing your local time right now.",
  },
  perfume: {
    tag: "perfume",
    title: "The bottle",
    note: "Always within reach. One spray before any call that matters.",
  },
  notebook: { tag: "the kryptonite notebook · flip to side b" },
  clawd: {
    tag: "clawd",
    title: "Clawd",
    note: "My pair programmer. Lives on the stand and reviews everything I ship. Click him again, he likes it.",
  },
  messi: {
    tag: "messi · chase the dream",
    title: "Chase the dream",
    note: "Lusail, 2022. The one trophy that took him the longest. It hangs here for the nights a build has been failing for an hour.",
  },
  whatIf: {
    tag: "what if it all works out?",
    title: "What if it all works out?",
    note: "The question I'd rather ask than the other one.",
  },
  bayaan: {
    tag: "seedhe maut · bayaan",
    title: "Bayaan, Seedhe Maut",
    note: "On the wall because it's on repeat. The reason the other side of this site exists.",
  },
  lamp: { tag: "desk lamp · click to flick it" },
  mug: { tag: "mug", title: "Mug", note: "Refilled more often than I push to main." },
  floppies: { tag: "projects on floppies · pick one" },
  scarf: {
    tag: "barça scarf",
    title: "Més que un club",
    note: "Visca el Barça. It went up on that nail years ago and it's never coming down.",
  },
  football: {
    tag: "the ball",
    title: "The ball",
    note: "Kept within reach of the chair. Juggling it is how bugs get solved when staring at them stops working.",
  },
  sunset: { tag: "sunset lamp · click to switch" },
  lights: { tag: "string lights · click to switch" },
};
