import type { Socials as SocialsT } from "@/lib/types";
import { SOCIAL_NAMES, socialEntries } from "@/lib/socials";

export function Socials({ socials, className = "", itemClassName = "" }: { socials: SocialsT; className?: string; itemClassName?: string }) {
  const entries = socialEntries(socials);
  if (!entries.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {entries.map(([key, url]) => (
        <li key={key}>
          <a href={url} target="_blank" rel="noopener noreferrer me" className={`label hover:text-accent transition-colors ${itemClassName}`}>
            {SOCIAL_NAMES[key] ?? key}
          </a>
        </li>
      ))}
    </ul>
  );
}
