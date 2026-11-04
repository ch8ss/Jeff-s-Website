"use client";

import { useActionState } from "react";
import type { Settings } from "@/lib/types";
import { saveSettings, type ActionResult } from "@/app/admin/actions";
import { ImageField } from "./ImageField";
import { VideoField } from "./VideoField";
import { btn, card, input, label } from "./styles";

const SOCIALS = ["instagram", "youtube", "facebook", "behance", "x", "pinterest", "linkedin"] as const;

export function SettingsForm({ s }: { s: Settings }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSettings, { ok: false });
  const field = (name: string, lbl: string, value?: string | null, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className={label}>{lbl}</label>
      <input id={name} name={name} defaultValue={value ?? ""} className={input} {...props} />
    </div>
  );
  return (
    <form action={action} className="grid gap-6 xl:grid-cols-2">
      <section className={`${card} space-y-4`}>
        <h2 className="font-medium">Identity</h2>
        {field("artist_name", "Artist name (hero letters use the first 4)", s.artist_name)}
        {field("tagline", "Tagline — 4 words, one under each letter", s.tagline_words.join(" "))}
        {field("city", "City", s.city)}
        {field("series_name", "Current series (hero: “New series ___ — out now”)", s.series_name)}
        {field("contact_email", "Contact email", s.contact_email, { type: "email" })}
        <div>
          <label htmlFor="bio_md" className={label}>Story paragraph — wrap key phrases in **double asterisks** to colour them</label>
          <textarea id="bio_md" name="bio_md" rows={6} defaultValue={s.bio_md ?? ""} className={input} />
        </div>
      </section>

      <section className={`${card} space-y-4`}>
        <h2 className="font-medium">Stats</h2>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-[7rem_1fr] gap-3">
            <input name={`stat_value_${i}`} defaultValue={s.stats[i]?.value ?? ""} placeholder="40+" aria-label={`Stat ${i + 1} value`} className={input} />
            <input name={`stat_label_${i}`} defaultValue={s.stats[i]?.label ?? ""} placeholder="walls painted" aria-label={`Stat ${i + 1} label`} className={input} />
          </div>
        ))}
        <h2 className="pt-2 font-medium">Social links</h2>
        {SOCIALS.map((k) => field(`social_${k}`, k === "x" ? "X / Twitter" : k[0].toUpperCase() + k.slice(1), s.socials[k], { type: "url", placeholder: "https://" }))}
      </section>

      <section className={`${card} space-y-5 xl:col-span-2`}>
        <h2 className="font-medium">Images & video</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageField name="hero_image_path" altName="hero_image_alt" label="Hero photo (wide landscape)" defaultPath={s.hero_image_path} defaultAlt={s.hero_image_alt} />
          <ImageField name="story_image_path" altName="story_image_alt" label="Story portrait" defaultPath={s.story_image_path} defaultAlt={s.story_image_alt} />
          <ImageField name="process_poster_path" label="Process video poster" defaultPath={s.process_poster_path} />
          <VideoField name="process_video_url" label="Process video (“Watch the process” button)" defaultPath={s.process_video_url} allowLink />
        </div>
      </section>

      <div className="flex items-center gap-4 xl:col-span-2">
        <button disabled={pending} className={btn}>{pending ? "Saving…" : "Save settings"}</button>
        {state.message && <p role="status" className={`text-sm ${state.ok ? "text-emerald-300" : "text-danger"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
