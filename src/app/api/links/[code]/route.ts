import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode } from "@/lib/db";
import { sanitizeCode } from "@/lib/shortener";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = sanitizeCode(code);
  const record = await getLinkByCode(cleanCode);

  if (!record) {
    return NextResponse.json({ ok: false, error: "Tautan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: record });
}
