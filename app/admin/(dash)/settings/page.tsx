import { requireAdmin } from "@/lib/admin";
import { seedSettings } from "@/lib/seed";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { Settings } from "@/lib/types";

export default async function AdminSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  const s: Settings = { ...seedSettings, ...(data ?? {}), stats: data?.stats ?? [], socials: data?.socials ?? {}, tagline_words: data?.tagline_words ?? seedSettings.tagline_words };
  return (
    <div>
      <h1 className="display mb-6 text-4xl">Settings</h1>
      <SettingsForm s={s} />
    </div>
  );
}
