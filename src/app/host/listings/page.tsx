import Link from "next/link";
import { requireOwner } from "@/lib/auth/roles";
import { getHostListings } from "@/lib/host/service";

export const dynamic = "force-dynamic";

export default async function HostListings() {
  const user = await requireOwner("/host/listings");
  const listings = await getHostListings(user.id);

  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-surface-raised p-10 text-center text-sm text-ink-soft">
        No listings linked to your account yet. CoralStones links your property once it&apos;s verified.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-surface-raised">
      {listings.map((l) => (
        <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate font-medium text-primary">{l.title}</p>
            <p className="text-xs capitalize text-ink-soft">
              {l.type.replace("_", " ")} · {l.status}
            </p>
          </div>
          <Link href={`/property/${l.slug}`} className="shrink-0 text-sm font-medium text-accent hover:brightness-90">
            View →
          </Link>
        </li>
      ))}
    </ul>
  );
}
