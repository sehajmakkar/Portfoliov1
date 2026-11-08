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

// The record on the turntable. The cover is the label on the vinyl and what
// the big screen shows while it plays.
//
// `audio` is the track the turntable and speakers play. Remove it and they
// fall back to the lo-fi station.
export const record = {
  title: "Joint in the Booth",
  artist: "Seedhe Maut",
  album: "Lunch Break",
  cover: "/desk/lunch-break.jpg",
  audio: "/desk/joint-in-the-booth.mp3" as string | undefined,
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
  | "lights"
  | "turntable"
  | "monster"
  | "diya"
  | "marigolds";

// `tag` is what shows next to the cursor; `title` and `note` are the card
// you get after clicking something.
export const items: Record<ItemId, { tag: string; title?: string; note?: string }> = {
  monitor: { tag: "the big screen · click to use it" },
  macbook: {
    tag: "macbook",
    title: "MacBook",
    note: "Open under the big screen, the way it always is. Everything on this site was written on it.",
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
    tag: "casio enticer · mtp-1302pe-2av",
    title: "Casio Enticer MTP-1302PE-2AV",
    note: "Steel bracelet, light blue sunburst dial, date at three. It's showing your local time and today's date right now.",
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
  monster: {
    tag: "white monster",
    title: "White Monster",
    note: "Zero sugar, all the commits. The reason some of them are timestamped 4am.",
  },
  diya: {
    tag: "diya · shubh deepavali",
    title: "Shubh Deepavali",
    note: "Clay diyas, lit for Diwali, the way they are on every ledge back home. Happy Diwali from my desk to yours.",
  },
  marigolds: { 
    tag: "genda phool · strung for diwali" 
  },
  turntable: {
    tag: "turntable · lunch break on the platter",
    title: "Lunch Break, on vinyl",
    note: "Seedhe Maut, Lunch Break. The record that never leaves the platter. Click it and the needle drops.",
  },
};
