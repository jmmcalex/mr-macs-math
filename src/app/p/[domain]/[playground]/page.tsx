import Link from "next/link";

import TopNav from "@/components/TopNav";
import PlaygroundShell from "@/components/PlaygroundShell";
import { domains } from "@/lib/domains";

type PlaygroundPageProps = {
  params: Promise<{ domain: string; playground: string }>;
};

export async function generateStaticParams() {
  const params: { domain: string; playground: string }[] = [];
  
  for (const domain of domains) {
    for (const playground of domain.playgrounds) {
      params.push({
        domain: domain.slug,
        playground: playground.slug,
      });
    }
  }
  
  return params;
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { domain, playground } = await params;
  const domainSlug = decodeURIComponent(domain).toLowerCase();
  const playgroundSlug = decodeURIComponent(playground).toLowerCase();
  const domainItem = domains.find((item) => item.slug === domainSlug);
  const playgroundItem = domainItem?.playgrounds.find(
    (item) => item.slug === playgroundSlug
  );

  const title = playgroundItem?.title ?? "Playground";
  const prompt =
    playgroundItem?.summary ?? "Start exploring the idea in this playground.";

  return (
    <div>
      <PlaygroundShell
        title={title}
        prompt={prompt}
        topNav={
          <TopNav
            backHref={domainItem ? `/d/${domainItem.slug}` : "/domains"}
            backLabel={domainItem?.title ?? "Domains"}
          />
        }
      >
        <p>
          This space will host the interactive math experience. For now, it is
          a placeholder panel.
        </p>
      </PlaygroundShell>

      <div className="px-5 pb-10">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900"
          href={domainItem ? `/d/${domainItem.slug}` : "/domains"}
        >
          ← Back to domain
        </Link>
      </div>
    </div>
  );
}
