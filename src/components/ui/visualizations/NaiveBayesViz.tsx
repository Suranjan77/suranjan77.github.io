"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

const W = 640;
const H = 420;

export default function NaiveBayesViz() {
  const [hasFree, setHasFree] = useState<boolean>(true);
  const [hasMoney, setHasMoney] = useState<boolean>(true);
  const [hasMeeting, setHasMeeting] = useState<boolean>(false);
  const [hasHello, setHasHello] = useState<boolean>(false);

  // Model parameters (Priors and Likelihoods)
  const priorSpam = 0.4;
  const priorHam = 0.6;

  // P(word | Class)
  const wordLikelihoods = {
    free: { spam: 0.8, ham: 0.1 },
    money: { spam: 0.7, ham: 0.15 },
    meeting: { spam: 0.05, ham: 0.5 },
    hello: { spam: 0.2, ham: 0.6 }
  };

  // Compute probabilities
  const computation = useMemo(() => {
    let spamScore = Math.log(priorSpam);
    let hamScore = Math.log(priorHam);

    const steps = [
      {
        name: "Prior",
        spamP: priorSpam,
        hamP: priorHam,
        spamLog: Math.log(priorSpam),
        hamLog: Math.log(priorHam),
        desc: "Initial class probabilities."
      }
    ];

    const activeFeatures = [
      { name: "free", active: hasFree, values: wordLikelihoods.free },
      { name: "money", active: hasMoney, values: wordLikelihoods.money },
      { name: "meeting", active: hasMeeting, values: wordLikelihoods.meeting },
      { name: "hello", active: hasHello, values: wordLikelihoods.hello }
    ];

    activeFeatures.forEach(feature => {
      if (feature.active) {
        spamScore += Math.log(feature.values.spam);
        hamScore += Math.log(feature.values.ham);
        steps.push({
          name: `+ '${feature.name}'`,
          spamP: feature.values.spam,
          hamP: feature.values.ham,
          spamLog: Math.log(feature.values.spam),
          hamLog: Math.log(feature.values.ham),
          desc: `Likelihood: P('${feature.name}'|Spam)=${feature.values.spam}, P('${feature.name}'|Ham)=${feature.values.ham}`
        });
      }
    });

    // Convert back from log-space to probability
    const maxScore = Math.max(spamScore, hamScore);
    const expSpam = Math.exp(spamScore - maxScore);
    const expHam = Math.exp(hamScore - maxScore);
    const sumExp = expSpam + expHam;

    const finalSpamProb = expSpam / sumExp;
    const finalHamProb = expHam / sumExp;

    return {
      steps,
      spamLog: spamScore,
      hamLog: hamScore,
      finalSpamProb,
      finalHamProb
    };
  }, [hasFree, hasMoney, hasMeeting, hasHello]);

  const pad = { left: 60, right: 30, top: 40, bottom: 40 };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="Naive Bayes Evidence Accumulator"
          >
            <title>Naive Bayes Evidence Accumulator</title>
            <defs>
              <pattern id="nb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#nb-grid)" />

            {/* Steps chart showing cumulative log likelihood */}
            <g transform="translate(0, 10)">
              <text x={pad.left} y={24} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                EVIDENCE UPDATE PATH (LOG-PROBABILITIES)
              </text>
              <line x1={pad.left} y1={200} x2={W - pad.right} y2={200} stroke={COLORS.border} strokeWidth={1.5} />
              
              {computation.steps.map((step, idx) => {
                const x = pad.left + (idx / (computation.steps.length || 1)) * (W - pad.left - pad.right - 50) + 20;
                
                // Map log probability (typically [-5, 0]) to [300, 100] pixels
                const mapLogToY = (logVal: number) => {
                  const clamped = Math.max(-5, Math.min(0, logVal));
                  return 200 - (clamped / -5) * 120;
                };

                const spamY = mapLogToY(step.spamLog || Math.log(step.spamP));
                const hamY = mapLogToY(step.hamLog || Math.log(step.hamP));

                return (
                  <g key={`step-${idx}`}>
                    {idx > 0 && (
                      <>
                        {/* Connecting lines */}
                        {(() => {
                          const prevX = pad.left + ((idx - 1) / (computation.steps.length || 1)) * (W - pad.left - pad.right - 50) + 20;
                          const prevSpamY = mapLogToY(computation.steps[idx - 1].spamLog || Math.log(computation.steps[idx - 1].spamP));
                          const prevHamY = mapLogToY(computation.steps[idx - 1].hamLog || Math.log(computation.steps[idx - 1].hamP));
                          return (
                            <>
                              <line x1={prevX} y1={prevSpamY} x2={x} y2={spamY} stroke={COLORS.pink} strokeWidth={2} />
                              <line x1={prevX} y1={prevHamY} x2={x} y2={hamY} stroke={COLORS.cyan} strokeWidth={2} />
                            </>
                          );
                        })()}
                      </>
                    )}

                    <circle cx={x} cy={spamY} r={5} fill={COLORS.pink} stroke="#fff" strokeWidth={1.5} />
                    <circle cx={x} cy={hamY} r={5} fill={COLORS.cyan} stroke="#fff" strokeWidth={1.5} />
                    
                    <text x={x} y={220} textAnchor="middle" fontSize={10} fill={COLORS.muted} fontWeight={700}>
                      {step.name}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Poster Output Gauge */}
            <g transform="translate(0, 270)">
              <text x={pad.left} y={24} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                POSTERIOR PROBABILITY COMPARISON
              </text>

              {/* Spam Bar */}
              <rect x={pad.left} y={45} width={(W - pad.left - pad.right) * computation.finalSpamProb} height={24} fill={COLORS.pink} rx={2} />
              <text x={pad.left + 8} y={60} fill="#fff" fontSize={11} fontWeight={800}>
                SPAM: {(computation.finalSpamProb * 100).toFixed(1)}%
              </text>

              {/* Ham Bar */}
              <rect x={pad.left} y={75} width={(W - pad.left - pad.right) * computation.finalHamProb} height={24} fill={COLORS.cyan} rx={2} />
              <text x={pad.left + 8} y={90} fill="#fff" fontSize={11} fontWeight={800}>
                HAM: {(computation.finalHamProb * 100).toFixed(1)}%
              </text>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Toggle words in email</span>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            <div className="flex items-center gap-2">
              <input
                id="word-free"
                type="checkbox"
                checked={hasFree}
                onChange={e => setHasFree(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-pink"
                aria-label="Include the word 'free' in the document"
              />
              <label htmlFor="word-free" className="text-xs uppercase font-bold text-on-surface-variant cursor-pointer select-none">
                Contains &quot;free&quot;
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="word-money"
                type="checkbox"
                checked={hasMoney}
                onChange={e => setHasMoney(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-pink"
                aria-label="Include the word 'money' in the document"
              />
              <label htmlFor="word-money" className="text-xs uppercase font-bold text-on-surface-variant cursor-pointer select-none">
                Contains &quot;money&quot;
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="word-meeting"
                type="checkbox"
                checked={hasMeeting}
                onChange={e => setHasMeeting(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-cyan"
                aria-label="Include the word 'meeting' in the document"
              />
              <label htmlFor="word-meeting" className="text-xs uppercase font-bold text-on-surface-variant cursor-pointer select-none">
                Contains &quot;meeting&quot;
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="word-hello"
                type="checkbox"
                checked={hasHello}
                onChange={e => setHasHello(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-cyan"
                aria-label="Include the word 'hello' in the document"
              />
              <label htmlFor="word-hello" className="text-xs uppercase font-bold text-on-surface-variant cursor-pointer select-none">
                Contains &quot;hello&quot;
              </label>
            </div>
          </div>
        </div>

        {/* Prediction Output */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[11px]">CLASSIFICATION DECISION</div>
          <div className="text-center p-3 border border-outline bg-surface-container rounded font-bold text-lg">
            {computation.finalSpamProb > 0.5 ? (
              <span className="text-pink">SPAM</span>
            ) : (
              <span className="text-cyan">HAM</span>
            )}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant font-sans">
            Toggling words changes the active feature set. If a word is checked, its likelihood conditional probability is multiplied to the class score.
          </p>
        </div>
      </div>
    </div>
  );
}
