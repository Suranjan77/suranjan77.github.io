"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

const codeTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: '#4A4540',
    fontFamily: 'var(--font-mono), monospace',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.7',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#4A4540',
    fontFamily: 'var(--font-mono), monospace',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.7',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    padding: '0',
    margin: '0',
    overflow: 'auto',
    background: 'transparent',
  },
  'comment': { color: '#9E978F', fontStyle: 'italic' },
  'prolog': { color: '#9E978F' },
  'doctype': { color: '#9E978F' },
  'cdata': { color: '#9E978F' },
  'punctuation': { color: '#8A8580' },
  'namespace': { opacity: '.7' },
  'property': { color: '#556B4A' },
  'keyword': { color: '#BA6A62', fontWeight: 'bold' },
  'tag': { color: '#556B4A' },
  'class-name': { color: '#68805F', fontWeight: 'bold' },
  'boolean': { color: '#CFA05F', fontWeight: 'bold' },
  'constant': { color: '#CFA05F' },
  'symbol': { color: '#BA6A62' },
  'deleted': { color: '#BA6A62' },
  'number': { color: '#CFA05F' },
  'selector': { color: '#68805F' },
  'attr-name': { color: '#556B4A' },
  'string': { color: '#68805F' },
  'char': { color: '#68805F' },
  'builtin': { color: '#556B4A' },
  'inserted': { color: '#68805F' },
  'variable': { color: '#4A4540' },
  'operator': { color: '#8A8580' },
  'entity': { color: '#CFA05F', cursor: 'help' },
  'url': { color: '#556B4A' },
  '.language-css .token.string': { color: '#68805F' },
  '.style .token.string': { color: '#68805F' },
  'atrule': { color: '#BA6A62' },
  'attr-value': { color: '#68805F' },
  'function': { color: '#556B4A', fontWeight: 'bold' },
  'regex': { color: '#CFA05F' },
  'important': { color: '#BA6A62', fontWeight: 'bold' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
};

interface CodeBlockProps {
  code: string;
  fileName?: string;
  language?: string;
}

function inferLanguage(code: string, language?: string) {
  if (language) return language;

  const normalized = code.toLowerCase();
  
  if (
    normalized.includes("import torch") ||
    normalized.includes("import numpy") ||
    normalized.includes("import pandas") ||
    normalized.includes("import scipy") ||
    normalized.includes("from scipy") ||
    normalized.includes("nn.module") ||
    normalized.includes("def __init__") ||
    normalized.includes("from sklearn") ||
    normalized.includes("def ")
  ) {
    return "Python";
  }

  if (
    normalized.includes("interface ") ||
    normalized.includes("type ") ||
    normalized.includes("export default") ||
    normalized.includes("const ")
  ) {
    return "TypeScript";
  }

  if (
    normalized.includes("function ") ||
    normalized.includes("console.log") ||
    normalized.includes("=>")
  ) {
    return "JavaScript";
  }

  return "Code";
}

function inferFileName(code: string, fileName?: string, detectedLanguage?: string) {
  if (fileName) return fileName;

  const normalized = code.toLowerCase();

  if (normalized.includes("import torch") || normalized.includes("from sklearn") || normalized.includes("import numpy") || normalized.includes("def ")) {
    return "model_fitting.py";
  }

  if (detectedLanguage === "TypeScript") return "example.ts";
  if (detectedLanguage === "JavaScript") return "example.js";

  return "example.txt";
}

export default function CodeBlock({
  code,
  fileName,
  language,
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const detectedLanguage = useMemo(
    () => inferLanguage(code, language),
    [code, language]
  );

  const displayFileName = useMemo(
    () => inferFileName(code, fileName, detectedLanguage),
    [code, fileName, detectedLanguage]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const buttonLabel = copyState === "copied" ? "COPIED!" : copyState === "error" ? "FAILED" : "COPY CODE";

  return (
    <div className="mb-6 overflow-hidden border border-outline bg-surface-container-lowest">
      <div className="flex flex-col gap-3 border-b border-outline bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex items-center gap-3">
          <div className="border border-outline bg-surface-container-high px-2.5 py-1.5 font-mono text-[12px] font-normal uppercase tracking-[0.12em] text-primary sm:py-1">
            {detectedLanguage}
          </div>
          <div className="truncate font-mono text-[15px] font-medium text-on-surface">
            {displayFileName}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className={`inline-flex items-center justify-center border px-3 py-2 font-mono text-[13px] font-normal uppercase tracking-[0.12em] transition-colors sm:py-1.5 ${
            copyState === "copied"
              ? "border-secondary/40 bg-secondary/15 text-secondary"
              : copyState === "error"
                ? "border-error/40 bg-error/15 text-error"
                : "border-outline bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          {buttonLabel}
        </button>
      </div>

      <div className="overflow-x-auto px-4 py-5 sm:px-6 relative">
        <SyntaxHighlighter
          language={detectedLanguage.toLowerCase()}
          style={codeTheme}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: "3em", paddingRight: "1em", color: "#BEB6A5", textAlign: "right" }}
          customStyle={{
            background: "transparent",
            padding: 0,
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono), monospace" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
