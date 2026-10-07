import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { AuthForm } from "@/components/account/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

function safeNext(v: string | string[] | undefined): string {
  const n = Array.isArray(v) ? v[0] : v;
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/account";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);

  const user = await getCurrentUser();
  if (user) redirect(target);

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-2xl font-semibold text-primary">Welcome back</h1>
        <p className="mt-1 mb-6 text-sm text-ink-soft">
          Sign in to upload and track your property purchase documents.
        </p>
        <AuthForm mode="sign-in" next={target} />
      </div>
    </div>
  );
}
