import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Server-rendered Markdown. Raw HTML is not enabled, so post content can't inject scripts. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-lg prose-invert max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:font-normal prose-headings:uppercase prose-headings:tracking-normal prose-h2:text-4xl prose-a:text-accent prose-strong:text-white prose-blockquote:border-accent-2 prose-blockquote:font-[family-name:var(--font-serif)] prose-blockquote:text-3xl prose-blockquote:font-normal prose-blockquote:italic prose-blockquote:text-accent-2 prose-img:rounded-2xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
