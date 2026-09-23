"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Flag } from "@/components/ui/icons";

/**
 * Root error boundary. Renders inside the root layout, so the header and footer
 * stay in place while a segment error is shown. `unstable_retry` (Next.js 16.2+)
 * re-fetches and re-renders the failed segment — preferred over the legacy
 * `reset` prop.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface for server-side logs / future error reporting.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-danger-soft text-danger">
          <Flag className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-primary">
          Something went wrong
        </h1>
        <p className="mt-3 text-ink-soft">
          Sorry — an unexpected error interrupted this page. You can try again, or head back to
          verified listings.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-ink-soft/70">
            Reference: <span className="figure">{error.digest}</span>
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <ButtonLink href="/search" variant="outline">Browse properties</ButtonLink>
          <ButtonLink href="/" variant="ghost">Home</ButtonLink>
        </div>
      </div>
    </div>
  );
}
