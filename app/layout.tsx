import type { Metadata } from "next";
import Link from "next/link";
import { StationReadout } from "@/components/StationReadout";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherIQ — Weather Intelligence Station",
  description:
    "A weather intelligence dashboard reading live atmospheric data from the WeatherAI API.",
  openGraph: {
    title: "WeatherIQ",
    description: "Live weather intelligence, read like an instrument panel.",
  },
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
              <Link href="/" className="font-display text-lg font-bold tracking-tight text-slate-50">
                WEATHER<span className="text-amber">IQ</span>
              </Link>
              <nav className="flex gap-5 font-mono text-xs uppercase tracking-widest text-ink2">
                <Link href="/" className="transition hover:text-amber">
                  Home
                </Link>
                <a
                  href="https://weather-ai.co/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-teal"
                >
                  API Docs ↗
                </a>
              </nav>
            </div>
            <StationReadout />
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 font-mono text-[11px] uppercase tracking-widest text-ink2">
            Data sourced from WeatherAI · Built with Next.js · No data stored
          </footer>
        </div>
      </body>
    </html>
  );
}
