import React from "react";
import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins, markdownRemarkPlugins } from "@/lib/markdown";

interface LogicContentProps {
  content: string;
  className?: string;
  size?: "sm" | "base";
}

function formatLogicContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(\$\$)/g, "$1\n\n$2")
    .replace(/(\$\$)\n([^\n])/g, "$1\n\n$2")
    .replace(/([^\n])\n(- |\* |\d+\. )/g, "$1\n\n$2")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    .trim();
}

export default function LogicContent({ content, className, size = "base" }: LogicContentProps) {
  const formatted = formatLogicContent(content);
  const isSm = size === "sm";

  return (
    <div className={`logic-markdown ${className || (isSm ? "text-on-surface" : "text-on-surface-variant")}`}>
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={{
          h1: ({ children }) => (
            <h1 className={isSm ? "mt-4 mb-2 font-headline text-lg font-bold tracking-tight text-on-surface first:mt-0" : "mt-8 mb-4 font-headline text-3xl font-bold tracking-tight text-on-surface first:mt-0"}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={isSm ? "mt-3 mb-1.5 font-headline text-base font-semibold tracking-tight text-on-surface first:mt-0" : "mt-7 mb-3 font-headline text-2xl font-semibold tracking-tight text-on-surface first:mt-0"}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={isSm ? "mt-2 mb-1 font-headline text-base font-semibold tracking-tight text-on-surface first:mt-0 sm:text-sm" : "mt-6 mb-3 font-headline text-xl font-semibold tracking-tight text-on-surface first:mt-0"}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={isSm ? "mt-1.5 mb-1 font-headline text-sm font-semibold text-on-surface first:mt-0 sm:text-xs" : "mt-5 mb-2 font-headline text-lg font-semibold text-on-surface first:mt-0"}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={isSm ? "my-1 text-[15px] leading-7 text-on-surface first:mt-0 last:mb-0 sm:text-sm" : "my-4 text-[17px] leading-8 text-on-surface-variant first:mt-0 last:mb-0 sm:text-base"}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={isSm ? "my-1 ml-4 list-disc space-y-1 marker:text-primary" : "my-4 ml-5 list-disc space-y-2 marker:text-primary"}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={isSm ? "my-1 ml-4 list-decimal space-y-1 marker:text-primary" : "my-4 ml-5 list-decimal space-y-2 marker:text-primary"}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={isSm ? "pl-0.5 text-[15px] leading-7 text-on-surface sm:text-sm" : "pl-1 text-[17px] leading-8 text-on-surface-variant sm:text-base"}>
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-on-surface">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-on-surface">{children}</em>
          ),
          hr: () => <hr className="my-4 border-white/10" />,
          blockquote: ({ children }) => (
            <blockquote className={isSm ? "my-2 border border-outline border-l-primary bg-surface px-3 py-2 text-[15px] text-on-surface sm:py-1.5 sm:text-sm" : "my-6 border border-outline border-l-primary bg-surface px-4 py-3 text-[17px] text-on-surface sm:text-base"}>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="border border-outline bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.92em] text-primary">
              {children}
            </code>
          ),
        }}
      >
        {formatted}
      </ReactMarkdown>
    </div>
  );
}
