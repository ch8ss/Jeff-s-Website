import type { Socials } from "./types";

export const SOCIAL_NAMES: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  behance: "Behance",
  x: "X",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

/** Filled-in links in a fixed order (the DB's jsonb doesn't keep key order). */
export function socialEntries(socials: Socials | null | undefined) {
  const order = Object.keys(SOCIAL_NAMES);
  const rank = (k: string) => (order.includes(k) ? order.indexOf(k) : order.length);
  return Object.entries(socials ?? {})
    .filter((e): e is [string, string] => !!e[1])
    .sort(([a], [b]) => rank(a) - rank(b));
}
