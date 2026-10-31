import Link from "next/link";
import type { Settings } from "@/lib/types";
import { NAV_LINKS } from "@/lib/nav";
import { Socials } from "./Socials";
import { BackToTop } from "./BackToTop";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="relative overflow-hidden bg-ink px-5 pt-20 pb-8 text-text-light md:px-10" data-theme="dark">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <BackToTop />
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="label opacity-70 hover:text-accent hover:opacity-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Socials socials={settings.socials} className="md:justify-end" itemClassName="opacity-70" />
        </div>

        <p
          aria-hidden="true"
          className="display mt-16 select-none bg-[linear-gradient(90deg,#7B2FFF_8%,#B57CFF_42%,#6EE7C2_70%,#A6FF4D_94%)] bg-clip-text text-center leading-[0.8] text-transparent"
          style={{ fontSize: "clamp(6rem, 33vw, 36rem)" }}
        >
          {settings.artist_name}
        </p>

        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-muted">
          © 2026 {settings.artist_name}. All artwork © {settings.artist_name}. Do not reproduce without permission.
        </p>
      </div>
    </footer>
  );
}
