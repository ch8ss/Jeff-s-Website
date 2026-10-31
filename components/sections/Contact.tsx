import type { Settings } from "@/lib/types";
import { SectionLabel } from "../ui/SectionLabel";
import { Socials } from "../ui/Socials";
import { ContactForm } from "./ContactForm";

export function Contact({ settings }: { settings: Settings }) {
  const email = settings.contact_email ?? "";
  return (
    <section id="contact" aria-labelledby="contact-title" data-bg="#150E26" data-theme="dark" className="grain relative isolate overflow-hidden bg-[#150E26] px-5 py-24 text-text-light md:px-10 md:py-36">
      <div aria-hidden="true" className="absolute -bottom-40 left-1/2 -z-10 h-[680px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(123,47,255,0.55),rgba(123,47,255,0.14)_55%,transparent)] blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-24 left-[62%] -z-10 h-[320px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(166,255,77,0.22),transparent)] blur-3xl" />
      <div className="mx-auto max-w-[1500px]">
        <SectionLabel n="06">Contact</SectionLabel>
        <h2 id="contact-title" className="mt-6 text-[clamp(3.2rem,9vw,9rem)]">
          <span className="block overflow-hidden"><span data-reveal="up" className="display block">Let&apos;s paint</span></span>
          <span className="block overflow-hidden">
            <span data-reveal="up" className="block">
              <span className="display">Something </span>
              <span className="serif-italic leading-none text-accent-2">unforgettable.</span>
            </span>
          </span>
        </h2>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="space-y-8">
            <div>
              <p className="label text-text-light/75">Commissions</p>
              <a href={`mailto:${email}?subject=${encodeURIComponent("Wall commission")}`} className="serif-italic mt-1 block text-3xl break-all hover:text-accent md:text-4xl">
                {email}
              </a>
            </div>
            <div>
              <p className="label text-text-light/75">Collabs / Press</p>
              <a href={`mailto:${email}?subject=${encodeURIComponent("Collab / press")}`} className="serif-italic mt-1 block text-3xl break-all hover:text-accent md:text-4xl">
                {email}
              </a>
            </div>
            <p className="serif-italic text-xl text-text-light/90">Jeff replies within 3 working days.</p>
            <Socials socials={settings.socials} />
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
