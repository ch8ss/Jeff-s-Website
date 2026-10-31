"use client";

import { useOptimistic, useTransition } from "react";
import { toggleArtworkField } from "@/app/admin/actions";

export function Toggle({ id, field, value, label }: { id: string; field: "is_featured" | "is_for_sale" | "published"; value: boolean; label: string }) {
  const [opt, setOpt] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={opt}
      aria-label={label}
      onClick={() =>
        start(async () => {
          setOpt(!opt);
          await toggleArtworkField(id, field, !opt);
        })
      }
      className={`relative h-5 w-9 rounded-full transition-colors ${opt ? "bg-accent" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${opt ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}
