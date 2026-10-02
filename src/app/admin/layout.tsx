import type { Metadata } from "next";
import { AdminProvider } from "@/lib/admin/AdminStore";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin console",
  robots: { index: false, follow: false },
};

// Access control lives in `src/proxy.ts` (HTTP Basic Auth on /admin), not in a
// client component — so the console is never served to the public.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
