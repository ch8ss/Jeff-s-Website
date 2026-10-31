export function SectionLabel({ n, children, className = "" }: { n: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 ${className}`}>
      <span>{n}</span>
      <span aria-hidden="true" className="block h-px w-8 bg-current opacity-50" />
      <span>{children}</span>
    </p>
  );
}
