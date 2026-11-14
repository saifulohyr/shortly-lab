import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/db";
import { sanitizeCode } from "@/lib/shortener";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = sanitizeCode(code);

  if (!cleanCode) {
    return NextResponse.json({ error: "Invalid link code" }, { status: 400 });
  }

  const referrer = req.headers.get("referer") || req.headers.get("referrer");
  const userAgent = req.headers.get("user-agent");

  const targetUrl = await recordClick(cleanCode, referrer, userAgent);

  if (!targetUrl) {
    // Redirect to home page with not-found query or return 404
    const url = new URL("/?notfound=" + encodeURIComponent(cleanCode), req.url);
    return NextResponse.redirect(url, { status: 307 });
  }

  return NextResponse.redirect(targetUrl, { status: 302 });
}
