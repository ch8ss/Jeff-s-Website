"use server";

import { headers } from "next/headers";
import { enquirySchema, type EnquiryState } from "@/lib/enquiry-schema";
import { hasSupabase, ARTIST_EMAIL } from "@/lib/site";
import { publicClient } from "@/lib/supabase/public";
import { adminClient } from "@/lib/supabase/admin";

// Best-effort per-instance limiter. The DB check below covers the multi-instance case.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Honeypot: real people never see or fill this field.
  if (formData.get("company_website")) return { ok: true, message: "Thanks! Jeff will be in touch." };

  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, errors, message: "Please check the highlighted fields." };
  }
  const d = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(`ip:${ip}`) || limited(`email:${d.email.toLowerCase()}`)) {
    return { ok: false, message: "You've sent a few already. Please try again in a few minutes." };
  }

  const row = {
    name: d.name,
    email: d.email,
    organisation: d.organisation || null,
    topic: d.topic,
    preferred_date: d.preferred_date || null,
    message: d.message,
    artwork_id: d.artwork_id || null,
  };

  if (hasSupabase) {
    const admin = adminClient();
    if (admin) {
      const since = new Date(Date.now() - WINDOW_MS).toISOString();
      const { count } = await admin.from("enquiries").select("id", { count: "exact", head: true }).eq("email", d.email).gte("created_at", since);
      if ((count ?? 0) >= MAX_PER_WINDOW) return { ok: false, message: "You've sent a few already. Please try again in a few minutes." };
    }
    const { error } = await publicClient().from("enquiries").insert(row);
    if (error) {
      console.error("enquiry insert failed", error);
      return { ok: false, message: `Something went wrong. Please email ${ARTIST_EMAIL} directly.` };
    }
  } else {
    console.info("[demo mode] enquiry received", row);
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.RESEND_FROM ?? "Website <onboarding@resend.dev>",
        to: ARTIST_EMAIL,
        replyTo: d.email,
        subject: `New enquiry: ${d.topic} from ${d.name}`,
        text: `${d.name} <${d.email}>${d.organisation ? ` (${d.organisation})` : ""}\nTopic: ${d.topic}\nDate: ${d.preferred_date || "—"}\n\n${d.message}`,
      });
    } catch (e) {
      console.error("resend failed", e);
    }
  }

  return { ok: true, message: "Thanks! Jeff replies within 3 working days." };
}
