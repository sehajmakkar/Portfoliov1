// Everything on the Kryptonite side that is *yours* lives here, so you can
// rewrite it without touching components.

export type NotebookLine = {
  text: string;
  // drafts you scratched out; hovering the page shows them again
  struck?: boolean;
  // a note in the margin, e.g. "(double time)"
  margin?: string;
};

export type Tape = { title: string; year: string; href: string };

export const kryptonite = {
  intro:
    "By day I ship code. After hours I'm Kryptonite: verses in the notes app, beats at 2am, all the stuff that doesn't fit on a résumé.",

  facts: [
    { label: "alias", value: "kryptonite" },
    { label: "real name", value: "sehaj preet" },
    { label: "writes", value: "verses, hooks, the odd beat" },
    { label: "handle", value: "@kryptokodes", href: "https://x.com/kryptokodes" },
  ],

  // PLACEHOLDER BARS: swap these for your own.
  notebook: {
    title: "untitled (v2)",
    date: "3:12 am",
    lines: [
      { text: "Cursor blinkin' at 3am, it's waitin' on a verse" },
      { text: "Two tabs open, one's a beat, the other one's a curse" },
      { text: "Every bug I ever fixed just taught me how to hurt", struck: true },
      { text: "Every bug I ever shipped just taught me how to work", margin: "(better)" },
      { text: "They call me Kryptonite, I'm the weakness in the plan" },
      { text: "Green light on the build, now I'm runnin' it again", margin: "double time →" },
      { text: "Pushed it straight to main, no review, no backup", struck: true },
      { text: "Commit, push, verse. No rollback. Run it up." },
    ] as NotebookLine[],
  },

  // Releases. The section stays hidden until you add one.
  tapes: [] as Tape[],
};
