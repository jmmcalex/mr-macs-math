import Link from "next/link";

import TopNav from "@/components/TopNav";
import { domains } from "@/lib/domains";

type DomainPageProps = {
  params: Promise<{ domain: string }>;
};

export async function generateStaticParams() {
  return domains.map((domain) => ({
    domain: domain.slug,
  }));
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { domain } = await params;
  const domainSlug = decodeURIComponent(domain).toLowerCase();
  const domainItem = domains.find((item) => item.slug === domainSlug);

  if (!domainItem) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-xl flex-col gap-6 px-5 pb-16 pt-10">
        <h1 className="font-display text-3xl text-amber-950">
          Domain not found
        </h1>
        <p className="text-base text-amber-900/80">
          Pick another domain to keep exploring.
        </p>
        <Link
          className="rounded-full border border-amber-200 bg-white/80 px-5 py-3 text-sm font-semibold text-amber-950"
          href="/domains"
        >
          Back to domains
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-xl flex-col gap-8 px-5 pb-16 pt-10">
      <header className="space-y-3">
        <TopNav backHref="/domains" backLabel="Domains" />
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
          Domain
        </p>
        <h1 className="font-display text-3xl text-amber-950">
          {domainItem.title}
        </h1>
        <p className="text-base text-amber-900/80">{domainItem.summary}</p>
      </header>

      <section className="grid gap-4">
        {domainItem.playgrounds.map((playground) => (
          <Link
            key={playground.slug}
            href={`/p/${domainItem.slug}/${playground.slug}`}
            className="rounded-[26px] border border-amber-200 bg-white/80 px-5 py-4 shadow-[0_18px_36px_-32px_rgba(120,60,20,0.6)]"
          >
            <h2 className="text-lg font-semibold text-amber-950">
              {playground.title}
            </h2>
            <p className="mt-1 text-sm text-amber-900/70">
              {playground.summary}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
