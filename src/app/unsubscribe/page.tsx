import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeByToken } from "@/lib/subscribers/service";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await unsubscribeByToken(token ?? "");

  return (
    <main className="container-page flex min-h-[60svh] items-center justify-center py-20">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface-raised p-8 text-center shadow-card">
        {result.ok ? (
          <>
            <h1 className="font-serif text-2xl font-semibold text-primary">You&apos;ve been unsubscribed</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {result.email ? <span className="font-medium text-primary">{result.email}</span> : "Your email"}{" "}
              won&apos;t receive any further CoralStone updates. We&apos;re sorry to see you go — you can resubscribe
              anytime from the footer.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-semibold text-primary">Link invalid</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              We couldn&apos;t process this request. The link may be incomplete. If you keep receiving emails,
              contact us and we&apos;ll remove you right away.
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
