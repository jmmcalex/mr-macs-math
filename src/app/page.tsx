import Link from "next/link";

import { domains } from "@/lib/domains";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-xl flex-col gap-8 px-5 pb-16 pt-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-700">
          Mr Mac’s Math Class
        </p>
        <h1 className="font-display text-4xl text-amber-950">
          A mobile-first hub for playful math explorations.
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
        <h2 className="font-display text-2xl text-amber-950">Today’s focus</h2>
        <div className="rounded-[28px] border border-amber-200 bg-amber-50/70 px-5 py-4">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-700">
            Warm-up
          </p>
          <p className="mt-2 text-base text-amber-950">
            Collect quick observations from the class before launching a
            playground.
          </p>
        </div>
      </section>
    </main>
  );
}
