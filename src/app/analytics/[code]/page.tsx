"use client";

import { use, useEffect, useState } from "react";
import { Link2, ArrowLeft, ExternalLink, Calendar, MousePointer, Globe, Copy, Check } from "lucide-react";
import Link from "next/link";

interface LinkDetail {
  id: string;
  code: string;
  original_url: string;
  title: string | null;
  clicks: number;
  created_at: string;
  last_clicked_at: string | null;
}

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;
  const [data, setData] = useState<LinkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/links/${encodeURIComponent(code)}`);
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || "Tautan tidak ditemukan");
        }
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat statistik");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [code]);

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shortUrl = `${origin}/s/${code}`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
          Memuat data analitik...
        </div>
      ) : error || !data ? (
        <div className="bg-white border border-red-200 rounded-lg p-6 text-center text-xs text-red-600">
          {error || "Data tidak ditemukan"}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Analitik Tautan
                </span>
                <h1 className="text-xl font-bold font-mono text-slate-900 mt-1">
                  /s/{data.code}
                </h1>
                {data.title && (
                  <p className="text-sm text-slate-600 mt-0.5">{data.title}</p>
                )}
              </div>
              <button
                onClick={() => copyText(shortUrl)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin" : "Salin URL"}</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 block">Tujuan Pengalihan:</span>
              <a
                href={data.original_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-800 hover:underline flex items-center space-x-1 mt-1 break-all"
              >
                <span>{data.original_url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <MousePointer className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Total Kunjungan</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{data.clicks}</p>
              <p className="text-[11px] text-slate-500 mt-1">Akumulasi pengalihan berhasil</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center space-x-2 text-slate-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Terakhir Diklik</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {data.last_clicked_at
                  ? new Date(data.last_clicked_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Belum pernah"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Dibuat pada {new Date(data.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
