"use client";

import React, { useState, useMemo } from "react";
type Precision = "fp16" | "int8" | "int4";

export default function AIInferenceViz() {
  const [paramsBillion, setParamsBillion] = useState<number>(8); // 1B to 70B
  const [precision, setPrecision] = useState<Precision>("fp16");
  const [seqLength, setSeqLength] = useState<number>(2048); // 512 to 8192
  const [batchSize, setBatchSize] = useState<number>(16); // 1 to 64

  const results = useMemo(() => {
    // 1. Precision multiplier (bytes per parameter)
    let precisionBytes = 2.0;
    if (precision === "int8") precisionBytes = 1.0;
    if (precision === "int4") precisionBytes = 0.5;

    // 2. Model Weight size in GB
    const weightMemGB = paramsBillion * precisionBytes;

    // 3. KV Cache size in GB
    // Llama-3-like configuration presets depending on parameter size:
    // Scale layers and hidden dims dynamically to make it realistic
    let numLayers = 32;
    let hiddenDim = 4096;
    if (paramsBillion < 3) {
      numLayers = 24;
      hiddenDim = 2048;
    } else if (paramsBillion > 30) {
      numLayers = 80;
      hiddenDim = 8192;
    }

    // KV Cache = 2 * layers * hidden_dim * precisionBytes * batchSize * seqLength (in bytes)
    const kvCacheBytes = 2 * numLayers * hiddenDim * precisionBytes * batchSize * seqLength;
    const kvCacheMemGB = kvCacheBytes / (1024 * 1024 * 1024);

    // 4. Total Memory
    const totalMemGB = weightMemGB + kvCacheMemGB;

    // 5. Throughput Estimation (tokens/sec)
    // Speed increases as precision bits drop, but decreases with parameter size and batch size
    const baseSpeed = 160; // tokens/sec for 1B model in FP16, batch 1
    const sizeScale = 1.0 / Math.pow(paramsBillion, 0.7);
    const precisionScale = 2.0 / precisionBytes;
    // Batching scales overall throughput (more tokens processed in parallel), but increases per-request latency slightly
    const batchScale = Math.sqrt(batchSize);
    const estimatedThroughput = baseSpeed * sizeScale * precisionScale * batchScale;

    return {
      weightMemGB,
      kvCacheMemGB,
      totalMemGB,
      estimatedThroughput
    };
  }, [paramsBillion, precision, seqLength, batchSize]);

  // VRAM Limit presets for comparison
  const vramLimit = 80.0; // scale visualizations to 80GB A100 limit

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div
          className="relative border border-outline bg-surface overflow-hidden rounded p-4 font-mono text-xs text-on-surface"
          role="img"
          aria-label="AI inference memory and throughput calculator"
        >
          <div className="mb-4 font-mono text-[12px] font-bold uppercase tracking-wider text-primary">
            GPU Memory (VRAM) Allocation Calculator
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>VRAM Usage:</span>
                <span className={results.totalMemGB > vramLimit ? "text-pink" : "text-cyan"}>
                  {results.totalMemGB.toFixed(2)} GB / {vramLimit} GB (A100)
                </span>
              </div>

              {/* VRAM Bar chart */}
              <div className="w-full bg-grid h-8 rounded overflow-hidden flex relative border border-outline">
                {/* Weights Segment */}
                <div
                  className="bg-cyan h-full transition-all duration-300 flex items-center justify-center text-[12px] text-white font-bold"
                  style={{ width: `${Math.min(100, (results.weightMemGB / vramLimit) * 100)}%` }}
                  title={`Weights: ${results.weightMemGB.toFixed(1)} GB`}
                >
                  {results.weightMemGB > 6 && `Weights (${results.weightMemGB.toFixed(1)}G)`}
                </div>
                
                {/* KV Cache Segment */}
                <div
                  className="bg-pink h-full transition-all duration-300 flex items-center justify-center text-[12px] text-white font-bold"
                  style={{ width: `${Math.min(100 - (results.weightMemGB / vramLimit) * 100, (results.kvCacheMemGB / vramLimit) * 100)}%` }}
                  title={`KV Cache: ${results.kvCacheMemGB.toFixed(1)} GB`}
                >
                  {results.kvCacheMemGB > 6 && `KV Cache (${results.kvCacheMemGB.toFixed(1)}G)`}
                </div>

                {results.totalMemGB > vramLimit && (
                  <div className="absolute right-2 top-0 bottom-0 flex items-center text-[12px] font-bold text-pink animate-pulse">
                    OUT OF MEMORY
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-outline pt-4">
              <div className="bg-surface-container p-3 rounded border border-outline">
                <div className="text-muted text-[12px] uppercase font-bold">Weights footprint</div>
                <div className="text-xl font-bold text-cyan">{results.weightMemGB.toFixed(2)} GB</div>
                <div className="text-[12px] text-on-surface-variant leading-snug mt-1">
                  Parameters × precision size. (e.g. {paramsBillion}B × {precision === "fp16" ? "2" : precision === "int8" ? "1" : "0.5"} bytes)
                </div>
              </div>

              <div className="bg-surface-container p-3 rounded border border-outline">
                <div className="text-muted text-[12px] uppercase font-bold">KV Cache Size</div>
                <div className="text-xl font-bold text-pink">{results.kvCacheMemGB.toFixed(2)} GB</div>
                <div className="text-[12px] text-on-surface-variant leading-snug mt-1">
                  Grows linearly with sequence length ({seqLength}) and batch size ({batchSize}).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {/* Sliders */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide text-primary text-[12px]">
            <span>Model Inputs</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="inf-params-slider">
              Parameters ({paramsBillion} Billion)
            </label>
            <input
              id="inf-params-slider"
              type="range"
              min={1}
              max={70}
              step={1}
              value={paramsBillion}
              onChange={e => setParamsBillion(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Model parameters size range slider in billions"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="inf-precision-select">
              Precision Format
            </label>
            <select
              id="inf-precision-select"
              value={precision}
              onChange={e => setPrecision(e.target.value as Precision)}
              className="w-full border border-outline bg-surface p-2 text-xs rounded"
              aria-label="Select quantization precision format"
            >
              <option value="fp16">16-bit float (FP16 / BF16)</option>
              <option value="int8">8-bit integer (INT8)</option>
              <option value="int4">4-bit integer (INT4 Quantized)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="inf-seq-slider">
              Sequence Length ({seqLength})
            </label>
            <input
              id="inf-seq-slider"
              type="range"
              min={512}
              max={8192}
              step={512}
              value={seqLength}
              onChange={e => setSeqLength(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Context sequence length range slider"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="inf-batch-slider">
              Batch Size ({batchSize})
            </label>
            <input
              id="inf-batch-slider"
              type="range"
              min={1}
              max={64}
              step={1}
              value={batchSize}
              onChange={e => setBatchSize(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Serving batch size range slider"
            />
          </div>
        </div>

        {/* Throughput Output */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Serving Throughput</div>
          <div className="text-2xl font-bold text-cyan">{results.estimatedThroughput.toFixed(0)}</div>
          <div className="text-[12px] text-muted font-bold">TOKENS / SECOND</div>
          <p className="mt-2 text-[12px] leading-snug font-sans text-on-surface-variant">
            *Throughput measures the total volume of generated text tokens processed per second across the GPU. Small batch sizes yield fast single-user speeds, while large batch sizes maximize overall system efficiency.
          </p>
        </div>
      </div>
    </div>
  );
}
