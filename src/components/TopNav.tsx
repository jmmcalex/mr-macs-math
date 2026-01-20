import Link from "next/link";

type TopNavProps = {
  backHref?: string;
  backLabel?: string;
  contextLabel?: string;
};

export default function TopNav({
  backHref,
  backLabel,
  contextLabel,
}: TopNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-amber-700">
      {backHref && backLabel ? (
        <Link href={backHref} className="font-semibold">
          ← {backLabel}
        </Link>
      ) : (
        <span />
      )}
      {contextLabel ? (
        <span className="font-semibold text-amber-900/70">
          {contextLabel}
        </span>
      ) : null}
    </div>
  );
}
