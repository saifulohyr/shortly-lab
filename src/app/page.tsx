"use client";

import { useState, useEffect } from "react";
import { Link2, Copy, Check, ExternalLink, BarChart3, AlertCircle } from "lucide-react";

interface LinkItem {
  id: string;
  code: string;
  original_url: string;
  title: string | null;
  clicks: number;
  created_at: string;
  last_clicked_at: string | null;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [fetchingLinks, setFetchingLinks] = useState(true);

  async function fetchLinks() {
    try {
      const res = await fetch("/api/links");
      const json = await res.json();
      if (json.ok) {
        setLinks(json.data);
      }
    } catch {
      // ignore
    } finally {
      setFetchingLinks(false);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          customCode: customCode.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || "Gagal membuat tautan");
      }

      setCreated(json.data);
      setUrl("");
      setCustomCode("");
      setTitle("");
      fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-10">
      {/* Intro section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Pemendek Tautan Lab
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Buat tautan ringkas dan mudah diingat untuk dibagikan ke siswa, proyektor lab, atau modul praktikum.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleShorten} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              URL Tujuan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://drive.google.com/... atau tautan materi"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full pl-3 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Kustom Kode (Opsional)
              </label>
              <div className="flex rounded border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 overflow-hidden">
                <span className="bg-slate-100 px-3 py-2 text-xs text-slate-500 border-r border-slate-300 select-none">
                  /s/
                </span>
                <input
                  type="text"
                  placeholder="modul-jaringan"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Judul / Keterangan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Materi Modul 3 RPL"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? "Memproses..." : "Perpendek Tautan"}
            </button>
          </div>
        </form>

        {/* Success Box */}
        {created && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-2">
              Tautan Siap Digunakan
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded border border-emerald-300">
              <div className="min-w-0">
                <span className="font-mono text-sm font-bold text-slate-900 block truncate">
                  {origin}/s/{created.code}
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  Tujuan: {created.original_url}
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(`${origin}/s/${created.code}`)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin" : "Salin"}</span>
                </button>
                <a
                  href={`/s/${created.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
                  title="Uji coba buka"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Links Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
            Daftar Tautan Terakhir
          </h2>
          <span className="text-xs text-slate-500">
            {links.length} tautan tersimpan
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          {fetchingLinks ? (
            <div className="p-8 text-center text-xs text-slate-500">Memuat data tautan...</div>
          ) : links.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada tautan yang dibuat. Masukkan URL di atas untuk memulai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Kode & Judul</th>
                    <th className="px-4 py-3 font-semibold">Tautan Asli</th>
                    <th className="px-4 py-3 font-semibold text-center">Klik</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">
                            /s/{link.code}
                          </span>
                        </div>
                        {link.title && (
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {link.title}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                        {link.original_url}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {link.clicks}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => copyToClipboard(`${origin}/s/${link.code}`)}
                            className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                            title="Salin tautan"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/s/${link.code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                            title="Buka tautan"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
