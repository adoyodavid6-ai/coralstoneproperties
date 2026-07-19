import { CardGridSkeleton } from "@/components/ui/CardSkeleton";

export default function SearchLoading() {
  return (
    <div className="container-page py-8">
      <div className="skeleton mb-6 h-14 w-full rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="skeleton hidden h-[520px] rounded-2xl lg:block" />
        <div>
          <div className="skeleton mb-5 h-8 w-40 rounded" />
          <CardGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
