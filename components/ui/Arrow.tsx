export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={`inline-block h-[0.8em] w-[0.8em] ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}
