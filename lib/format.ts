import type { Artwork } from "./types";

export function formatPrice(price: number | null, currency = "INR") {
  if (price == null) return "Price on request";
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatSize(a: Pick<Artwork, "width_cm" | "height_cm">) {
  if (!a.width_cm || !a.height_cm) return null;
  return `${a.width_cm} × ${a.height_cm} cm`;
}

export function formatDate(iso: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(iso));
}

export const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  not_for_sale: "Not for sale",
  completed: "Completed",
  in_progress: "In progress",
  live_painting: "Live painting",
  open_slot: "Open slot",
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
