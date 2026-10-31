"use client";

import { useActionState, useState } from "react";
import { sendEnquiry } from "@/app/actions/enquiry";
import { TOPICS, type EnquiryState } from "@/lib/enquiry-schema";
import { Arrow } from "../ui/Arrow";

const field =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-text-light placeholder:text-white/35 outline-none transition-colors focus:border-accent";

function Err({ msg, id }: { msg?: string; id: string }) {
  return msg ? (
    <p id={id} className="mt-1.5 text-xs text-danger">
      {msg}
    </p>
  ) : null;
}

export function ContactForm() {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { ok: false });
  const [count, setCount] = useState(0);
  const [topic, setTopic] = useState<string>("");
  const [dateType, setDateType] = useState<"text" | "date">("text");
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="glass flex min-h-[420px] flex-col items-start justify-center rounded-[24px] p-8 md:p-10" role="status">
        <p className="label text-accent">Enquiry sent</p>
        <p className="serif-italic mt-4 text-4xl">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="glass rounded-[24px] p-6 md:p-9" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="label mb-2 block text-text-light/85">Your name</label>
          <input id="name" name="name" autoComplete="name" required className={field} aria-invalid={!!e.name} aria-describedby={e.name ? "name-err" : undefined} />
          <Err msg={e.name} id="name-err" />
        </div>
        <div>
          <label htmlFor="email" className="label mb-2 block text-text-light/85">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required className={field} aria-invalid={!!e.email} aria-describedby={e.email ? "email-err" : undefined} />
          <Err msg={e.email} id="email-err" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="organisation" className="label mb-2 block text-text-light/85">Organisation <span className="normal-case text-text-light/60">(optional)</span></label>
          <input id="organisation" name="organisation" autoComplete="organization" className={field} />
        </div>

        <fieldset className="md:col-span-2">
          <legend className="serif-italic mb-3 text-xl">What&apos;s it about? <span className="text-danger" aria-hidden="true">*</span></legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <label key={t} className={`label inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${topic === t ? "border-accent bg-accent text-ink" : "border-white/20 hover:border-white/50"}`}>
                <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />
                {t}
              </label>
            ))}
          </div>
          <Err msg={e.topic} id="topic-err" />
        </fieldset>

        <div className="md:col-span-2">
          <label htmlFor="preferred_date" className="label mb-2 block text-text-light/85">Wall date <span className="normal-case text-text-light/60">(optional)</span></label>
          <input
            id="preferred_date"
            name="preferred_date"
            type={dateType}
            placeholder="Pick a date"
            onFocus={() => setDateType("date")}
            onBlur={(ev) => !ev.target.value && setDateType("text")}
            className={`${field} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-70`}
          />
        </div>

        <div className="md:col-span-2">
          <div className="mb-2 flex justify-between">
            <label htmlFor="message" className="label text-text-light/85">Message</label>
            <span className={`label ${count > 600 ? "text-danger" : "opacity-50"}`} aria-live="polite">{count} / 600</span>
          </div>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={600}
            required
            placeholder="A few lines is plenty."
            onChange={(ev) => setCount(ev.target.value.length)}
            className={`${field} resize-none`}
            aria-invalid={!!e.message}
            aria-describedby={e.message ? "message-err" : undefined}
          />
          <Err msg={e.message} id="message-err" />
        </div>

        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="company_website">Leave this empty</label>
          <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-start gap-3 text-sm text-text-light/80">
            <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#A6FF4D]" aria-describedby={e.consent ? "consent-err" : undefined} />
            I agree that Jeff may store these details to reply to me.
          </label>
          <Err msg={e.consent} id="consent-err" />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="label inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-ink transition-colors hover:bg-accent-hover disabled:opacity-60">
          {pending ? "Sending…" : "Send enquiry"} <Arrow />
        </button>
        <p className="text-xs text-text-light/55">Your details stay private. No newsletters.</p>
      </div>
      {state.message && !state.ok && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
