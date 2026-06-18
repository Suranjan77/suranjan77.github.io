"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";
import { createSeededRNG } from "@/lib/prng";

const W = 720;
const H = 380;
const TEST_N = 100; // examples in the test set
const TRUE_ACC = 0.87; // the model's real accuracy
const MODEL_B = 0.82; // a rival model's reported accuracy

// distribution panel maps accuracy [0.70, 1.00] -> pixels
const distL = 380;
const distR = 690;
const distScaleX = (acc: number) => distL + ((acc - 0.7) / 0.3) * (distR - distL);

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / (a.length || 1);

export default function StatisticsViz() {
  const [seed, setSeed] = useState(7);
  const [testSet, setTestSet] = useState<boolean[]>([]);
  const [results, setResults] = useState<number[]>([]); // bootstrap accuracies
  const [latest, setLatest] = useState<number | null>(null);

  // One test set: each example correct with probability TRUE_ACC.
  useEffect(() => {
    const rng = createSeededRNG(seed);
    setTestSet(Array.from({ length: TEST_N }, () => rng.next() < TRUE_ACC));
    setResults([]);
    setLatest(null);
  }, [seed]);

  const accuracy = useMemo(
    () => (testSet.length ? testSet.filter(Boolean).length / TEST_N : 0),
    [testSet],
  );

  const resampleOnce = (rng: { nextInt: (a: number, b: number) => number }) => {
    let correct = 0;
    for (let i = 0; i < TEST_N; i++) {
      if (testSet[rng.nextInt(0, TEST_N - 1)]) correct++;
    }
    return correct / TEST_N;
  };

  const drawOne = () => {
    if (!testSet.length) return;
    const rng = createSeededRNG(Math.random() * 1e6);
    const acc = resampleOnce(rng);
    setLatest(acc);
    setResults((prev) => [...prev, acc]);
  };

  const runMany = () => {
    if (!testSet.length) return;
    const rng = createSeededRNG(seed + 313);
    const out: number[] = [];
    for (let b = 0; b < 500; b++) out.push(resampleOnce(rng));
    setResults((prev) => [...prev, ...out]);
    setLatest(out[out.length - 1]);
  };

  const ci = useMemo(() => {
    if (results.length < 20) return null;
    const s = [...results].sort((a, b) => a - b);
    return {
      lo: s[Math.floor(s.length * 0.025)],
      hi: s[Math.min(s.length - 1, Math.floor(s.length * 0.975))],
    };
  }, [results]);

  const bIsInside = ci ? MODEL_B >= ci.lo && MODEL_B <= ci.hi : true;

  // histogram
  const NB = 30;
  const bins = useMemo(() => {
    const c = new Array(NB).fill(0);
    results.forEach((v) => {
      const idx = Math.max(0, Math.min(NB - 1, Math.floor(((v - 0.7) / 0.3) * NB)));
      c[idx]++;
    });
    return c;
  }, [results]);
  const maxBin = Math.max(1, ...bins);

  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;

  const caption =
    results.length === 0
      ? `Your model scored ${pct(accuracy)} on this test set. But that is just one test set — would it hold up on different data? You can't collect more, so resample this one (with replacement) and re-score.`
      : !ci
        ? `Each resample re-scores the model on a shuffled-with-replacement copy of the test set${latest !== null ? ` (latest ${pct(latest)})` : ""}. Keep going to trace out the spread.`
        : bIsInside
          ? `That ${pct(accuracy)} is really ${pct(ci.lo)}–${pct(ci.hi)} (95% CI). Rival model B's ${pct(MODEL_B)} sits inside that band — so this test set cannot prove your model is actually better. The gap is within the noise.`
          : `That ${pct(accuracy)} is really ${pct(ci.lo)}–${pct(ci.hi)} (95% CI), and model B's ${pct(MODEL_B)} falls outside it — here you can claim a real difference.`;

  const gridX = 60;
  const gridY = 74;
  const cell = 20;

  const canvas = (
    <svg className="block h-auto w-full select-none" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bootstrap Confidence on Model Accuracy">
      <title>Bootstrap Confidence on Model Accuracy</title>
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Test set grid */}
      <text x={gridX} y={gridY - 30} fill={COLORS.muted} fontSize={12} fontWeight={800}>MODEL ON TEST SET (100 examples)</text>
      <text x={gridX} y={gridY - 10} fill={COLORS.cyan} fontSize={16} fontWeight={800}>
        Accuracy: {pct(accuracy)}
      </text>
      {testSet.map((correct, i) => {
        const r = Math.floor(i / 10);
        const c = i % 10;
        return (
          <rect
            key={i}
            x={gridX + c * cell}
            y={gridY + r * cell}
            width={cell - 2}
            height={cell - 2}
            fill={correct ? COLORS.cyan : COLORS.pink}
            fillOpacity={correct ? 0.75 : 0.85}
          />
        );
      })}
      <text x={gridX} y={gridY + 10 * cell + 16} fill={COLORS.muted} fontSize={10}>
        ✓ correct = teal · ✗ wrong = red
      </text>

      {/* Bootstrap distribution */}
      <text x={distL} y={gridY - 30} fill={COLORS.muted} fontSize={12} fontWeight={800}>HOW MUCH THAT SCORE COULD WOBBLE</text>
      <text x={distL} y={gridY - 10} fill={COLORS.muted} fontSize={11}>{results.length} resamples</text>

      {/* axis */}
      <line x1={distL} y1={290} x2={distR} y2={290} stroke={COLORS.border} strokeWidth={2} />
      {[0.7, 0.8, 0.9, 1.0].map((t) => (
        <text key={t} x={distScaleX(t)} y={306} textAnchor="middle" fontSize={10} fill={COLORS.muted}>{pct(t)}</text>
      ))}

      {/* CI band */}
      {ci && (
        <rect x={distScaleX(ci.lo)} y={120} width={Math.max(1, distScaleX(ci.hi) - distScaleX(ci.lo))} height={170} fill={COLORS.yellow} opacity={0.16} />
      )}

      {/* histogram */}
      {bins.map((c, i) => {
        const x = distScaleX(0.7 + (i / NB) * 0.3);
        const w = (distR - distL) / NB;
        const h = (c / maxBin) * 150;
        return <rect key={i} x={x} y={290 - h} width={Math.max(1, w - 1)} height={h} fill={COLORS.yellow} opacity={0.85} />;
      })}

      {/* this model's accuracy line */}
      <line x1={distScaleX(accuracy)} y1={110} x2={distScaleX(accuracy)} y2={290} stroke={COLORS.cyan} strokeWidth={2} />
      <text x={distScaleX(accuracy)} y={104} textAnchor="middle" fontSize={10} fontWeight={800} fill={COLORS.cyan}>your model</text>

      {/* rival model B reference */}
      <line x1={distScaleX(MODEL_B)} y1={110} x2={distScaleX(MODEL_B)} y2={290} stroke={COLORS.pink} strokeWidth={2} strokeDasharray="4 3" />
      <text x={distScaleX(MODEL_B)} y={104} textAnchor="middle" fontSize={10} fontWeight={800} fill={COLORS.pink}>model B {pct(MODEL_B)}</text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-wrap items-center gap-2 border border-outline bg-surface p-3">
        <button onClick={drawOne} aria-label="Resample the test set once" className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface hover:bg-surface-container hover:text-primary">
          Resample once
        </button>
        <button onClick={runMany} aria-label="Run 500 resamples" className="flex h-9 items-center justify-center border border-outline bg-cyan px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-white hover:bg-cyan/90">
          Run 500
        </button>
        <button onClick={() => setSeed((s) => s + 1)} aria-label="Draw a new test set" className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant hover:bg-surface-container">
          New test set
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="text-[12px] font-bold uppercase text-primary">Confidence readout</div>
        <div className="flex justify-between gap-4"><span>Test accuracy:</span><span className="text-cyan font-bold">{pct(accuracy)}</span></div>
        <div className="flex justify-between gap-4"><span>95% CI:</span><span className="text-yellow font-bold">{ci ? `${pct(ci.lo)} – ${pct(ci.hi)}` : "— run resamples —"}</span></div>
        <div className="flex justify-between gap-4"><span>Beats model B ({pct(MODEL_B)})?</span><span className="font-bold" style={{ color: ci ? (bIsInside ? COLORS.pink : COLORS.cyan) : COLORS.muted }}>{ci ? (bIsInside ? "can't tell — noise" : "yes, real gap") : "—"}</span></div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      A single test-set score is itself a noisy sample — run the model on
      different data and it would land somewhere else. The{" "}
      <strong>bootstrap</strong> estimates that wobble without new data: resample
      the test set <em>with replacement</em> many times, re-score each copy, and
      the spread of scores is a <strong>confidence interval</strong> on the
      metric. It is how you put honest error bars on a benchmark number and judge
      whether one model truly beats another or just got luckier on this test set.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
