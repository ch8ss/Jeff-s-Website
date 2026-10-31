import type { Socials as SocialsT } from "@/lib/types";

const NAMES: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  behance: "Behance",
  x: "X",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

export function Socials({ socials, className = "", itemClassName = "" }: { socials: SocialsT; className?: string; itemClassName?: string }) {
  const entries = Object.entries(socials ?? {}).filter(([, url]) => url);
  if (!entries.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {entries.map(([key, url]) => (
        <li key={key}>
          <a href={url} target="_blank" rel="noopener noreferrer me" className={`label hover:text-accent transition-colors ${itemClassName}`}>
            {NAMES[key] ?? key}
          </a>
        </li>
      ))}
    </ul>
  );
}
