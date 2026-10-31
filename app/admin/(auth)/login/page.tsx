import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { hasSupabase } from "@/lib/site";

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <h1 className="display text-3xl">Studio login</h1>
        </div>
        {hasSupabase ? (
          <Suspense>
            <LoginNotice searchParams={searchParams} />
            <LoginForm />
          </Suspense>
        ) : (
          <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm">
            Supabase isn&apos;t connected yet. Add the env vars from <code>.env.example</code> to enable the dashboard.
          </p>
        )}
      </div>
    </main>
  );
}

async function LoginNotice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { error } = await searchParams;
  if (error !== "not-admin") return null;
  return <p className="mb-4 rounded-xl bg-accent/15 p-3 text-sm text-danger">That account isn&apos;t an admin. Add its user id to the <code>admins</code> table.</p>;
}
