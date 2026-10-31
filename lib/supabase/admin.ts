import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "../site";

/** Service-role client. Server only; bypasses RLS. Used for rate limiting public form posts. */
export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}
