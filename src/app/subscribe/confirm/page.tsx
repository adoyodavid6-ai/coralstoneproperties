import type { Metadata } from "next";
import Link from "next/link";
import { confirmByToken } from "@/lib/subscribers/service";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
};

export default async function ConfirmSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await confirmByToken(token ?? "");

  return (
    <main className="container-page flex min-h-[60svh] items-center justify-center py-20">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-8 text-center shadow-card">
        {result.ok ? (
          <>
            <h1 className="font-serif text-2xl font-semibold text-primary">You&apos;re all set</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {result.email ? <span className="font-medium text-primary">{result.email}</span> : "Your email"}{" "}
              is confirmed. You&apos;ll now receive new verified listings and East African market insight from
              CoralStone.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-semibold text-primary">Link expired or invalid</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              We couldn&apos;t confirm this subscription. The link may have expired or already been used. Please
              subscribe again from the footer of any page.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink-black transition-colors hover:brightness-95"
        >
          Back to CoralStone
        </Link>
      </div>
    </main>
  );
}
