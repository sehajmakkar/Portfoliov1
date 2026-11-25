import {
  Bricolage_Grotesque,
  Cal_Sans,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Nanum_Pen_Script,
  Outfit,
  Space_Grotesk,
  VT323,
} from "next/font/google";

// Headings. Comes from next/font: the build drops the stylesheet @import for it.
export const instrumentSerif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--nf-instrument" });

// Extra faces for the desk screen, handwritten labels and the Kryptonite side.
// Not preloaded: they're only needed once those sections are on screen.
export const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-vt",
  preload: false,
});

export const pen = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-pen",
  preload: false,
});

export const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--nf-plex",
  preload: false,
});

// Candidates for the font trial (?fonts). Declared with preload: false, so a
// face only downloads once a pairing that uses it is picked.
const geist = Geist({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-geist-mono" });
const inter = Inter({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-inter" });
const interTight = Inter_Tight({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-inter-tight" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-space-grotesk" });
const outfit = Outfit({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-outfit" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], preload: false, display: "swap", weight: ["400", "500", "600", "700"], variable: "--nf-plex-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-jetbrains" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], preload: false, display: "swap", variable: "--nf-bricolage" });
const calSans = Cal_Sans({ subsets: ["latin"], preload: false, display: "swap", weight: "400", variable: "--nf-cal" });

export const fontVariables = [
  instrumentSerif, vt323, pen, plexMono, geist, geistMono, inter, interTight, spaceGrotesk, outfit, plexSans, jetbrains, bricolage, calSans,
]
  .map((f) => f.variable)
  .join(" ");

export async function loadCanvasFont(family: string, size = 20) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(`${size}px ${family}`);
  } catch {
    // canvas falls back to the next family in the stack
  }
}
