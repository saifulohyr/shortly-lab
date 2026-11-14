import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortly Lab | URL Shortener SMK Muhammadiyah Majenang",
  description: "Pemendek tautan cepat, bersih, dan analitik real-time untuk kebutuhan Lab Komputer dan Siswa SMK Muhammadiyah Majenang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="h-7 w-7 rounded bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs tracking-wider">
                LM
              </span>
              <div>
                <span className="font-semibold text-sm tracking-tight text-slate-900">Shortly Lab</span>
                <span className="text-[11px] text-slate-500 block leading-none">LABMUMA Majenang</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <a
                href="https://labmuma.xyz"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Portal Lab
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://github.com/saifulohyr/shortly-lab"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors font-mono"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
          <p>© {new Date().getFullYear()} SMK Muhammadiyah Majenang. Dikembangkan oleh saifulohyr.</p>
        </footer>
      </body>
    </html>
  );
}
