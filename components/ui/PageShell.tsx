import type { ReactNode } from "react";

/** Dark shell for inner pages (nav reads data-theme to flip to light text). */
export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-theme="dark" className={`min-h-screen bg-ink px-5 pt-32 pb-24 text-text-light md:px-10 md:pt-40 ${className}`}>
      <div className="mx-auto max-w-[1500px]">{children}</div>
    </div>
  );
}
