import { NextRequest, NextResponse } from "next/server";

// Visitor counter backed by Upstash Redis (REST API, no SDK needed).
// Env: the Vercel Upstash integration sets KV_REST_API_URL / KV_REST_API_TOKEN;
// a direct Upstash database gives UPSTASH_REDIS_REST_URL / _TOKEN. Either works.
// The count starts from a base: visitors before the counter existed, estimated
// from Vercel Analytics (159 in the last 30 days, ~88 the month before, the
// site live since ~April 2026). Override with the VISITOR_BASE env var.
const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const BASE = Number(process.env.VISITOR_BASE ?? 742) || 0;
const KEY = "sehaj.tech:visitors";
const COOKIE = "sp_seen";
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python|fetch/i;

export const dynamic = "force-dynamic";

async function redis(cmd: string) {
  const res = await fetch(`${URL_}/${cmd}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return ((await res.json()) as { result: string | number | null }).result;
}

// GET: read the count. POST: count this browser once (cookie), then read.
export async function GET() {
  if (!URL_ || !TOKEN) return NextResponse.json({ count: null });
  try {
    return NextResponse.json({ count: Number((await redis(`get/${KEY}`)) ?? 0) + BASE });
  } catch {
    return NextResponse.json({ count: null });
  }
}

export async function POST(req: NextRequest) {
  if (!URL_ || !TOKEN) return NextResponse.json({ count: null });
  const seen = req.cookies.has(COOKIE);
  const isBot = BOT.test(req.headers.get("user-agent") ?? "");
  try {
    const n = seen || isBot ? Number((await redis(`get/${KEY}`)) ?? 0) : Number(await redis(`incr/${KEY}`));
    const res = NextResponse.json({ count: n + BASE, new: !seen && !isBot });
    if (!seen && !isBot)
      res.cookies.set(COOKIE, "1", { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch {
    return NextResponse.json({ count: null });
  }
}
