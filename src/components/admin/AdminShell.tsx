"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAdmin } from "@/lib/admin/AdminStore";
import {
  Sparkle,
  Area,
  Flag,
  Trend,
  CheckShield,
  Sliders,
  Calendar,
  Chevron,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Overview", icon: Sparkle, exact: true },
  { href: "/admin/listings", label: "Listings", icon: Area },
  { href: "/admin/moderation", label: "Moderation", icon: Flag, badge: "moderation" },
  { href: "/admin/pricing", label: "Pricing", icon: Trend },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/agents", label: "Agents", icon: CheckShield },
  { href: "/admin/settings", label: "Settings", icon: Sliders },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { properties, reports, resetAll } = useAdmin();

  const pending =
    properties.filter((p) => p.status === "pending_review").length +
    reports.filter((r) => r.status === "open").length;

  const lock = () => {
    sessionStorage.removeItem("anchorstone_admin_unlocked");
    location.reload();
  };

  const reset = () => {
    if (confirm("Reset all admin data back to the seed listings? This clears every change.")) {
      resetAll();
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");

  const NavLink = ({ item }: { item: (typeof NAV)[number] }) => {
    const active = isActive(item.href, "exact" in item ? item.exact : false);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface-muted hover:text-primary",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span>{item.label}</span>
        {"badge" in item && pending > 0 && (
          <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-warning px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {pending}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-surface text-ink lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-line bg-surface-raised lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center px-5">
          <Logo variant="full-light" size={34} />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-surface-raised/80 px-5 py-3 backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-warning">
            Demo console · localStorage working copy
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-line-strong px-3 py-1.5 text-sm font-medium text-primary hover:border-accent hover:text-accent"
            >
              View site
              <Chevron className="h-3.5 w-3.5 -rotate-90" />
            </Link>
            <button
              onClick={reset}
              className="rounded-full border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-danger hover:text-danger"
            >
              Reset data
            </button>
            <button
              onClick={lock}
              className="rounded-full bg-ink-black px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Lock
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
