import Link from "next/link";
import { requireOwner } from "@/lib/auth/roles";
import { signOutAction } from "@/lib/auth/actions";
import { LogOut } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/host", label: "Overview" },
  { href: "/host/listings", label: "Listings" },
  { href: "/host/bookings", label: "Bookings" },
  { href: "/host/earnings", label: "Earnings" },
  { href: "/host/messages", label: "Messages" },
  { href: "/host/payout-settings", label: "Payout settings" },
];

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner("/host");

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Host dashboard</p>
          <h1 className="font-serif text-2xl font-semibold text-primary">{user.name || "Your hosting"}</h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-danger hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      <nav className="mt-5 flex flex-wrap gap-2 border-b border-line pb-3">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-primary"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
