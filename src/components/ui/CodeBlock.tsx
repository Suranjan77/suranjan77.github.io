"use client";

interface CodeBlockProps {
  code: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-white/5">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-error/40"></div>
          <div className="w-3 h-3 rounded-full bg-tertiary/40"></div>
          <div className="w-3 h-3 rounded-full bg-primary/40"></div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-500">model_fitting.py</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            Copy
          </button>
        </div>
      </div>
      <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
        <pre className="text-slate-300">{code}</pre>
      </div>
    </div>
  );
}
