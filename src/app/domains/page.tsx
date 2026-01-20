import Link from "next/link";
import { domains } from "@/lib/domains";

export default function DomainsPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-xl flex-col gap-8 px-5 pb-16 pt-10">
      <header className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700"
        >
          ← Home
        </Link>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
          Domains
        </p>
        <h1 className="font-display text-3xl text-amber-950">
          Choose a math focus.
        </h1>
        <p className="text-base text-amber-900/80">
          Each domain contains playgrounds designed for short, repeatable
          explorations.
        </p>
      </header>

      <section className="grid gap-4">
        {domains.map((domain) => (
          <Link
            key={domain.slug}
            href={`/d/${domain.slug}`}
            className="rounded-[26px] border border-amber-200 bg-white/80 px-5 py-4 shadow-[0_18px_36px_-32px_rgba(120,60,20,0.6)]"
          >
            <h2 className="text-lg font-semibold text-amber-950">
              {domain.title}
            </h2>
            <p className="mt-1 text-sm text-amber-900/70">{domain.summary}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
