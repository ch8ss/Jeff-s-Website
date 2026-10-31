import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { hasSupabase } from "./site";
import { serverClient } from "./supabase/server";

/** Verifies the signed-in user is in `admins`. Use at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!hasSupabase) {
    // Demo mode: defer to request time, then send to the login page, which explains how to connect Supabase.
    await connection();
    redirect("/admin/login");
  }
  const supabase = await serverClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=not-admin");
  return { supabase, user: auth.user };
}
