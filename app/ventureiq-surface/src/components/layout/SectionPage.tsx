import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  Compass,
  FileText,
  Layers3,
  Sparkles,
} from "lucide-react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const icons = [BarChart3, Compass, FileText, Layers3, Sparkles];

export interface SectionPageProps {
  eyebrow: string;
  title: string;
  description: string;
  metrics: { value: string; label: string }[];
  cards: { title: string; description: string }[];
  highlights: { title: string; description: string }[];
  cardGridClassName?: string;
  downloads?: { title: string; description: string; format: string; href: string }[];
  linkLabel: string;
  linkHref: string;
}

export default function SectionPage({
  eyebrow,
  title,
  description,
  metrics,
  cards,
  highlights,
  cardGridClassName,
  downloads,
  linkLabel,
  linkHref,
}: SectionPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,254,255,0.7))] dark:bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(135deg,rgba(9,9,11,0.96),rgba(8,47,73,0.5))]" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400 sm:text-lg">
                {description}
              </p>
              <Link
                href={linkHref}
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 transition hover:bg-zinc-950 hover:text-cyan-400 dark:hover:bg-white"
              >
                {linkLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 self-end sm:grid-cols-3 lg:grid-cols-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="border-l-2 border-cyan-400 bg-white/70 p-5 backdrop-blur-sm dark:bg-zinc-900/70"
                >
                  <p className="text-3xl font-bold tracking-tight text-cyan-600 dark:text-cyan-400">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">
              Built for action
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Intelligence that moves with your business.
            </h2>
          </div>

          <div
            className={`grid gap-px overflow-hidden border border-zinc-200 bg-transparent dark:border-zinc-800 md:grid-cols-2 lg:grid-cols-3 ${cardGridClassName ?? ""}`}
          >
            {cards.map((card, index) => {
              const Icon = icons[index % icons.length];

              return (
                <article key={card.title} className="min-h-[220px] bg-zinc-50 p-7 dark:bg-zinc-950">
                  <Icon className="h-6 w-6 text-cyan-500" aria-hidden="true" />
                  <h3 className="mt-8 text-lg font-bold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-20 grid gap-10 border-t border-zinc-200 pt-12 dark:border-zinc-800 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                From market noise to a clear next move.
              </h2>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {highlights.map((highlight, index) => (
                <div key={highlight.title} className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr]">
                  <span className="text-sm font-bold text-cyan-500">0{index + 1}</span>
                  <div>
                    <h3 className="font-bold">{highlight.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {downloads && (
            <div className="mt-20 border-t border-zinc-200 pt-12 dark:border-zinc-800">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">
                  Free data downloads
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Take the data into your next discussion.
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                  Download these sample datasets to explore the signals behind our latest
                  perspectives.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {downloads.map((download) => (
                  <article
                    key={download.title}
                    className="flex flex-col justify-between border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                        {download.format}
                      </span>
                      <h3 className="mt-5 text-lg font-bold">{download.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                        {download.description}
                      </p>
                    </div>
                    <a
                      href={download.href}
                      download
                      className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-colors hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400"
                    >
                      Download data
                      <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
