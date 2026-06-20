"use client";

import React, { useMemo } from "react";
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

const stepsData = [
  {
    title: "K-Means: Hard & Spherical",
    caption: "K-Means assumes clusters are circular. It draws a rigid boundary halfway between the centers, wrongly cutting off the tail of the highly variable group.",
    cyan: { x: 320, y: 250, rx: 80, ry: 80, rot: 0, opacity: 0 },
    pink: { x: 450, y: 150, rx: 80, ry: 80, rot: 0, opacity: 0 },
    showBoundary: true,
    model: "kmeans",
  },
  {
    title: "Expectation (E-step): Soft Assignments",
    caption: "GMM relaxes the hard boundary. Every data point computes a probability of belonging to each cluster (soft assignment), blending colors where they overlap.",
    cyan: { x: 320, y: 250, rx: 80, ry: 80, rot: 0, opacity: 1 },
    pink: { x: 450, y: 150, rx: 80, ry: 80, rot: 0, opacity: 1 },
    showBoundary: false,
    model: "gmm_spherical",
  },
  {
    title: "Maximization (M-step): Stretching to Fit",
    caption: "Unlike K-Means, GMM fits a covariance matrix. The upper cluster updates its shape, stretching into an ellipse to perfectly envelop the scattered data.",
    cyan: { x: 300, y: 250, rx: 70, ry: 70, rot: 0, opacity: 1 },
    pink: { x: 550, y: 150, rx: 180, ry: 40, rot: -30, opacity: 1 },
    showBoundary: false,
    model: "gmm_ellipse",
  },
  {
    title: "Convergence: The Full Envelope",
    caption: "The algorithm converges. GMM has successfully captured both the dense circular cluster and the highly variable stretched cluster without forcing a hard cut.",
    cyan: { x: 300, y: 250, rx: 65, ry: 65, rot: 0, opacity: 1 },
    pink: { x: 550, y: 150, rx: 200, ry: 35, rot: -30, opacity: 1 },
    showBoundary: false,
    model: "gmm_ellipse_converged",
  }
] as const;

function blendColors(c1: string, c2: string, ratio: number) {
  // c1: Cyan #556B4A (85, 107, 74) -> actually green visually
  // c2: Pink #8D5149 (141, 81, 73) -> actually red visually
  const r = Math.round(85 + (141 - 85) * ratio);
  const g = Math.round(107 + (81 - 107) * ratio);
  const b = Math.round(74 + (73 - 74) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function GMMEMViz() {
  const stepper = useNarrativeStepper(stepsData.length);
  const activeStep = stepsData[stepper.currentStep];

  const dataPoints = useMemo(() => {
    const rng = createSeededRNG(12345);
    const points: Array<{ x: number; y: number }> = [];
    
    // Compact cluster (Cyan)
    for (let i = 0; i < 40; i++) {
      const u1 = Math.max(0.0001, rng.next());
      const u2 = rng.next();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      
      points.push({
        x: 300 + z0 * 30,
        y: 250 + z1 * 30,
      });
    }
    
    // Stretched cluster (Pink)
    for (let i = 0; i < 60; i++) {
      const u1 = Math.max(0.0001, rng.next());
      const u2 = rng.next();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      
      const stretchX = z0 * 100;
      const stretchY = z1 * 15;
      const angle = -Math.PI / 6; // -30 degrees
      const rotX = stretchX * Math.cos(angle) - stretchY * Math.sin(angle);
      const rotY = stretchX * Math.sin(angle) + stretchY * Math.cos(angle);
      
      points.push({
        x: 550 + rotX,
        y: 150 + rotY,
      });
    }
    return points;
  }, []);

  const getPointColor = (x: number, y: number, state: typeof activeStep) => {
    if (state.model === "kmeans") {
      const distCyan = Math.hypot(x - state.cyan.x, y - state.cyan.y);
      const distPink = Math.hypot(x - state.pink.x, y - state.pink.y);
      return distPink < distCyan ? COLORS.pink : COLORS.cyan;
    }
    
    if (state.model === "gmm_spherical") {
      const dC = Math.hypot(x - state.cyan.x, y - state.cyan.y);
      const dP = Math.hypot(x - state.pink.x, y - state.pink.y);
      const wC = Math.exp(-dC / 50);
      const wP = Math.exp(-dP / 50);
      const pPink = wP / (wC + wP + 1e-10);
      return blendColors(COLORS.cyan, COLORS.pink, pPink);
    }
    
    // Elliptical model
    const varC = (state.cyan.rx * state.cyan.rx) / 4;
    const pC = Math.exp(-(Math.pow(x - state.cyan.x, 2) + Math.pow(y - state.cyan.y, 2)) / (2 * varC));
    
    const angle = (state.pink.rot * Math.PI) / 180;
    const dx = x - state.pink.x;
    const dy = y - state.pink.y;
    const locX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    const locY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
    
    const varPx = (state.pink.rx * state.pink.rx) / 4;
    const varPy = (state.pink.ry * state.pink.ry) / 4;
    const pP = Math.exp(-(Math.pow(locX, 2) / (2 * varPx) + Math.pow(locY, 2) / (2 * varPy)));
    
    const pPink = pP / (pC + pP + 1e-10);
    return blendColors(COLORS.cyan, COLORS.pink, pPink);
  };

  const canvas = (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto select-none" role="img" aria-label="GMM EM Fit Visualizer">
      <defs>
        <pattern id="gmm-grid-new" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.grid} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#gmm-grid-new)" />

      {/* Voronoi K-Means boundary line */}
      <motion.line
        x1={200}
        y1={-40.5}
        x2={600}
        y2={479.5}
        stroke={COLORS.border}
        strokeWidth={3}
        strokeDasharray="6 6"
        initial={{ opacity: 0 }}
        animate={{ opacity: activeStep.showBoundary ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Misclassification highlight (rendered only in K-Means step) */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: activeStep.model === "kmeans" ? 1 : 0 }}
      >
        <path d="M 580 230 Q 550 260 500 260" fill="none" stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 2" />
        <text x={590} y={225} fill={COLORS.muted} fontSize={14} fontWeight={600}>Tail is wrongly</text>
        <text x={590} y={245} fill={COLORS.muted} fontSize={14} fontWeight={600}>assigned to lower group</text>
      </motion.g>

      {/* Covariance Ellipses */}
      <motion.ellipse
        cx={0}
        cy={0}
        animate={{ 
          x: activeStep.cyan.x, 
          y: activeStep.cyan.y, 
          rx: activeStep.cyan.rx, 
          ry: activeStep.cyan.ry, 
          rotate: activeStep.cyan.rot,
          opacity: activeStep.cyan.opacity 
        }}
        transition={{ type: "spring", stiffness: 40, damping: 15 }}
        fill="rgba(85, 107, 74, 0.05)"
        stroke={COLORS.cyan}
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <motion.ellipse
        cx={0}
        cy={0}
        animate={{ 
          x: activeStep.pink.x, 
          y: activeStep.pink.y, 
          rx: activeStep.pink.rx, 
          ry: activeStep.pink.ry, 
          rotate: activeStep.pink.rot,
          opacity: activeStep.pink.opacity 
        }}
        transition={{ type: "spring", stiffness: 40, damping: 15 }}
        fill="rgba(141, 81, 73, 0.05)"
        stroke={COLORS.pink}
        strokeWidth={2}
        strokeDasharray="4 4"
      />

      {/* Data Points */}
      {dataPoints.map((pt, i) => (
        <motion.circle
          key={`pt-${i}`}
          cx={pt.x}
          cy={pt.y}
          r={5}
          animate={{ fill: getPointColor(pt.x, pt.y, activeStep) }}
          transition={{ duration: 0.5 }}
          stroke={COLORS.bg}
          strokeWidth={1.5}
        />
      ))}

      {/* Means */}
      <motion.g animate={{ x: activeStep.cyan.x, y: activeStep.cyan.y }} transition={{ type: "spring", stiffness: 50, damping: 15 }}>
        <circle cx={0} cy={0} r={6} fill={COLORS.cyan} stroke={COLORS.bg} strokeWidth={2} />
      </motion.g>
      <motion.g animate={{ x: activeStep.pink.x, y: activeStep.pink.y }} transition={{ type: "spring", stiffness: 50, damping: 15 }}>
        <circle cx={0} cy={0} r={6} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={2} />
      </motion.g>
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
        steps={["K-Means Limit", "Expectation", "Maximization", "Converged"]} 
        currentStep={stepper.currentStep} 
      />
    </div>
  );

  const mentalModel = (
    <div className="space-y-4">
      <p>
        <strong>K-Means is rigid.</strong> It assumes all clusters are perfectly circular (spherical) and assigns every point to exactly one cluster. When data is stretched out—like the upper right cluster here—a spherical assumption draws a hard line straight through the middle, chopping off the tail.
      </p>
      <p>
        <strong>Gaussian Mixture Models (GMM) stretch to fit.</strong> Instead of just finding a center, GMM calculates a <em>covariance matrix</em>, which allows its &quot;circles&quot; to stretch into ellipses. It also uses <em>soft assignments</em>: a point on the boundary isn&apos;t forced into one bucket, but is assigned a 40% chance of belonging to one and 60% to the other (shown by the blended colors).
      </p>
      <p>
        The <strong>Expectation-Maximization (EM)</strong> algorithm alternates between two steps: estimating the soft probabilities (E-step) and updating the ellipses to better fit those weighted points (M-step) until it converges on the true shape of the data.
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
