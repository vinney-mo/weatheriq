import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherIQ — Weather Intelligence",
  description: "Live weather powered by WeatherAI API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink font-body text-slate-100 antialiased">
        <div
          className="pointer-events-none fixed inset-0 bg-isobar bg-cover bg-center opacity-100"
          aria-hidden
        />
        <div className="relative">
          <header className="border-b border-hairline bg-ink/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <span className="font-display text-lg font-bold tracking-tight text-slate-50">
                WEATHER<span className="text-amber">IQ</span>
              </span>
              <a
                href="https://weather-ai.co/docs"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs uppercase tracking-widest text-ink2 transition hover:text-teal"
              >
                API Docs
              </a>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 font-mono text-[11px] uppercase tracking-widest text-ink2">
            Data sourced from WeatherAI · Built with Next.js
          </footer>
        </div>
      </body>
    </html>
  );
}
