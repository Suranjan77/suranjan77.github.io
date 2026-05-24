"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
  drawHelper,
} from "../visualizationPrimitives";

const toXPixel = (x: number) => 40 + (x / 10) * 256;
const toYPixel = (y: number) => 190 - (y / 10) * 166;

// Discriminator features: [x, y, x^2, y^2, x*y, 1]
function getFeatures(x: number, y: number) {
  return [x, y, x * x, y * y, x * y, 1.0];
}

export default function GenerativeModelsVisualization() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);

  // 1. Generate Static Real Points (forming a ring centered at (5, 5) with radius 3)
  const realPoints = useMemo(() => {
    const pts = [];
    const numReal = 50;
    for (let i = 0; i < numReal; i++) {
      const angle = (i / numReal) * Math.PI * 2;
      const radius = 3.0 + Math.sin(i * 12.9898) * 0.18;
      pts.push({
        x: 5.0 + Math.cos(angle) * radius,
        y: 5.0 + Math.sin(angle) * radius,
      });
    }
    return pts;
  }, []);

  // 2. Dynamic Generator/Fake Points (initialized as a tight Gaussian blob around (1.5, 1.5))
  const createInitialFakePoints = () => {
    const pts = [];
    for (let i = 0; i < 45; i++) {
      pts.push({
        x: 1.5 + (Math.random() - 0.5) * 0.6,
        y: 1.5 + (Math.random() - 0.5) * 0.6,
      });
    }
    return pts;
  };

  const [fakePoints, setFakePoints] = useState<Array<{ x: number; y: number }>>(createInitialFakePoints);

  // 3. Discriminator Weights: w = [w_x, w_y, w_xx, w_yy, w_xy, b]
  // Initialized to small random values
  const [dWeights, setDWeights] = useState<number[]>([-0.1, -0.1, -0.05, -0.05, 0.0, 1.0]);

  const [lrD, setLrD] = useState<number>(0.05); // Discriminator learning rate
  const [lrG, setLrG] = useState<number>(0.08); // Generator learning rate

  // Discriminator prediction D(x, y) = sigmoid(w^T * phi(x,y))
  const getDValue = useCallback(
    (x: number, y: number, weights = dWeights) => {
      const phi = getFeatures(x, y);
      let score = 0;
      for (let i = 0; i < phi.length; i++) {
        score += weights[i] * phi[i];
      }
      return 1.0 / (1.0 + Math.exp(-Math.max(-15, Math.min(15, score))));
    },
    [dWeights]
  );

  // Perform one step of GAN training
  const trainGANStep = useCallback(() => {
    // ----------------------------------------------------
    // A. Train Discriminator (Gradient Descent on Weights)
    // ----------------------------------------------------
    const featuresReal = realPoints.map((p) => getFeatures(p.x, p.y));
    const featuresFake = fakePoints.map((p) => getFeatures(p.x, p.y));

    // Initialize weight gradients
    const gradsW = new Array(6).fill(0);

    // Gradients from real points: dL_D / dw = (D(x) - 1) * phi(x)
    featuresReal.forEach((phi, idx) => {
      const xVal = realPoints[idx].x;
      const yVal = realPoints[idx].y;
      const dVal = getDValue(xVal, yVal);
      for (let i = 0; i < 6; i++) {
        gradsW[i] += (dVal - 1.0) * phi[i];
      }
    });

    // Gradients from fake points: dL_D / dw = (D(fake) - 0) * phi(fake)
    featuresFake.forEach((phi, idx) => {
      const xVal = fakePoints[idx].x;
      const yVal = fakePoints[idx].y;
      const dVal = getDValue(xVal, yVal);
      for (let i = 0; i < 6; i++) {
        gradsW[i] += (dVal - 0.0) * phi[i];
      }
    });

    const updatedW = dWeights.map(
      (w, i) => w - lrD * (gradsW[i] / (realPoints.length + fakePoints.length))
    );
    setDWeights(updatedW);

    // ----------------------------------------------------
    // B. Train Generator (Update Fake Points Coordinates)
    // ----------------------------------------------------
    // We update each fake point along the gradient of D(x, y) with respect to (x, y)
    // x = x + lrG * dD/dx
    // dD/dx = D * (1 - D) * ds/dx
    // ds/dx = w_0 + 2*w_2*x + w_4*y
    setFakePoints((currFake) => {
      return currFake.map((p) => {
        const dVal = getDValue(p.x, p.y, updatedW);
        const factor = dVal * (1.0 - dVal);

        const dsDx = updatedW[0] + 2 * updatedW[2] * p.x + updatedW[4] * p.y;
        const dsDy = updatedW[1] + 2 * updatedW[3] * p.y + updatedW[4] * p.x;

        // Add a tiny random walk (entropy noise) to prevent mode collapse!
        const noiseX = (Math.random() - 0.5) * 0.15;
        const noiseY = (Math.random() - 0.5) * 0.15;

        // Move to maximize D value (real-ness score)
        const nextX = Math.max(0.2, Math.min(9.8, p.x + lrG * factor * dsDx + noiseX));
        const nextY = Math.max(0.2, Math.min(9.8, p.y + lrG * factor * dsDy + noiseY));

        return { x: nextX, y: nextY };
      });
    });

    setEpoch((e) => e + 1);
  }, [realPoints, fakePoints, dWeights, lrD, lrG, getDValue]);

  // Loop player
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      trainGANStep();
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, trainGANStep]);

  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Draw background Discriminator decision space
      // We evaluate D(x, y) on a grid to draw a smooth contour background
      const gridSteps = 30;
      const stepX = 10 / gridSteps;
      const stepY = 10 / gridSteps;

      for (let i = 0; i < gridSteps; i++) {
        for (let j = 0; j < gridSteps; j++) {
          const gx = i * stepX;
          const gy = j * stepY;
          const dVal = getDValue(gx, gy);

          // Fill cell area
          const px1 = toXPixel(gx);
          const py1 = toYPixel(gy + stepY); // Canvas y goes down
          const pw = 256 / gridSteps + 0.5;
          const ph = 166 / gridSteps + 0.5;

          ctx.save();
          // Mix soft primary/pink (fake) and secondary/green (real) based on D score
          ctx.fillStyle = `rgba(${Math.floor(141 * (1 - dVal) + 85 * dVal)}, ${Math.floor(
            81 * (1 - dVal) + 107 * dVal
          )}, ${Math.floor(73 * (1 - dVal) + 74 * dVal)}, 0.09)`;
          ctx.fillRect(px1, py1, pw, ph);
          ctx.restore();
        }
      }

      drawHelper.axes(ctx, 320, 220);

      // Draw real data points (Cyan reticles)
      realPoints.forEach((p) => {
        drawHelper.point(ctx, toXPixel(p.x), toYPixel(p.y), COLORS.cyan, "circle", 3.2);
      });

      // Draw generated fake points (Pink reticles)
      fakePoints.forEach((p) => {
        drawHelper.point(ctx, toXPixel(p.x), toYPixel(p.y), COLORS.pink, "circle", 3.8);
      });

      // Discriminator decision boundary line: D(x, y) = 0.5 contour line
      // For visual feedback, we can draw a dotted line around where D(x,y) ~= 0.5
      // Evaluated roughly by checking grid values
      ctx.save();
      ctx.strokeStyle = "rgba(111, 102, 88, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      // Draw contour matching D = 0.5
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        // Search radially for D(x,y) = 0.5
        let rVal = 0;
        let found = false;
        for (let r = 0.1; r < 7; r += 0.1) {
          const checkX = 5.0 + Math.cos(angle) * r;
          const checkY = 5.0 + Math.sin(angle) * r;
          const dScore = getDValue(checkX, checkY);
          if (dScore > 0.5) {
            rVal = r;
            found = true;
            break;
          }
        }
        if (found) {
          const cx = toXPixel(5.0 + Math.cos(angle) * rVal);
          const cy = toYPixel(5.0 + Math.sin(angle) * rVal);
          if (angle === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    [realPoints, fakePoints, getDValue]
  );

  const handleReset = () => {
    setFakePoints(createInitialFakePoints);
    setDWeights([-0.1, -0.1, -0.05, -0.05, 0.0, 1.0]);
    setEpoch(0);
    setIsPlaying(false);
  };

  return (
    <VisualizationShell
      title="Generative Adversarial Training (GAN)"
      subtitle="Click Auto Train to start the minimax game loop. Watch fake points (pink) warp to mimic the real ring coordinates (cyan)."
      insight="The discriminator contour shading maps probabilities: green represents high discriminator certainty of real data, and pink represents fake predictions. The generator follows boundary gradients to match targets."
      legend={[
        { label: "Real Distribution", color: COLORS.cyan },
        { label: "Generator Output (Fake)", color: COLORS.pink },
        { label: "D = 0.5 Boundary", color: "rgba(111, 102, 88, 0.5)" },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />

          <div className="absolute left-4 top-4 border border-outline bg-surface/90 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs flex flex-col gap-0.5 sm:left-14 sm:top-8 sm:text-[10px]">
            <div>
              Training Epoch: <span className="font-bold text-pink">{epoch}</span>
            </div>
            <div>
              Status:{" "}
              <span className="font-bold text-cyan">
                {epoch > 150 ? "Approaching Equilibrium" : isPlaying ? "Optimizing..." : "Paused"}
              </span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full border px-3 py-2.5 rounded text-xs font-bold uppercase transition-all cursor-pointer sm:py-2 sm:text-[9px] ${
              isPlaying
                ? "bg-pink text-on-primary border-pink hover:bg-pink/90"
                : "bg-primary text-on-primary border-primary hover:bg-primary/90"
            }`}
          >
            {isPlaying ? "Pause Training" : "Auto Train GAN"}
          </button>

          <button
            onClick={trainGANStep}
            disabled={isPlaying}
            className="w-full border border-outline rounded bg-surface text-on-surface px-3 py-2.5 font-mono text-xs font-bold uppercase hover:bg-primary/10 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer text-center sm:py-2 sm:text-[10px]"
          >
            Single Optimization Step
          </button>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-xs text-on-surface sm:text-[11px]">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Discriminator Learning Rate</span>
              <span className="text-pink font-bold">{lrD.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={lrD}
              onChange={(e) => setLrD(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-xs text-on-surface sm:text-[11px]">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Generator Gradient Step</span>
              <span className="text-pink font-bold">{lrG.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={lrG}
              onChange={(e) => setLrG(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface px-3 py-2.5 font-mono text-xs font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center sm:py-2 sm:text-[10px]"
          >
            Reset Space
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
