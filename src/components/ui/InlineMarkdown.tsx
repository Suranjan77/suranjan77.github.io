import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins, markdownRemarkPlugins } from "@/lib/markdown";

interface InlineMarkdownProps {
  content: string;
  className?: string;
}

export default function InlineMarkdown({
  content,
  className = "",
}: InlineMarkdownProps) {
  return (
    <span className={className}>
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={{
          p: ({ children }) => <span>{children}</span>,
          strong: ({ children }) => (
            <strong className="font-semibold text-on-surface">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, ...props }) => (
            <a className="text-primary hover:underline" {...props}>
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="border border-outline bg-surface-container-high px-1 py-0.5 font-mono text-[0.92em] text-primary">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  );
}
