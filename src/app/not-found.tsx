import { ButtonLink } from "@/components/ui/Button";
import { Search } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
          <Search className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-primary">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-ink-soft">
          The listing may have been sold, let, or withdrawn. Let&apos;s get you back to
          verified properties.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <ButtonLink href="/search">Browse properties</ButtonLink>
          <ButtonLink href="/" variant="outline">Home</ButtonLink>
        </div>
      </div>
    </div>
  );
}
