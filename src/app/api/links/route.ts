import { NextRequest, NextResponse } from "next/server";
import { createLink, getRecentLinks } from "@/lib/db";
import { generateShortCode, isValidUrl, normalizeUrl, sanitizeCode } from "@/lib/shortener";

export async function GET() {
  try {
    const links = await getRecentLinks(30);
    return NextResponse.json({ ok: true, data: links });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, customCode, title } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { ok: false, error: "URL wajib diisi" },
        { status: 400 }
      );
    }

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) {
      return NextResponse.json(
        { ok: false, error: "Format URL tidak valid" },
        { status: 400 }
      );
    }

    const code = customCode
      ? sanitizeCode(customCode)
      : generateShortCode();

    if (!code || code.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Kode custom minimal 3 karakter alfanumerik" },
        { status: 400 }
      );
    }

    const record = await createLink(code, normalized, title);
    return NextResponse.json({ ok: true, data: record }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal membuat tautan pendek";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
