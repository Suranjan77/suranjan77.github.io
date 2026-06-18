"use client";

import React, { useMemo, useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 660;
const H = 360;

// log-odds axis geometry: left = HAM, right = SPAM, centre = 50/50.
const AX_LEFT = 120;
const AX_RIGHT = 628;
const CX = (AX_LEFT + AX_RIGHT) / 2;
const LO_MAX = 4;
const UNIT = (AX_RIGHT - CX) / LO_MAX;
const loToX = (lo: number) => CX + Math.max(-LO_MAX, Math.min(LO_MAX, lo)) * UNIT;

const priorSpam = 0.4;
const priorHam = 0.6;

// P(word | class). Spam-y words pull right, ham-y words pull left.
const WORDS = [
  { key: "free", label: '"free"', spam: 0.8, ham: 0.1 },
  { key: "money", label: '"money"', spam: 0.7, ham: 0.15 },
  { key: "meeting", label: '"meeting"', spam: 0.05, ham: 0.5 },
  { key: "hello", label: '"hello"', spam: 0.2, ham: 0.6 },
] as const;
type WordKey = (typeof WORDS)[number]["key"];

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export default function NaiveBayesViz() {
  // borderline-ham email by default; adding "money" tips it to spam.
  const [active, setActive] = useState<Record<WordKey, boolean>>({
    free: true,
    money: false,
    meeting: true,
    hello: false,
  });

  const { steps, finalLO, pSpam } = useMemo(() => {
    const priorLO = Math.log(priorSpam / priorHam);
    let cum = priorLO;
    const steps = [{ label: "prior", delta: priorLO, before: 0, after: priorLO }];
    for (const w of WORDS) {
      if (!active[w.key]) continue;
      const lr = Math.log(w.spam / w.ham);
      const before = cum;
      cum += lr;
      steps.push({ label: w.label, delta: lr, before, after: cum });
    }
    return { steps, finalLO: cum, pSpam: sigmoid(cum) };
  }, [active]);

  const isSpam = pSpam > 0.5;
  const verdictColor = isSpam ? COLORS.pink : COLORS.cyan;

  const top = 84;
  const rowH = 38;
  const axisBottom = top + steps.length * rowH + 28;

  const caption =
    `Each word in the email tugs the verdict — spam-ish words pull right, ham-ish words pull left — by how much more often it shows up in one class than the other. Stack the tugs and the running total lands at ${(pSpam * 100).toFixed(0)}% spam: ${isSpam ? "SPAM" : "HAM"}. ` +
    (active.money
      ? `Untick "money" and the email slips back across the 50/50 line.`
      : `Tick "money" and watch a single strong word tip this borderline email over the line into spam.`);

  // arrowhead helper
  const arrow = (x1: number, x2: number, y: number, color: string, key: string) => {
    const dir = x2 >= x1 ? 1 : -1;
    const head = 7;
    return (
      <g key={key}>
        <line x1={x1} y1={y} x2={x2 - dir * head} y2={y} stroke={color} strokeWidth={7} strokeLinecap="butt" />
        <polygon points={`${x2},${y} ${x2 - dir * head},${y - 5} ${x2 - dir * head},${y + 5}`} fill={color} />
      </g>
    );
  };

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Naive Bayes Spam Evidence Tug of War">
      <title>Naive Bayes Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* axis direction labels */}
      <text x={AX_LEFT} y={56} fill={COLORS.cyan} fontSize={12} fontWeight={800}>← more HAM</text>
      <text x={AX_RIGHT} y={56} textAnchor="end" fill={COLORS.pink} fontSize={12} fontWeight={800}>more SPAM →</text>

      {/* 50/50 decision line */}
      <line x1={CX} y1={64} x2={CX} y2={axisBottom} stroke={COLORS.border} strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={CX} y={76} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700}>50 / 50</text>

      {/* waterfall of evidence tugs */}
      {steps.map((s, i) => {
        const y = top + i * rowH + 24;
        const x1 = loToX(s.before);
        const x2 = loToX(s.after);
        const spammy = s.delta >= 0;
        const color = i === 0 ? COLORS.muted : spammy ? COLORS.pink : COLORS.cyan;
        return (
          <g key={s.label + i}>
            <text x={AX_LEFT - 12} y={y + 4} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>{s.label}</text>
            {/* faint guide back to the centre */}
            <line x1={x1} y1={y - rowH + 8} x2={x1} y2={y} stroke={COLORS.grid} strokeWidth={1} />
            {arrow(x1, x2, y, color, s.label)}
          </g>
        );
      })}

      {/* final landing marker */}
      <line x1={loToX(finalLO)} y1={top + 24 - rowH + 8} x2={loToX(finalLO)} y2={axisBottom} stroke={verdictColor} strokeWidth={1.5} strokeDasharray="3 3" />
      <circle cx={loToX(finalLO)} cy={axisBottom} r={9} fill={verdictColor} stroke={COLORS.bg} strokeWidth={2.5} />
      <text x={loToX(finalLO)} y={axisBottom + 26} textAnchor="middle" fill={verdictColor} fontSize={13} fontWeight={900}>{isSpam ? "SPAM" : "HAM"}</text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Words in the email</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {WORDS.map((w) => {
            const spammy = w.spam >= w.ham;
            return (
              <label key={w.key} className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-on-surface">
                <input
                  type="checkbox"
                  checked={active[w.key]}
                  onChange={(e) => setActive((a) => ({ ...a, [w.key]: e.target.checked }))}
                  aria-label={`Include the word ${w.key} in the email`}
                  className={`h-4 w-4 cursor-pointer ${spammy ? "accent-pink" : "accent-cyan"}`}
                />
                {w.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-bold uppercase text-on-surface-variant">Verdict</span>
          <span data-testid="nb-verdict" className="text-lg font-bold" style={{ color: verdictColor }}>{isSpam ? "SPAM" : "HAM"}</span>
        </div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">P(spam)</span><span className="font-bold" style={{ color: COLORS.pink }}>{(pSpam * 100).toFixed(1)}%</span></div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">P(ham)</span><span className="font-bold" style={{ color: COLORS.cyan }}>{((1 - pSpam) * 100).toFixed(1)}%</span></div>
        {/* posterior bar */}
        <div className="mt-1 flex h-3 overflow-hidden rounded border border-outline">
          <div style={{ width: `${pSpam * 100}%`, backgroundColor: COLORS.pink }} />
          <div style={{ width: `${(1 - pSpam) * 100}%`, backgroundColor: COLORS.cyan }} />
        </div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      Naive Bayes asks: <strong>which class makes this email most likely?</strong>{" "}
      It multiplies the prior by each word&apos;s likelihood — equivalently, it{" "}
      <strong>adds up log-likelihood ratios</strong>, so every word becomes a tug
      left or right and the totals decide. The &quot;naive&quot; part is assuming
      words are <strong>independent</strong> given the class; that&apos;s rarely
      true, which can make it over-confident — but it&apos;s so cheap and robust
      that it&apos;s still a go-to baseline for spam, sentiment, and document
      classification.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
