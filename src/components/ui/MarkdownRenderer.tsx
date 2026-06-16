"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import { markdownRehypePlugins, markdownRemarkPlugins } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none prose-p:text-[15px] prose-li:text-[15px] prose-p:leading-relaxed prose-headings:font-headline break-words overflow-hidden [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2 [&_.katex-display]:scrollbar-thin ${className}`}>
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={{
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
