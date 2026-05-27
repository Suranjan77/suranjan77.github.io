"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  PulseRing,
  StepIndicator,
  NarrativeControls,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

export default function NeuralNetworkViz() {
  const [x1, setX1] = useState(0.8);
  const [x2, setX2] = useState(0.4);
  const [target, setTarget] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Input, 1: Hidden, 2: Loss, 3: Backprop
  const [backwardTrigger, setBackwardTrigger] = useState(0); // increment to trigger backprop pulses
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = ["1. Inputs", "2. Hidden Layer", "3. Loss", "4. Backpropagation"];

  // Weights and Biases (Stateful so they can animate thickness/color)
  const [weights, setWeights] = useState({
    w11: 0.6, w12: -0.4, w13: 0.8,
    w21: 0.5, w22: 0.9, w23: -0.3,
    w31: 0.2, w32: -0.1, w33: 0.3,
    wh1: 0.7, wh2: -0.5, wh3: 0.8,
  });

  // Math forward pass
  const h1_z = x1 * weights.w11 + x2 * weights.w21 + 1.0 * weights.w31;
  const h1_a = Math.max(0, h1_z); // ReLU
  const h2_z = x1 * weights.w12 + x2 * weights.w22 + 1.0 * weights.w32;
  const h2_a = Math.max(0, h2_z);
  const h3_z = x1 * weights.w13 + x2 * weights.w23 + 1.0 * weights.w33;
  const h3_a = Math.max(0, h3_z);

  const yhat = Math.tanh(h1_a * weights.wh1 + h2_a * weights.wh2 + h3_a * weights.wh3); // output activation
  const loss = 0.5 * Math.pow(target - yhat, 2);

  // Stepper controls
  const handleStepForward = () => {
    setCurrentStep((prev) => {
      const next = (prev + 1) % 4;
      if (next === 3) {
        // Trigger backprop pulses
        setBackwardTrigger((t) => t + 1);
        applyBackpropUpdate();
      }
      return next;
    });
  };

  const handleStepBackward = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : 3));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setWeights({
      w11: 0.6, w12: -0.4, w13: 0.8,
      w21: 0.5, w22: 0.9, w23: -0.3,
      w31: 0.2, w32: -0.1, w33: 0.3,
      wh1: 0.7, wh2: -0.5, wh3: 0.8,
    });
  };

  // Autoplay loop
  useEffect(() => {
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        handleStepForward();
      }, 2000);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  // Backprop calculation & weight adjustment
  const applyBackpropUpdate = () => {
    const lr = 0.15;
    // Derivative of loss w.r.t yhat: -(target - yhat)
    const dyhat = -(target - yhat);
    // Derivative of tanh: 1 - yhat^2
    const dtanh = 1 - yhat * yhat;
    const dOut = dyhat * dtanh;

    // Output weights update
    const dWh1 = dOut * h1_a;
    const dWh2 = dOut * h2_a;
    const dWh3 = dOut * h3_a;

    // Hidden layer gradients (ReLU derivative)
    const dH1 = dOut * weights.wh1 * (h1_z > 0 ? 1 : 0);
    const dH2 = dOut * weights.wh2 * (h2_z > 0 ? 1 : 0);
    const dH3 = dOut * weights.wh3 * (h3_z > 0 ? 1 : 0);

    // Input weights update
    const dW11 = dH1 * x1;
    const dW21 = dH1 * x2;
    const dW12 = dH2 * x1;
    const dW22 = dH2 * x2;
    const dW13 = dH3 * x1;
    const dW23 = dH3 * x2;
    
    // Bias weights update (input is 1.0)
    const dW31 = dH1 * 1.0;
    const dW32 = dH2 * 1.0;
    const dW33 = dH3 * 1.0;

    setWeights((prev) => ({
      w11: clampWeight(prev.w11 - lr * dW11),
      w12: clampWeight(prev.w12 - lr * dW12),
      w13: clampWeight(prev.w13 - lr * dW13),
      w21: clampWeight(prev.w21 - lr * dW21),
      w22: clampWeight(prev.w22 - lr * dW22),
      w23: clampWeight(prev.w23 - lr * dW23),
      w31: clampWeight(prev.w31 - lr * dW31),
      w32: clampWeight(prev.w32 - lr * dW32),
      w33: clampWeight(prev.w33 - lr * dW33),
      wh1: clampWeight(prev.wh1 - lr * dWh1),
      wh2: clampWeight(prev.wh2 - lr * dWh2),
      wh3: clampWeight(prev.wh3 - lr * dWh3),
    }));
  };

  const clampWeight = (w: number) => Math.max(-2, Math.min(2, w));

  const layerX = { input: 100, hidden: 280, output: 460 };
  const inputY = [110, 200, 290];
  const hiddenY = [110, 200, 290];

  // Helper to determine active visual state
  const isAtOrPast = (step: number) => currentStep >= step;

  // Weight edge stroke calculations
  const edgeWeightWidth = (w: number) => Math.max(1, Math.abs(w) * 4);
  const edgeWeightColor = (w: number) => (w >= 0 ? COLORS.cyan : COLORS.pink);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Backpropagation Neural Network">
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Neural Connection Edges */}
            {/* Input to Hidden Layer */}
            {inputY.map((iy, iIdx) =>
              hiddenY.map((hy, hIdx) => {
                const wKey = `w${iIdx + 1}${hIdx + 1}` as keyof typeof weights;
                const wVal = weights[wKey];
                const active = isAtOrPast(1);
                return (
                  <g key={`edge-in-${iIdx}-${hIdx}`}>
                    <line
                      x1={layerX.input}
                      y1={iy}
                      x2={layerX.hidden}
                      y2={hy}
                      stroke={edgeWeightColor(wVal)}
                      strokeWidth={edgeWeightWidth(wVal)}
                      strokeOpacity={active ? 0.75 : 0.15}
                      className="transition-all duration-500"
                    />
                    {/* Forward activation flow particles */}
                    {currentStep === 1 && isPlaying && (
                      <motion.circle
                        r={4}
                        fill={COLORS.yellow}
                        initial={{ cx: layerX.input, cy: iy }}
                        animate={{ cx: layerX.hidden, cy: hy }}
                        transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    {/* Backward gradient flow pulses */}
                    {currentStep === 3 && (
                      <motion.circle
                        key={`back-pulse-${iIdx}-${hIdx}-${backwardTrigger}`}
                        r={4.5}
                        fill={COLORS.pink}
                        initial={{ cx: layerX.hidden, cy: hy }}
                        animate={{ cx: layerX.input, cy: iy }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Hidden Layer to Output Layer */}
            {hiddenY.map((hy, hIdx) => {
              const wKey = `wh${hIdx + 1}` as keyof typeof weights;
              const wVal = weights[wKey];
              const active = isAtOrPast(2);
              return (
                <g key={`edge-out-${hIdx}`}>
                  <line
                    x1={layerX.hidden}
                    y1={hy}
                    x2={layerX.output}
                    y2={200}
                    stroke={edgeWeightColor(wVal)}
                    strokeWidth={edgeWeightWidth(wVal)}
                    strokeOpacity={active ? 0.75 : 0.15}
                    className="transition-all duration-500"
                  />
                  {/* Forward activation flow particles */}
                  {currentStep === 2 && isPlaying && (
                    <motion.circle
                      r={4}
                      fill={COLORS.yellow}
                      initial={{ cx: layerX.hidden, cy: hy }}
                      animate={{ cx: layerX.output, cy: 200 }}
                      transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {/* Backward gradient flow pulses */}
                  {currentStep === 3 && (
                    <motion.circle
                      key={`back-pulse-out-${hIdx}-${backwardTrigger}`}
                      r={4.5}
                      fill={COLORS.pink}
                      initial={{ cx: layerX.output, cy: 200 }}
                      animate={{ cx: layerX.hidden, cy: hy }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  )}
                </g>
              );
            })}

            {/* Input Nodes */}
            <g>
              {/* x1 */}
              <circle
                cx={layerX.input}
                cy={inputY[0]}
                r={16}
                fill={isAtOrPast(0) ? COLORS.cyan : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={layerX.input} y={inputY[0] + 4} textAnchor="middle" fill={isAtOrPast(0) ? "#FFF" : COLORS.muted} fontSize={10} fontWeight={800}>x1</text>
              <text x={layerX.input - 28} y={inputY[0] + 4} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>{x1.toFixed(2)}</text>

              {/* x2 */}
              <circle
                cx={layerX.input}
                cy={inputY[1]}
                r={16}
                fill={isAtOrPast(0) ? COLORS.cyan : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={layerX.input} y={inputY[1] + 4} textAnchor="middle" fill={isAtOrPast(0) ? "#FFF" : COLORS.muted} fontSize={10} fontWeight={800}>x2</text>
              <text x={layerX.input - 28} y={inputY[1] + 4} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>{x2.toFixed(2)}</text>

              {/* Bias */}
              <circle
                cx={layerX.input}
                cy={inputY[2]}
                r={16}
                fill={isAtOrPast(0) ? COLORS.cyan : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={layerX.input} y={inputY[2] + 4} textAnchor="middle" fill={isAtOrPast(0) ? "#FFF" : COLORS.muted} fontSize={9} fontWeight={800}>BIAS</text>
              <text x={layerX.input - 28} y={inputY[2] + 4} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>+1.00</text>
            </g>

            {/* Hidden Nodes */}
            <g>
              {/* h1 */}
              <circle
                cx={layerX.hidden}
                cy={hiddenY[0]}
                r={18}
                fill={isAtOrPast(1) ? COLORS.yellow : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={layerX.hidden} y={hiddenY[0] + 4} textAnchor="middle" fill={isAtOrPast(1) ? "#FFF" : COLORS.muted} fontSize={10} fontWeight={800}>h1</text>
              {isAtOrPast(1) && (
                <text x={layerX.hidden} y={hiddenY[0] + 32} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
                  a={h1_a.toFixed(2)}
                </text>
              )}

              {/* h2 */}
              <circle
                cx={layerX.hidden}
                cy={hiddenY[1]}
                r={18}
                fill={isAtOrPast(1) ? COLORS.yellow : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={layerX.hidden} y={hiddenY[1] + 4} textAnchor="middle" fill={isAtOrPast(1) ? "#FFF" : COLORS.muted} fontSize={10} fontWeight={800}>h2</text>
              {isAtOrPast(1) && (
                <text x={layerX.hidden} y={hiddenY[1] + 32} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
                  a={h2_a.toFixed(2)}
                </text>
              )}

              {/* h3 */}
              <circle
                cx={layerX.hidden}
                cy={hiddenY[2]}
                r={18}
                fill={isAtOrPast(1) ? COLORS.yellow : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={layerX.hidden} y={hiddenY[2] + 4} textAnchor="middle" fill={isAtOrPast(1) ? "#FFF" : COLORS.muted} fontSize={10} fontWeight={800}>h3</text>
              {isAtOrPast(1) && (
                <text x={layerX.hidden} y={hiddenY[2] + 32} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
                  a={h3_a.toFixed(2)}
                </text>
              )}
            </g>

            {/* Output Node (yhat) */}
            <g>
              <circle
                cx={layerX.output}
                cy={200}
                r={22}
                fill={isAtOrPast(2) ? COLORS.pink : COLORS.bg}
                stroke={COLORS.border}
                strokeWidth={2.5}
              />
              <text x={layerX.output} y={196} textAnchor="middle" fill={isAtOrPast(2) ? "#FFF" : COLORS.muted} fontSize={10} fontWeight={900}>ŷ (pred)</text>
              <text x={layerX.output} y={210} textAnchor="middle" fill={isAtOrPast(2) ? "#FFF" : COLORS.muted} fontSize={9} fontWeight={800}>{yhat.toFixed(2)}</text>
            </g>

            {/* Target Box & Loss (right side) */}
            {isAtOrPast(2) && (
              <g>
                <line x1={layerX.output + 22} y1={200} x2={520} y2={200} stroke={COLORS.pink} strokeWidth={2.5} strokeDasharray="3 3" />
                
                {/* Target box */}
                <rect x={520} y={160} width={76} height={80} fill="none" stroke={COLORS.border} strokeWidth={1} />
                <text x={558} y={180} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={800}>TARGET y</text>
                <text x={558} y={206} textAnchor="middle" fill={COLORS.pink} fontSize={20} fontWeight={900}>{target.toFixed(1)}</text>
                <text x={558} y={230} textAnchor="middle" fill={COLORS.muted} fontSize={8} fontWeight={700}>Loss: {loss.toFixed(4)}</text>

                {/* Backpropagation notification arrow */}
                {currentStep === 3 && (
                  <g>
                    <path d="M510,250 C460,300 320,300 200,260" fill="none" stroke={COLORS.pink} strokeWidth={2} strokeDasharray="4 4" />
                    <path d="M200,260 L212,254 L208,268 Z" fill={COLORS.pink} />
                    <text x={330} y={316} textAnchor="middle" fill={COLORS.pink} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={2} paintOrder="stroke">
                      Gradient updates weights in opposite direction
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* Titles on SVG */}
            <text x={layerX.input} y={56} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>INPUTS</text>
            <text x={layerX.hidden} y={56} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>HIDDEN (ReLU)</text>
            <text x={layerX.output} y={56} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>OUTPUT (tanh)</text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Configure Inputs</span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between bg-surface-container p-2 border border-outline">
              <span className="font-bold">x1 value:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setX1((prev) => Math.max(-1.0, prev - 0.2))}
                  className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-primary">{x1.toFixed(1)}</span>
                <button
                  onClick={() => setX1((prev) => Math.min(1.0, prev + 0.2))}
                  className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container p-2 border border-outline">
              <span className="font-bold">x2 value:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setX2((prev) => Math.max(-1.0, prev - 0.2))}
                  className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-primary">{x2.toFixed(1)}</span>
                <button
                  onClick={() => setX2((prev) => Math.min(1.0, prev + 0.2))}
                  className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container p-2 border border-outline">
              <span className="font-bold">Target y:</span>
              <button
                onClick={() => setTarget((prev) => (prev === 1.0 ? -1.0 : 1.0))}
                className="h-6 px-2.5 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
              >
                {target === 1.0 ? "CLASS +1.0" : "CLASS -1.0"}
              </button>
            </div>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="my-3 min-h-[46px] text-[10px] text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline font-sans">
            {currentStep === 0 && "Step 1: Raw inputs are set. Adjust values above to change signals."}
            {currentStep === 1 && "Step 2: Forward pass computes hidden node activations via w·x and ReLU."}
            {currentStep === 2 && "Step 3: Output layer calculates tanh activation. Target is evaluated to measure Loss."}
            {currentStep === 3 && "Step 4: Error propagates backwards, updating weights to reduce future loss."}
          </div>

          <NarrativeControls
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            currentStep={currentStep}
            totalSteps={4}
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Pythonic Code Snippet</span>
          <pre className="mt-2 text-[10px] bg-surface-container p-2.5 rounded border border-outline font-mono overflow-x-auto text-primary leading-tight">
{`# Backpropagation weight update step
loss = 0.5 * (target - yhat) ** 2
dyhat = -(target - yhat) * (1 - yhat**2)
dw_h = dyhat * h_activations
dh = dyhat * w_out * (h_inputs > 0)
dw_in = dh * x`}
          </pre>
        </div>
      </div>
    </div>
  );
}
