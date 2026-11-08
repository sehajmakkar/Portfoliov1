"use client";

import { useEffect, useState } from "react";

// Diwali dressing for the site: the ladi over the pond, diyas floating on it,
// the rangoli on the first divider, the diyas and marigolds on the desk, and
// the greeting in the footer. It all switches itself on for the festival week
// and off again after, so nothing needs undoing.
//
// To see it outside the window, add ?diwali to the URL (?diwali=off hides it).
// Next year: move the dates (Diwali 2027 is on 29 October).

export const DIWALI = {
  from: new Date(2026, 10, 5), // Dhanteras week
  to: new Date(2026, 10, 16), // through Bhai Dooj, plus a day for stragglers
};

function inWindow(now = new Date()) {
  return now >= DIWALI.from && now < DIWALI.to;
}

/** False on the server and the first render, so markup always matches. */
export function useDiwali() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("diwali");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the clock and URL once, after hydration
    setOn(q === null ? inWindow() : q !== "off" && q !== "0");
  }, []);
  return on;
}
