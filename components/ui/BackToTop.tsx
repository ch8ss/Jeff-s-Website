"use client";

export function BackToTop() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 transition-colors hover:border-accent hover:bg-accent"
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
