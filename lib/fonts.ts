import { IBM_Plex_Mono, Nanum_Pen_Script, VT323 } from "next/font/google";

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

export const fontVariables = `${vt323.variable} ${pen.variable} ${plexMono.variable}`;

export async function loadCanvasFont(family: string, size = 20) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(`${size}px ${family}`);
  } catch {
    // canvas falls back to the next family in the stack
  }
}
