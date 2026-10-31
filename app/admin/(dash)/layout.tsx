import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { hasSupabase } from "@/lib/site";
import { signOut } from "../actions";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/art", label: "Artworks" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/clips", label: "Process clips" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
];

async function Gate({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) {
    return (
      <p className="max-w-xl rounded-xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm">
        Demo mode: the public site is showing sample content from <code>lib/seed.ts</code>. Connect Supabase (see README) to manage real content here.
      </p>
    );
  }
  await requireAdmin();
  return <>{children}</>;
}

export default function DashLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-white/10 p-5 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo />
          <span className="display text-xl">Studio</span>
        </Link>
        <nav aria-label="Admin" className="mt-6">
          <ul className="flex flex-wrap gap-1 md:flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/5 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex gap-3 text-sm md:absolute md:bottom-5 md:flex-col">
          <Link href="/" target="_blank" className="text-white/60 hover:text-white">View site ↗</Link>
          {hasSupabase && (
            <form action={signOut}>
              <button className="text-white/60 hover:text-danger">Sign out</button>
            </form>
          )}
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-10">
        <Suspense fallback={<p className="text-white/50">Loading…</p>}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
    </div>
  );
}
