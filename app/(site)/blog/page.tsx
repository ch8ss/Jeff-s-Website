import type { Metadata } from "next";
import { getPosts, readingTime } from "@/lib/queries";
import { imageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/format";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BlogList } from "@/components/BlogList";
import { ScrollEffects } from "@/components/ui/Motion";

export const metadata: Metadata = {
  title: "Journal — notes from the wall",
  description: "Process notes, commission tips and stories from Jeff's murals and graffiti walls.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <p className="label mt-10 text-accent">Journal</p>
      <h1 className="display mt-4 text-[clamp(3.5rem,10vw,9rem)]">Notes from the wall</h1>
      {posts.length ? (
        <BlogList
          posts={posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            date: p.published_at ?? p.created_at,
            dateLabel: formatDate(p.published_at ?? p.created_at),
            minutes: readingTime(p.content_md),
            excerpt: p.excerpt,
            cover: imageUrl(p.cover_path),
          }))}
        />
      ) : (
        <p className="serif-italic mt-14 text-3xl text-text-light/60">First notes coming soon.</p>
      )}
      <ScrollEffects />
    </PageShell>
  );
}
