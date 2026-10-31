import type { ReactNode } from "react";

/** CSS-only marquee. Content is duplicated once (second copy aria-hidden) for a seamless loop. */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  pauseOnHover = false,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track" data-reverse={reverse} data-pause={pauseOnHover} style={{ ["--marquee-duration" as string]: `${duration}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
