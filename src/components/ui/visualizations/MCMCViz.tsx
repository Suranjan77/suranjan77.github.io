"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  COLORS,
  VizShell,
  NarrativeControls,
  StepIndicator,
} from "../visualizationPrimitives";
import { useNarrativeStepper } from "./useAnimationEngine";
import { createSeededRNG } from "@/lib/prng";

const W = 800;
const H = 400;
const plot = { left: 40, top: 40, right: 760, bottom: 220, width: 720, height: 160 };
const scaleX = (val: number) => plot.left + (val / 10) * plot.width;
// Target density max is around 0.5. We map 0 -> plot.bottom, 0.6 -> plot.top
const scaleY = (val: number) => plot.bottom - (val / 0.6) * plot.height;

const histBottom = 380;
const histHeight = 100;

// Bimodal target density distribution
const targetDensity = (xVal: number) => {
  const term1 = 0.45 * Math.exp(-0.5 * Math.pow((xVal - 3.2) / 0.95, 2));
  const term2 = 0.55 * Math.exp(-0.5 * Math.pow((xVal - 6.8) / 1.25, 2));
  return term1 + term2;
};

const densityPoints: string[] = [];
for (let i = 0; i <= 10; i += 0.05) {
  densityPoints.push(`${scaleX(i)} ${scaleY(targetDensity(i))}`);
}
const densityCurvePath = "M " + densityPoints.join(" L ");

const stepsData = [
  {
    title: "The Unknown Mountain",
    caption: "We want to map this two-peaked probability mountain. We can't compute its full shape at once, so we drop a random walker on it to explore.",
    mode: "start",
  },
  {
    title: "The Greedy Trap",
    caption: "If the walker greedily accepts ONLY uphill steps, it climbs the nearest peak and gets permanently trapped. It never discovers the larger peak.",
    mode: "greedy_trap",
  },
  {
    title: "The Downhill Rule",
    caption: "To escape the trap, MCMC allows the walker to occasionally accept DOWNHILL steps. If a step is lower, it accepts it with a probability based on the height drop.",
    mode: "propose_downhill",
  },
  {
    title: "Crossing the Valley",
    caption: "By occasionally accepting downhill steps, the walker successfully descends into the valley and climbs the other side to discover the global maximum.",
    mode: "cross_valley",
  },
  {
    title: "The Long Run",
    caption: "Turn the walker loose. Because it favors uphill but tolerates downhill, it freely explores everywhere. Over time, its visits perfectly sketch both peaks.",
    mode: "auto_run",
  }
] as const;

export default function MCMCViz() {
  const stepper = useNarrativeStepper(stepsData.length);
  const activeStep = stepsData[stepper.currentStep];

  const [autoRunState, setAutoRunState] = useState({ x: 2.5, samples: [] as number[] });

  useEffect(() => {
    if (activeStep.mode !== "auto_run") {
      setAutoRunState({ x: 2.5, samples: [] });
      return;
    }

    const rng = createSeededRNG(12345);
    let x = 6.8; // Start at the global peak where cross_valley left off
    const samples: number[] = [];

    const interval = setInterval(() => {
      // Multiple steps per tick to build the histogram quickly
      for (let i = 0; i < 20; i++) {
        const noise = rng.nextGaussian() * 1.5;
        const rawProp = x + noise;
        const prop = Math.max(0.5, Math.min(9.5, rawProp));
        const ratio = targetDensity(prop) / targetDensity(x);
        if (rng.next() < ratio) {
          x = prop;
        }
        samples.push(x);
      }
      setAutoRunState({ x, samples: [...samples] });
    }, 40);

    return () => clearInterval(interval);
  }, [activeStep.mode]);

  // Derived state for rendering
  let renderX = 1.5;
  let renderPropX: number | null = null;
  let renderPropStatus = null as "pending" | "accepted" | "rejected" | null;
  let renderSamples: number[] = [];

  if (activeStep.mode === "start") {
    renderX = 1.5;
  } else if (activeStep.mode === "greedy_trap") {
    renderX = 3.2; // Top of the first peak
    renderSamples = Array(100).fill(3.2); // A massive spike to show it's stuck
  } else if (activeStep.mode === "propose_downhill") {
    renderX = 3.2;
    renderPropX = 4.0; // Proposal in the valley
    renderPropStatus = "accepted"; // Visually accept the downhill
    renderSamples = [3.2, 4.0];
  } else if (activeStep.mode === "cross_valley") {
    renderX = 6.8; // Top of the second peak
    renderSamples = [3.2, 4.0, 4.8, 5.5, 6.2, 6.8]; // Trail showing the crossing
  } else if (activeStep.mode === "auto_run") {
    renderX = autoRunState.x;
    renderSamples = autoRunState.samples;
  }

  const walkerY = scaleY(targetDensity(renderX));

  // Histogram calculation
  const binCount = 40;
  const bins = Array(binCount).fill(0);
  renderSamples.forEach((s) => {
    const binIdx = Math.max(0, Math.min(binCount - 1, Math.floor(s * (binCount / 10))));
    bins[binIdx]++;
  });
  const maxBinCount = Math.max(1, ...bins);

  const canvas = (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto select-none" role="img" aria-label="MCMC Metropolis-Hastings Walker">
      <defs>
        <pattern id="mcmc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.grid} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#mcmc-grid)" />

      {/* Mountain Curve */}
      <path 
        d={`${densityCurvePath} L ${scaleX(10)} ${plot.bottom} L ${scaleX(0)} ${plot.bottom} Z`} 
        fill={COLORS.pink} fillOpacity={0.15} 
        stroke={COLORS.pink} strokeWidth={3} 
      />
      
      {/* Mountain Base Line */}
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <text x={plot.left} y={plot.bottom + 16} fill={COLORS.muted} fontSize={12} fontWeight={600}>Probability Density (The Mountain)</text>

      {/* Histogram */}
      <g>
        <line x1={plot.left} x2={plot.right} y1={histBottom} y2={histBottom} stroke={COLORS.border} strokeWidth={2} />
        <text x={plot.left} y={histBottom - histHeight - 10} fill={COLORS.muted} fontSize={12} fontWeight={600}>Empirical Samples (The Histogram)</text>
        {bins.map((count, idx) => {
          if (count === 0) return null;
          const binW = plot.width / binCount;
          const bx = plot.left + idx * binW;
          const bh = (count / maxBinCount) * histHeight;
          return (
            <rect
              key={idx}
              x={bx + 1}
              y={histBottom - bh}
              width={binW - 2}
              height={bh}
              fill={COLORS.cyan}
            />
          );
        })}
      </g>

      {/* Proposal Graphics */}
      {renderPropX !== null && (
        <g>
          {/* Dashed line from walker to proposal */}
          <line 
            x1={scaleX(renderX)} y1={walkerY}
            x2={scaleX(renderPropX)} y2={scaleY(targetDensity(renderPropX))}
            stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="4 4"
          />
          {/* Proposal Dot */}
          <circle 
            cx={scaleX(renderPropX)} cy={scaleY(targetDensity(renderPropX))}
            r={8}
            fill={renderPropStatus === "accepted" ? COLORS.cyan : renderPropStatus === "rejected" ? COLORS.pink : COLORS.bg}
            stroke={renderPropStatus === "pending" ? COLORS.muted : COLORS.bg} 
            strokeWidth={2}
          />
          {/* Proposal Text */}
          <text 
            x={scaleX(renderPropX)} y={scaleY(targetDensity(renderPropX)) - 15}
            textAnchor="middle" fill={COLORS.muted} fontSize={14} fontWeight={600}
          >
            {renderPropStatus === "accepted" ? "ACCEPT" : renderPropStatus === "rejected" ? "REJECT" : "PROPOSAL"}
          </text>
        </g>
      )}

      {/* Walker Dot */}
      <motion.circle 
        cx={scaleX(renderX)} cy={walkerY} r={10}
        fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2}
        animate={{ cx: scaleX(renderX), cy: scaleY(targetDensity(renderX)) }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      />
      <motion.text
        x={scaleX(renderX)} y={walkerY + 22}
        textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={700}
        animate={{ x: scaleX(renderX), y: scaleY(targetDensity(renderX)) + 22 }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      >
        WALKER
      </motion.text>
    </svg>
  );

  const controls = (
    <div className="flex w-full flex-col gap-3">
      <NarrativeControls
        isPlaying={stepper.isPlaying}
        onPlayToggle={stepper.isPlaying ? stepper.pause : stepper.play}
        onStepForward={stepper.stepForward}
        onStepBackward={stepper.stepBackward}
        onReset={stepper.reset}
        currentStep={stepper.currentStep}
        totalSteps={stepsData.length}
      />
      <StepIndicator 
        steps={["Start", "Greedy Trap", "Downhill Rule", "Cross Valley", "Long Run"]} 
        currentStep={stepper.currentStep} 
      />
    </div>
  );

  const mentalModel = (
    <div className="space-y-4">
      <p>
        <strong>The Greedy Trap:</strong> A naive sampling approach (like gradient ascent) only moves to more probable states. While this climbs the nearest peak quickly, it gets permanently trapped there. It completely misses other important regions of the distribution.
      </p>
      <p>
        <strong>MCMC Explores by Walking:</strong> MCMC avoids this using a random walker. Crucially, the <strong>Metropolis-Hastings Rule</strong> allows the walker to occasionally accept <em>downhill</em> (less probable) steps, with a probability equal to the height drop. 
      </p>
      <p>
        <strong>Global Discovery:</strong> This occasional downhill movement allows the walker to cross probability valleys and discover other peaks. Over a long run, the time spent in any region becomes perfectly proportional to its true probability, accurately mapping the entire complex mountain.
      </p>
    </div>
  );

  return (
    <VizShell
      canvas={canvas}
      controls={controls}
      caption={activeStep.caption}
      mentalModel={mentalModel}
    />
  );
}
