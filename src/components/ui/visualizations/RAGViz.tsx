"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

export default function RAGViz() {
  const [failureMode, setFailureMode] = useState<"none" | "bad_chunking" | "irrelevant_retrieval" | "hallucination">("none");

  const pipelineState = useMemo(() => {
    const query = "How does RAG avoid hallucination?";
    
    let chunkingOutput = "Chunk 1: RAG retrieves context facts.\nChunk 2: LLMs use facts to ground answers.";
    let retrievedDoc = "RAG retrieves context facts from databases to ground answers.";
    let promptContext = "Context: RAG retrieves context facts from databases to ground answers.\nQuestion: How does RAG avoid hallucination?";
    let llmOutput = "RAG avoids hallucination by retrieving relevant context facts from databases to ground its answers.";

    if (failureMode === "bad_chunking") {
      chunkingOutput = "Chunk 1: RAG retrieves context\nChunk 2: facts. LLMs use facts to...";
      retrievedDoc = "RAG retrieves context";
      promptContext = "Context: RAG retrieves context\nQuestion: How does RAG avoid hallucination?";
      llmOutput = "Based on the context, RAG retrieves context. [Context is incomplete to answer]";
    } else if (failureMode === "irrelevant_retrieval") {
      chunkingOutput = "Chunk 1: RAG retrieves context facts.\nChunk 2: Fine-tuning updates weights.";
      retrievedDoc = "Fine-tuning updates weights of neural networks.";
      promptContext = "Context: Fine-tuning updates weights of neural networks.\nQuestion: How does RAG avoid hallucination?";
      llmOutput = "Fine-tuning updates weights of neural networks. [Irrelevant to RAG hallucination]";
    } else if (failureMode === "hallucination") {
      chunkingOutput = "Chunk 1: RAG retrieves context facts.\nChunk 2: LLMs use facts to ground answers.";
      retrievedDoc = "RAG retrieves context facts from databases to ground answers.";
      promptContext = "Context: RAG retrieves context facts from databases to ground answers.\nQuestion: How does RAG avoid hallucination?";
      llmOutput = "RAG avoids hallucination by using quantum encryption and blockchain security to verify prompt keys.";
    }

    return {
      query,
      chunkingOutput,
      retrievedDoc,
      promptContext,
      llmOutput
    };
  }, [failureMode]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox="0 0 640 440"
            className="w-full h-auto select-none"
            role="img"
            aria-label="RAG Pipeline Flow Diagram"
          >
            <title>Retrieval-Augmented Generation Pipeline</title>
            <defs>
              <pattern id="rag-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="640" height="440" fill="url(#rag-grid)" />

            {/* Connecting arrows */}
            {/* Query to Search */}
            <path d="M 120 70 L 200 70" stroke={COLORS.muted} strokeWidth={2} />
            {/* Search to Vector DB */}
            <path d="M 290 70 L 370 70" stroke={COLORS.muted} strokeWidth={2} />
            {/* Vector DB to Prompt builder */}
            <path d="M 460 70 L 460 170" stroke={COLORS.muted} strokeWidth={2} />
            {/* Query to Prompt builder */}
            <path d="M 60 120 L 60 210 L 370 210" stroke={COLORS.muted} strokeWidth={2} fill="none" />
            {/* Prompt builder to LLM */}
            <path d="M 460 250 L 460 300" stroke={COLORS.muted} strokeWidth={2} />

            {/* Step 1: User Query Box */}
            <g transform="translate(10, 30)">
              <rect width="110" height="80" fill={COLORS.bg} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={55} y={20} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLORS.muted}>1. USER QUERY</text>
              <text x={10} y={40} fontSize={8} fontWeight={700} fill={COLORS.cyan}>&quot;{pipelineState.query.slice(0, 18)}...&quot;</text>
            </g>

            {/* Step 2: Semantic Search (Retriever) */}
            <g transform="translate(200, 30)">
              <rect
                width="90"
                height="80"
                fill={COLORS.bg}
                stroke={failureMode === "irrelevant_retrieval" ? COLORS.pink : COLORS.border}
                strokeWidth={failureMode === "irrelevant_retrieval" ? 2.5 : 1.5}
              />
              <text x={45} y={20} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLORS.muted}>2. RETRIEVER</text>
              <text x={45} y={45} textAnchor="middle" fontSize={8} fontWeight={700} fill={failureMode === "irrelevant_retrieval" ? COLORS.pink : COLORS.cyan}>
                {failureMode === "irrelevant_retrieval" ? "BAD MATCH" : "COSINE SEARCH"}
              </text>
            </g>

            {/* Step 3: Vector DB / Document Chunk Index */}
            <g transform="translate(370, 30)">
              <rect
                width="90"
                height="80"
                fill={COLORS.bg}
                stroke={failureMode === "bad_chunking" ? COLORS.pink : COLORS.border}
                strokeWidth={failureMode === "bad_chunking" ? 2.5 : 1.5}
              />
              <text x={45} y={20} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLORS.muted}>3. INDEX</text>
              <text x={45} y={45} textAnchor="middle" fontSize={8} fontWeight={700} fill={failureMode === "bad_chunking" ? COLORS.pink : COLORS.cyan}>
                {failureMode === "bad_chunking" ? "BAD CHUNKING" : "FACT CHUNKS"}
              </text>
            </g>

            {/* Step 4: Prompt Context Construction Box */}
            <g transform="translate(190, 170)">
              <rect width="360" height="80" fill={COLORS.bg} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={180} y={20} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLORS.muted}>4. CONTEXT INJECTION (PROMPT TEMPLATE)</text>
              <text x={10} y={40} fontSize={8} fontWeight={700} fill={COLORS.cyan}>
                {pipelineState.promptContext.split("\n")[0].slice(0, 75)}...
              </text>
              <text x={10} y={55} fontSize={8} fontWeight={700} fill={COLORS.cyan}>
                {pipelineState.promptContext.split("\n")[1].slice(0, 75)}...
              </text>
            </g>

            {/* Step 5: Large Language Model (LLM) */}
            <g transform="translate(190, 300)">
              <rect
                width="360"
                height="90"
                fill={COLORS.bg}
                stroke={failureMode === "hallucination" ? COLORS.pink : COLORS.border}
                strokeWidth={failureMode === "hallucination" ? 2.5 : 1.5}
              />
              <text x={180} y={20} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.muted}>
                5. LLM GENERATION {failureMode === "hallucination" && "— HALLUCINATION"}
              </text>
              
              {/* Output text wrapped into 2 lines */}
              <text x={15} y={45} fontSize={8} fontWeight={700} fill={failureMode === "hallucination" ? COLORS.pink : COLORS.cyan}>
                {pipelineState.llmOutput.slice(0, 75)}
              </text>
              <text x={15} y={60} fontSize={8} fontWeight={700} fill={failureMode === "hallucination" ? COLORS.pink : COLORS.cyan}>
                {pipelineState.llmOutput.slice(75, 150)}
              </text>
            </g>

            <text x={320} y={420} fill={COLORS.muted} fontSize={12} fontWeight={600} textAnchor="middle">
              RAG pipeline: Query → Semantic Search → Context Prompt → LLM Response
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {/* Control Panel */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Failure Mode Toggle</span>
          </div>

          <div className="flex flex-col gap-2">
            <button aria-label="Normal RAG (Correct)"
              onClick={() => setFailureMode("none")}
              className={`w-full text-left p-2 border rounded text-xs cursor-pointer ${
                failureMode === "none" ? "border-cyan bg-cyan/10 font-bold" : "border-outline bg-surface hover:bg-grid"
              }`}
            >
              Normal RAG (Correct)
            </button>
            <button aria-label="Bad Chunking"
              onClick={() => setFailureMode("bad_chunking")}
              className={`w-full text-left p-2 border rounded text-xs cursor-pointer ${
                failureMode === "bad_chunking" ? "border-pink bg-pink/10 font-bold" : "border-outline bg-surface hover:bg-grid"
              }`}
            >
              Bad Chunking
            </button>
            <button aria-label="Irrelevant Retrieval"
              onClick={() => setFailureMode("irrelevant_retrieval")}
              className={`w-full text-left p-2 border rounded text-xs cursor-pointer ${
                failureMode === "irrelevant_retrieval" ? "border-pink bg-pink/10 font-bold" : "border-outline bg-surface hover:bg-grid"
              }`}
            >
              Irrelevant Retrieval
            </button>
            <button aria-label="Hallucinated Answer"
              onClick={() => setFailureMode("hallucination")}
              className={`w-full text-left p-2 border rounded text-xs cursor-pointer ${
                failureMode === "hallucination" ? "border-pink bg-pink/10 font-bold" : "border-outline bg-surface hover:bg-grid"
              }`}
            >
              Hallucinated Answer
            </button>
          </div>
        </div>

        {/* Diagnosis log */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Pipeline Diagnostic</div>
          <p className="text-xs leading-relaxed text-on-surface-variant">
            {failureMode === "none" && (
              "The retriever pulls correct information from the index. The prompt contains grounded, accurate facts. The LLM produces a verified response."
            )}
            {failureMode === "bad_chunking" && (
              "Document partitions occur mid-sentence. When the matching chunk is retrieved, it is cut short, leaving the LLM without the full context to answer correctly."
            )}
            {failureMode === "irrelevant_retrieval" && (
              "Vector search fails because of semantic gap or keyword mismatch. The retriever loads unrelated documents, leading to an irrelevant prompt context."
            )}
            {failureMode === "hallucination" && (
              "Although the prompt context contains the exact facts needed, the LLM ignores the context constraints and fabricates unrelated claims."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
