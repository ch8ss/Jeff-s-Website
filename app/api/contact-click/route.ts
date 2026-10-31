import { z } from "zod";
import { hasSupabase } from "@/lib/site";
import { publicClient } from "@/lib/supabase/public";

const body = z.object({ artwork_id: z.string().min(1).max(64) });

/** Logs "Contact artist" clicks so Jeff can see which pieces get the most interest. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  if (hasSupabase && z.uuid().safeParse(parsed.data.artwork_id).success) {
    await publicClient().from("contact_clicks").insert({ artwork_id: parsed.data.artwork_id });
  }
  return new Response(null, { status: 204 });
}
