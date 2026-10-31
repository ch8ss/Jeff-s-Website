/** Placeholder mark (spray tag "J" with a drip). Swap for Jeff's real SVG logo. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#7B2FFF" />
      <path d="M19.5 8v10.5a4.5 4.5 0 0 1-8.6 1.9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M19.5 18.5v6.5" stroke="#A6FF4D" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="19.5" cy="26.2" r="1.3" fill="#A6FF4D" />
    </svg>
  );
}
