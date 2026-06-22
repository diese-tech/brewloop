import Link from "next/link";

export function BrandMark({
  compact = false,
  href = "/cafe/black-rabbit",
}: {
  compact?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <span className="moon-mark" aria-hidden="true" />
      <span>
        <span
          className={`block font-heading font-semibold leading-none ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          The Black Rabbit
        </span>
        <span className="catalog-label mt-1 block">Bookbar · Clermont</span>
      </span>
    </Link>
  );
}
