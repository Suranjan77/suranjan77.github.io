"use client";

import React, { useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const QUERY = "What is Acme's refund window for enterprise plans?";

// A tiny knowledge base. Only the first chunk actually answers the query; the
// rest are distractors with lower similarity.
const KB = [
  { id: 1, text: "Enterprise plans include a 45-day refund window.", sim: 0.92, answersIt: true },
  { id: 2, text: "Free trials last 14 days before billing starts.", sim: 0.44 },
  { id: 3, text: "Support responds to tickets within 24 hours.", sim: 0.27 },
  { id: 4, text: "Acme was founded in 2019 in Berlin.", sim: 0.15 },
];

export default function RAGViz() {
  const [ragOn, setRagOn] = useState(false);

  const ranked = [...KB].sort((a, b) => b.sim - a.sim);
  const top = ranked[0];

  const caption = ragOn
    ? `Retrieval ranks the knowledge base by similarity to the question, pulls the top chunk (doc ${top.id}, ${(top.sim * 100).toFixed(0)}% match) into the prompt, and the model answers from it — correct and cited. The model never memorized this; it read it at question time.`
    : `Without retrieval the model has never seen Acme's private policy, so it produces a fluent, confident, and wrong number. Nothing grounds it. Turn retrieval on to fix it.`;

  const canvas = (
    <div role="img" aria-label="RAG Pipeline Flow Diagram" className="flex flex-col gap-3 p-4 font-sans">
      {/* query */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 border border-outline bg-surface-container-high px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">Question</span>
        <span className="text-[14px] font-semibold text-on-surface">{QUERY}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* knowledge base / retrieval */}
        <div className="border border-outline bg-surface p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
            <span>Knowledge base</span>
            <span style={{ color: ragOn ? COLORS.green : COLORS.muted }}>{ragOn ? "retrieving…" : "not used"}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {ranked.map((c) => {
              const isTop = ragOn && c.id === top.id;
              return (
                <div key={c.id} className={`border px-2 py-1.5 ${isTop ? "border-2" : "border"}`} style={{ borderColor: isTop ? COLORS.green : COLORS.border, background: isTop ? "rgba(85,107,74,0.10)" : "transparent" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-on-surface">{c.text}</span>
                    {isTop && <span className="shrink-0 font-mono text-[9px] font-bold uppercase" style={{ color: COLORS.green }}>pulled</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-grid">
                      <div className="h-full" style={{ width: `${c.sim * 100}%`, background: ragOn ? (isTop ? COLORS.green : COLORS.cyan) : COLORS.border }} />
                    </div>
                    <span className="w-9 text-right font-mono text-[10px] text-on-surface-variant">{(c.sim * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* answer */}
        <div className="flex flex-col">
          <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">LLM answer</div>
          <div className="flex-1 border-2 p-3" style={{ borderColor: ragOn ? COLORS.green : COLORS.pink, background: ragOn ? "rgba(85,107,74,0.08)" : "rgba(141,81,73,0.07)" }}>
            {ragOn ? (
              <>
                <p className="text-[14px] font-semibold text-on-surface" data-testid="rag-answer">
                  Enterprise plans have a <strong>45-day</strong> refund window.
                </p>
                <p className="mt-2 font-mono text-[11px] font-bold" style={{ color: COLORS.green }}>✓ grounded — cites doc {top.id}</p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-semibold text-on-surface" data-testid="rag-answer">
                  Enterprise plans come with a standard <strong>30-day</strong> money-back guarantee.
                </p>
                <p className="mt-2 font-mono text-[11px] font-bold" style={{ color: COLORS.pink }}>⚠ no sources — confidently made up</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const controls = (
    <>
      <div className="flex flex-1 items-center justify-between gap-3 border border-outline bg-surface p-3">
        <div>
          <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Retrieval</div>
          <p className="font-sans text-[12px] text-on-surface-variant">
            {ragOn ? "On — answer is grounded in the knowledge base." : "Off — the model answers from memory alone."}
          </p>
        </div>
        <button
          aria-label="Toggle retrieval"
          aria-pressed={ragOn}
          onClick={() => setRagOn((r) => !r)}
          className={`flex h-10 items-center justify-center border px-5 font-mono text-[13px] font-bold uppercase tracking-wide transition-colors ${
            ragOn ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface hover:bg-surface-container"
          }`}
        >
          {ragOn ? "Retrieval ON" : "Retrieval OFF"}
        </button>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        An LLM only knows what was in its training data — frozen at a cutoff, and never your private
        or up-to-the-minute facts. Asked about them, it doesn&apos;t say &quot;I don&apos;t
        know&quot;; it produces a fluent, plausible <strong>hallucination</strong>.
      </p>
      <p>
        <strong>Retrieval-Augmented Generation</strong> fixes this without retraining: embed the
        question, search a knowledge base for the most similar chunks, paste them into the prompt,
        and let the model answer <em>from that evidence</em>. The answer becomes current, grounded,
        and citable.
      </p>
      <p>
        It is the dominant pattern for question-answering over documents — and its quality lives or
        dies on the <em>retrieval</em> step finding the right chunk.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
