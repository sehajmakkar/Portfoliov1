import type { Metadata } from "next";
import KryptoniteSide from "@/components/kryptonite/kryptonite-side";

export const metadata: Metadata = {
  title: "Kryptonite",
  description: "The other side of Sehaj Preet: beats, bars and the booth.",
  alternates: { canonical: "/kryptonite" },
};

export default function KryptonitePage() {
  return <KryptoniteSide />;
}
