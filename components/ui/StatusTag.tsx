import { STATUS_LABEL } from "@/lib/format";

const tone: Record<string, string> = {
  available: "bg-accent/10 text-accent border-accent/35",
  reserved: "bg-amber-400/15 text-amber-200 border-amber-200/30",
  sold: "bg-danger/10 text-danger border-danger/40",
  not_for_sale: "bg-white/5 text-muted border-white/15",
  completed: "bg-white/5 text-text-light/80 border-white/20",
  in_progress: "bg-amber-400/15 text-amber-200 border-amber-200/30",
  live_painting: "bg-accent-2/15 text-accent-2 border-accent-2/40",
  open_slot: "bg-accent/10 text-accent border-accent/35",
};

export function StatusTag({ status, className = "" }: { status: string | null; className?: string }) {
  if (!status) return null;
  return <span className={`label inline-block rounded-full border px-2.5 py-1 text-[10px] ${tone[status] ?? tone.completed} ${className}`}>{STATUS_LABEL[status] ?? status}</span>;
}
