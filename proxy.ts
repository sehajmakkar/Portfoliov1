import { NextResponse, type NextRequest } from "next/server";

// AI agents that ask for markdown (Accept: text/markdown) get the /llms.txt
// summary instead of the HTML home page. Browsers always send text/html first.
export function proxy(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/markdown") && !accept.includes("text/html")) {
    return NextResponse.rewrite(new URL("/llms.txt", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
