import Link from "next/link";

import { loadDayEntries } from "@/lib/content";
import { domains } from "@/lib/domains";

export default async function Home() {
  const { latest, recent } = await loadDayEntries();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://jmmcalex.github.io/mr-macs-math";
  const lessonHref = latest?.featured.href;
  const qrTarget = lessonHref
    ? siteUrl
      ? `${siteUrl}${lessonHref}`
      : lessonHref
    : null;
  const qrUrl = qrTarget
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        qrTarget
      )}`
    : null;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-xl flex-col gap-8 px-5 pb-16 pt-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-700">
          Mr Mac’s Math Class
        </p>
        <h1 className="font-display text-4xl text-amber-950">
          A hub for playful math explorations.
        </h1>
        <p className="text-base text-amber-900/80">
          Pick a domain, open a playground, and let curiosity lead the next
          activity.
        </p>
      </header>

      <section className="grid gap-4">
        <Link
          className="rounded-[26px] border border-amber-200 bg-white/80 px-5 py-4 text-lg font-semibold text-amber-950 shadow-[0_20px_40px_-35px_rgba(120,60,20,0.6)]"
          href="/domains"
        >
          Browse math domains
        </Link>
        <Link
          className="rounded-[26px] border border-amber-200 bg-amber-950 px-5 py-4 text-lg font-semibold text-amber-50 shadow-[0_20px_40px_-35px_rgba(120,60,20,0.6)]"
          href={`/d/${domains[0].slug}`}
        >
          Start with {domains[0].title}
        </Link>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl text-amber-950">Class plan</h2>
        {latest ? (
          <div className="grid gap-3">
            <div className="rounded-[26px] border border-amber-200 bg-amber-50/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
                Today's Focus
              </p>
              <p className="mt-2 text-base text-amber-950">{latest.focus}</p>
            </div>
            <div className="rounded-[26px] border border-amber-200 bg-amber-50/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
                Warmup
              </p>
              <p className="mt-2 text-base text-amber-950">{latest.warmup}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[26px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-base text-amber-950">
            No class plan posted yet.
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl text-amber-950">
          Lesson of the day
        </h2>
        {latest && lessonHref ? (
          <div className="rounded-[28px] border border-amber-200 bg-white/80 px-5 py-4 shadow-[0_18px_40px_-32px_rgba(120,60,20,0.6)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
                  Featured playground
                </p>
                <p className="mt-2 text-lg font-semibold text-amber-950">
                  {latest.featured.title}
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-900"
                  href={lessonHref}
                >
                  Open lesson →
                </Link>
              </div>
              <div className="flex items-center justify-center rounded-[22px] border border-amber-200 bg-white p-3">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR code for ${latest.featured.title}`}
                    className="h-36 w-36"
                  />
                ) : (
                  <div className="h-36 w-36 rounded-[16px] border border-dashed border-amber-200 bg-amber-50 text-xs text-amber-700 flex items-center justify-center text-center px-3">
                    QR unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-amber-200 bg-white/80 px-5 py-4 text-base text-amber-950">
            No featured lesson posted yet.
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl text-amber-950">
          Recent lessons
        </h2>
        {recent.length ? (
          <div className="grid gap-3">
            {recent.map((entry) => (
              <div
                key={entry.date}
                className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-amber-700">
                  <span>
                    {new Date(entry.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-semibold">
                    {entry.featured.title}
                  </span>
                </div>
                <p className="mt-2 text-base text-amber-950 line-clamp-2">
                  {entry.focus}
                </p>
                <Link
                  href={entry.featured.href}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-900"
                >
                  Open playground →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-base text-amber-950">
            No recent lessons yet.
          </div>
        )}
      </section>
    </main>
  );
}
