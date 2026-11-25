import { NextResponse, type NextRequest } from "next/server";

// AI agents that ask for markdown (Accept: text/markdown) get the /llms.txt
// summary instead of the HTML home page. Browsers always send text/html first.
// caches must keep the two versions of / apart
const VARY = { headers: { Vary: "Accept" } };

export function proxy(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/markdown") && !accept.includes("text/html")) {
    return NextResponse.rewrite(new URL("/llms.txt", req.url), VARY);
  }
  return NextResponse.next(VARY);
}

export const config = { matcher: ["/"] };
