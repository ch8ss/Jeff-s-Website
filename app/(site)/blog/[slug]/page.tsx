import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPostBySlug, getPosts, getSettings, readingTime } from "@/lib/queries";
import { imageUrl } from "@/lib/storage";
import { formatDate } from "@/lib/format";
import { postJsonLd, truncate } from "@/lib/seo";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Socials } from "@/components/ui/Socials";
import { Markdown } from "@/components/Markdown";
import { ScrollEffects } from "@/components/ui/Motion";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? truncate(post.content_md);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags,
      images: post.cover_path ? [{ url: imageUrl(post.cover_path)!, alt: post.cover_alt ?? post.title }] : undefined,
    },
  };
}

async function PostBody({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();
  const post = posts[i];
  const newer = posts[i - 1];
  const older = posts[i + 1];
  const related = posts.filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t))).slice(0, 3);
  const cover = imageUrl(post.cover_path);
  const date = post.published_at ?? post.created_at;
  const authorImg = imageUrl(settings.story_image_path);

  return (
    <>
      <JsonLd data={postJsonLd(post, settings.artist_name)} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />
      <article className="mx-auto mt-10 max-w-4xl">
        <header>
          <p className="label flex flex-wrap gap-3 opacity-70">
            <time dateTime={date}>{formatDate(date)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingTime(post.content_md)} min read</span>
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/20 px-2 text-[10px]">#{t}</span>
            ))}
          </p>
          <h1 className="display mt-5 text-[clamp(3rem,7vw,6rem)]">{post.title}</h1>
        </header>
        {cover && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
            <Image src={cover} alt={post.cover_alt ?? ""} fill loading="eager" fetchPriority="high" sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="mt-12">
          <Markdown>{post.content_md}</Markdown>
        </div>

        <aside aria-label="About the author" className="mt-16 flex flex-col gap-5 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">
          {authorImg && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
              <Image src={authorImg} alt={`Portrait of ${settings.artist_name}`} fill sizes="80px" className="object-cover" />
            </div>
          )}
          <div>
            <p className="display text-2xl">{settings.artist_name}</p>
            <p className="mt-1 text-sm text-text-light/70">Muralist &amp; graffiti artist{settings.city ? ` based in ${settings.city}` : ""}. Walls, canvases and custom pieces.</p>
            <Socials socials={settings.socials} className="mt-3" />
          </div>
        </aside>

        <nav aria-label="More posts" className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
          {older ? (
            <Link href={`/blog/${older.slug}`} className="group">
              <span className="label opacity-60">← Previous</span>
              <span className="display mt-1 block text-2xl group-hover:text-accent">{older.title}</span>
            </Link>
          ) : <span />}
          {newer && (
            <Link href={`/blog/${newer.slug}`} className="group sm:text-right">
              <span className="label opacity-60">Next →</span>
              <span className="display mt-1 block text-2xl group-hover:text-accent">{newer.title}</span>
            </Link>
          )}
        </nav>

        {related.length > 0 && (
          <section aria-labelledby="related-posts" className="mt-16">
            <h2 id="related-posts" className="label opacity-60">Related posts</h2>
            <ul className="mt-4 space-y-3">
              {related.map((p) => (
                <li key={p.id}><Link href={`/blog/${p.slug}`} className="serif-italic text-2xl hover:text-accent">{p.title}</Link></li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <ScrollEffects />
    </>
  );
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[60vh] max-w-4xl animate-pulse rounded-[var(--radius-card)] bg-white/5" />}>
        <PostBody params={params} />
      </Suspense>
    </PageShell>
  );
}
