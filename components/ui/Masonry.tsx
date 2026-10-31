import type { ReactNode } from "react";

type Item = { key: string; ratio: number; node: ReactNode };
type Layout = { cols: number; className: string };

const sum = (col: Item[]) => col.reduce((h, it) => h + it.ratio, 0);

/**
 * Shortest-column-first placement, then a short rebalancing pass on the last items of each column
 * (move or swap when it narrows the gap) so the columns end at nearly the same height.
 */
function distribute(items: Item[], cols: number) {
  const columns: Item[][] = Array.from({ length: cols }, () => []);
  const heights = new Array(cols).fill(0);
  for (const it of items) {
    const i = heights.indexOf(Math.min(...heights));
    columns[i].push(it);
    heights[i] += it.ratio; // height relative to column width
  }
  if (cols < 2) return columns;
  for (let pass = 0; pass < 30; pass++) {
    const h = columns.map(sum);
    const hi = h.indexOf(Math.max(...h));
    const lo = h.indexOf(Math.min(...h));
    const gap = h[hi] - h[lo];
    const tall = columns[hi].slice(-6);
    const short = columns[lo].slice(-6);
    let best: { gap: number; apply: () => void } | null = null;
    for (const t of tall) {
      // move t from tallest to shortest
      const g1 = Math.abs(gap - 2 * t.ratio);
      if (g1 < gap - 0.05 && (!best || g1 < best.gap))
        best = { gap: g1, apply: () => (columns[hi].splice(columns[hi].indexOf(t), 1), columns[lo].push(t)) };
      // swap t with a shorter item s
      for (const sItem of short) {
        const d = t.ratio - sItem.ratio;
        if (d <= 0) continue;
        const g2 = Math.abs(gap - 2 * d);
        if (g2 < gap - 0.05 && (!best || g2 < best.gap))
          best = {
            gap: g2,
            apply: () => {
              columns[hi][columns[hi].indexOf(t)] = sItem;
              columns[lo][columns[lo].indexOf(sItem)] = t;
            },
          };
      }
    }
    if (!best) break;
    best.apply();
  }
  return columns;
}

/**
 * Balanced masonry with no client JS: one pre-computed layout per breakpoint, toggled with CSS
 * (hidden layouts are display:none, so their lazy images never load and screen readers skip them).
 */
export function Masonry({ items, layouts, gap = "gap-2", extraRatio = 0 }: { items: Item[]; layouts: Layout[]; gap?: string; extraRatio?: number }) {
  const withExtra = items.map((i) => ({ ...i, ratio: i.ratio + extraRatio }));
  return (
    <>
      {layouts.map((l) => (
        <div key={l.cols} className={`${l.className} ${gap}`}>
          {distribute(withExtra, l.cols).map((col, ci) => (
            <ul key={ci} className={`flex min-w-0 flex-1 flex-col ${gap}`}>
              {col.map((it) => (
                <li key={it.key}>{it.node}</li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </>
  );
}
