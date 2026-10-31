import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PostForm } from "@/components/admin/PostForm";
import type { Post } from "@/lib/types";

export default async function EditPost({ params }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div>
      <h1 className="display mb-6 text-4xl">Edit post</h1>
      <PostForm post={data as Post} />
    </div>
  );
}
