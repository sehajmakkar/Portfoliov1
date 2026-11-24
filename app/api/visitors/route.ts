import net from "node:net";
import tls from "node:tls";
import { NextRequest, NextResponse } from "next/server";

// Visitor counter. Works with either:
//  - a plain Redis URL (REDIS_URL, or STORAGE_URL from Vercel's Redis connect
//    dialog with the "STORAGE" prefix): spoken to directly over TCP below, so
//    no client package is needed; or
//  - Upstash's REST API (KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN).
// The count starts from a base: visitors before the counter existed, estimated
// from Vercel Analytics (159 in the last 30 days, ~88 the month before, the
// site live since ~April 2026). Override with the VISITOR_BASE env var.
const REDIS_URL = process.env.REDIS_URL ?? process.env.STORAGE_URL ?? process.env.KV_URL;
const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const BASE = Number(process.env.VISITOR_BASE ?? 742) || 0;
const KEY = "sehaj.tech:visitors";
const COOKIE = "sp_seen";
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python|fetch/i;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Reply = string | number | null;

// Minimal RESP (Redis protocol) client: one connection, a few commands, done.
function redisTcp(url: string, cmds: string[][]): Promise<Reply[]> {
  const u = new URL(url);
  const host = u.hostname;
  const port = Number(u.port || 6379);
  const user = decodeURIComponent(u.username);
  const pass = decodeURIComponent(u.password);
  const pre: string[][] = pass ? [user ? ["AUTH", user, pass] : ["AUTH", pass]] : [];
  const all = [...pre, ...cmds];
  const encode = (args: string[]) =>
    `*${args.length}\r\n` + args.map((a) => `$${Buffer.byteLength(a)}\r\n${a}\r\n`).join("");

  return new Promise((resolve, reject) => {
    const secure = u.protocol === "rediss:";
    const sock = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
    const out: Reply[] = [];
    let buf = "";
    const fail = (e: Error) => {
      clearTimeout(timer);
      sock.destroy();
      reject(e);
    };
    const timer = setTimeout(() => fail(new Error("redis timeout")), 4000);

    sock.on(secure ? "secureConnect" : "connect", () => sock.write(all.map(encode).join("")));
    sock.on("error", fail);
    sock.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      for (;;) {
        const nl = buf.indexOf("\r\n");
        if (nl < 0) break;
        const type = buf[0], line = buf.slice(1, nl);
        if (type === "-") return fail(new Error(`redis: ${line}`));
        if (type === "+" || type === ":") {
          out.push(type === ":" ? Number(line) : line);
          buf = buf.slice(nl + 2);
        } else if (type === "$") {
          const n = Number(line);
          if (n < 0) {
            out.push(null);
            buf = buf.slice(nl + 2);
          } else {
            if (buf.length < nl + 2 + n + 2) break; // wait for the rest
            out.push(buf.slice(nl + 2, nl + 2 + n));
            buf = buf.slice(nl + 2 + n + 2);
          }
        } else return fail(new Error(`redis: unexpected reply ${type}`));
      }
      if (out.length >= all.length) {
        clearTimeout(timer);
        sock.end();
        resolve(out.slice(pre.length));
      }
    });
  });
}

async function restCmd(cmd: string): Promise<Reply> {
  const res = await fetch(`${REST_URL}/${cmd}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis rest ${res.status}`);
  return ((await res.json()) as { result: Reply }).result;
}

const configured = Boolean(REDIS_URL || (REST_URL && REST_TOKEN));

async function read(): Promise<number> {
  const v = REDIS_URL ? (await redisTcp(REDIS_URL, [["GET", KEY]]))[0] : await restCmd(`get/${KEY}`);
  return Number(v ?? 0);
}
async function increment(): Promise<number> {
  const v = REDIS_URL ? (await redisTcp(REDIS_URL, [["INCR", KEY]]))[0] : await restCmd(`incr/${KEY}`);
  return Number(v);
}

// GET: read the count. POST: count this browser once (cookie), then read.
export async function GET() {
  if (!configured) return NextResponse.json({ count: null });
  try {
    return NextResponse.json({ count: (await read()) + BASE });
  } catch {
    return NextResponse.json({ count: null });
  }
}

export async function POST(req: NextRequest) {
  if (!configured) return NextResponse.json({ count: null });
  const seen = req.cookies.has(COOKIE);
  const isBot = BOT.test(req.headers.get("user-agent") ?? "");
  const counts = !seen && !isBot;
  try {
    const n = counts ? await increment() : await read();
    const res = NextResponse.json({ count: n + BASE, new: counts });
    if (counts)
      res.cookies.set(COOKIE, "1", { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch {
    return NextResponse.json({ count: null });
  }
}
