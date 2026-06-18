"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 660;
const H = 420;

// LEFT: applicant feature map (income x, credit score y)
const map = { left: 48, top: 48, right: 300, bottom: 330 };
const mapW = map.right - map.left;
const mapH = map.bottom - map.top;
const scaleX = (v: number) => map.left + (v / 10) * mapW;
const scaleY = (v: number) => map.bottom - (v / 10) * mapH;
const invertX = (px: number) => ((px - map.left) / mapW) * 10;
const invertY = (py: number) => ((map.bottom - py) / mapH) * 10;

// display units
const income = (x: number) => Math.round(20 + x * 8); // £k
const credit = (y: number) => Math.round(300 + y * 55);

// split thresholds (internal units)
const INCOME_SPLIT = 5; // £60k
const CREDIT_SPLIT = 4.5; // ~550

// tree node anchor points (right half)
const nodes = {
  root: { x: 478, y: 80 },
  right: { x: 560, y: 180 }, // high-income approve leaf
  left: { x: 420, y: 180 }, // low-income node / shallow leaf
  leafLL: { x: 372, y: 282 }, // low income + low credit -> deny
  leafLR: { x: 472, y: 282 }, // low income + good credit -> approve
};

// past applicants: repaid ("good") vs defaulted ("bad")
type App = { id: number; x: number; y: number; repaid: boolean };
const APPS: App[] = [
  // high income — repaid
  { id: 0, x: 6.5, y: 5.7, repaid: true },
  { id: 1, x: 8.2, y: 3.1, repaid: true },
  { id: 2, x: 7.5, y: 7.5, repaid: true },
  { id: 3, x: 8.9, y: 6.2, repaid: true },
  // low income, low credit — defaulted
  { id: 4, x: 1.5, y: 2.5, repaid: false },
  { id: 5, x: 3.0, y: 3.5, repaid: false },
  { id: 6, x: 3.5, y: 1.8, repaid: false },
  // low income, GOOD credit — repaid (the shallow tree wrongly rejects these)
  { id: 7, x: 2.2, y: 6.8, repaid: true },
  { id: 8, x: 4.1, y: 8.1, repaid: true },
];

// approve = predicted to repay
const classify = (x: number, y: number, grown: boolean): boolean => {
  if (x >= INCOME_SPLIT) return true; // high income -> approve
  if (!grown) return false; // shallow: reject every low-income applicant
  return y >= CREDIT_SPLIT; // good credit rescues the low-income applicant
};

const APPROVE = COLORS.cyan;
const DENY = COLORS.pink;

export default function DecisionTreeViz() {
  const [grown, setGrown] = useState(false);
  const [query, setQuery] = useState<{ x: number; y: number } | null>(null);
  const [animPos, setAnimPos] = useState<{ x: number; y: number } | null>(null);
  const [flash, setFlash] = useState<"R" | "L" | "LL" | "LR" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const correct = APPS.filter((a) => classify(a.x, a.y, grown) === a.repaid).length;

  const dropApplicant = (qx: number, qy: number) => {
    clearTimers();
    setQuery({ x: qx, y: qy });
    setFlash(null);
    setAnimPos({ x: nodes.root.x, y: nodes.root.y });

    const goRight = qx >= INCOME_SPLIT;
    timers.current.push(
      setTimeout(() => {
        if (goRight) {
          setAnimPos(nodes.right);
          timers.current.push(setTimeout(() => setFlash("R"), 450));
        } else if (!grown) {
          setAnimPos(nodes.left);
          timers.current.push(setTimeout(() => setFlash("L"), 450));
        } else {
          setAnimPos(nodes.left);
          timers.current.push(
            setTimeout(() => {
              const lowCredit = qy < CREDIT_SPLIT;
              setAnimPos(lowCredit ? nodes.leafLL : nodes.leafLR);
              timers.current.push(setTimeout(() => setFlash(lowCredit ? "LL" : "LR"), 450));
            }, 600),
          );
        }
      }, 600),
    );
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const c = pt.matrixTransform(ctm.inverse());
    if (c.x < map.left - 6 || c.x > map.right + 6 || c.y < map.top - 6 || c.y > map.bottom + 6) return;
    dropApplicant(
      Math.max(0.2, Math.min(9.8, invertX(c.x))),
      Math.max(0.2, Math.min(9.8, invertY(c.y))),
    );
  };

  const verdict = query ? classify(query.x, query.y, grown) : null;
  const ticks = [0, 2.5, 5, 7.5, 10];

  const caption = !grown
    ? `Shallow tree — it asks only one question: "income ≥ £60k?". Everyone below that line is rejected, so the ${APPS.filter((a) => a.repaid && a.x < INCOME_SPLIT).length} low-income applicants who actually repaid are wrongly denied (${correct}/${APPS.length} right). Grow the tree to add a second question.`
    : `Grown tree — a second question, "credit score ≥ 550?", now splits the low-income branch. Creditworthy low-income applicants get rescued into Approve, so every past applicant is judged correctly (${correct}/${APPS.length}). Click any spot on the map to watch an applicant fall through the questions.`;

  // shaded decision regions on the map
  const regions = !grown ? (
    <>
      <rect x={map.left} y={map.top} width={scaleX(INCOME_SPLIT) - map.left} height={mapH} fill={DENY} fillOpacity={flash === "L" ? 0.26 : 0.08} className="transition-all duration-300" />
      <rect x={scaleX(INCOME_SPLIT)} y={map.top} width={map.right - scaleX(INCOME_SPLIT)} height={mapH} fill={APPROVE} fillOpacity={flash === "R" ? 0.26 : 0.08} className="transition-all duration-300" />
    </>
  ) : (
    <>
      <rect x={map.left} y={scaleY(CREDIT_SPLIT)} width={scaleX(INCOME_SPLIT) - map.left} height={map.bottom - scaleY(CREDIT_SPLIT)} fill={DENY} fillOpacity={flash === "LL" ? 0.26 : 0.08} className="transition-all duration-300" />
      <rect x={map.left} y={map.top} width={scaleX(INCOME_SPLIT) - map.left} height={scaleY(CREDIT_SPLIT) - map.top} fill={APPROVE} fillOpacity={flash === "LR" ? 0.26 : 0.08} className="transition-all duration-300" />
      <rect x={scaleX(INCOME_SPLIT)} y={map.top} width={map.right - scaleX(INCOME_SPLIT)} height={mapH} fill={APPROVE} fillOpacity={flash === "R" ? 0.26 : 0.08} className="transition-all duration-300" />
    </>
  );

  const renderNode = (x: number, y: number, text: string, active: boolean, w = 78) => (
    <g>
      <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={3} fill="rgba(250,248,242,0.95)" stroke={active ? COLORS.yellow : COLORS.border} strokeWidth={active ? 2.5 : 1} />
      <text x={x} y={y + 4} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>{text}</text>
    </g>
  );
  const renderLeaf = (x: number, y: number, text: string, color: string, active: boolean) => (
    <g>
      <rect x={x - 42} y={y - 13} width={84} height={26} rx={3} fill="rgba(250,248,242,0.95)" stroke={active ? color : COLORS.border} strokeWidth={active ? 3 : 1} />
      <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize={10} fontWeight={800}>{text}</text>
    </g>
  );

  const branch = (from: { x: number; y: number }, to: { x: number; y: number }, on: boolean) => (
    <line x1={from.x} y1={from.y + 13} x2={to.x} y2={to.y - 13} stroke={on ? COLORS.yellow : COLORS.border} strokeWidth={on ? 3.5 : 1.5} className="transition-all" />
  );

  const canvas = (
    <svg className="block h-auto w-full cursor-crosshair" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Decision Tree Loan Approval" onPointerDown={onDown}>
      <title>Decision Tree Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* LEFT: applicant feature map */}
      <text x={map.left} y={map.top - 14} fill={COLORS.muted} fontSize={12} fontWeight={800}>APPLICANT MAP</text>
      {regions}
      {ticks.map((t) => (
        <g key={`t${t}`}>
          <line x1={scaleX(t)} y1={map.top} x2={scaleX(t)} y2={map.bottom} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
          <line x1={map.left} y1={scaleY(t)} x2={map.right} y2={scaleY(t)} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
        </g>
      ))}
      {/* split lines */}
      <line x1={scaleX(INCOME_SPLIT)} y1={map.top} x2={scaleX(INCOME_SPLIT)} y2={map.bottom} stroke={COLORS.yellow} strokeWidth={2.5} />
      {grown && (
        <motion.line x1={map.left} y1={scaleY(CREDIT_SPLIT)} x2={scaleX(INCOME_SPLIT)} y2={scaleY(CREDIT_SPLIT)} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="4 3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
      )}
      <line x1={map.left} y1={map.top} x2={map.left} y2={map.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <line x1={map.left} y1={map.bottom} x2={map.right} y2={map.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      {ticks.filter((t) => t % 5 === 0).map((t) => (
        <text key={`xl${t}`} x={scaleX(t)} y={map.bottom + 15} textAnchor="middle" fill={COLORS.muted} fontSize={9}>£{income(t)}k</text>
      ))}
      <text x={map.right} y={map.bottom + 30} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>income →</text>
      <text x={map.left - 8} y={map.top - 2} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>credit</text>

      {/* applicants */}
      {APPS.map((a) => (
        <circle key={a.id} cx={scaleX(a.x)} cy={scaleY(a.y)} r={5} fill={a.repaid ? APPROVE : DENY} stroke={COLORS.bg} strokeWidth={1.5} />
      ))}
      {query && (
        <g pointerEvents="none">
          <circle cx={scaleX(query.x)} cy={scaleY(query.y)} r={8} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
          <circle cx={scaleX(query.x)} cy={scaleY(query.y)} r={2.5} fill={COLORS.bg} />
        </g>
      )}

      {/* RIGHT: tree of yes/no questions */}
      <rect x={330} y={map.top} width={300} height={mapH} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
      <text x={340} y={map.top + 16} fill={COLORS.muted} fontSize={12} fontWeight={800}>DECISION TREE</text>

      {branch(nodes.root, nodes.left, !!query && query.x < INCOME_SPLIT)}
      {branch(nodes.root, nodes.right, !!query && query.x >= INCOME_SPLIT)}
      <text x={(nodes.root.x + nodes.left.x) / 2 - 6} y={(nodes.root.y + nodes.left.y) / 2} textAnchor="end" fill={COLORS.muted} fontSize={8} fontWeight={800}>yes</text>
      <text x={(nodes.root.x + nodes.right.x) / 2 + 6} y={(nodes.root.y + nodes.right.y) / 2} textAnchor="start" fill={COLORS.muted} fontSize={8} fontWeight={800}>no</text>

      {grown && (
        <>
          {branch(nodes.left, nodes.leafLL, !!query && query.x < INCOME_SPLIT && query.y < CREDIT_SPLIT)}
          {branch(nodes.left, nodes.leafLR, !!query && query.x < INCOME_SPLIT && query.y >= CREDIT_SPLIT)}
          <text x={(nodes.left.x + nodes.leafLL.x) / 2 - 6} y={(nodes.left.y + nodes.leafLL.y) / 2 + 4} textAnchor="end" fill={COLORS.muted} fontSize={8} fontWeight={800}>yes</text>
          <text x={(nodes.left.x + nodes.leafLR.x) / 2 + 6} y={(nodes.left.y + nodes.leafLR.y) / 2 + 4} textAnchor="start" fill={COLORS.muted} fontSize={8} fontWeight={800}>no</text>
        </>
      )}

      {renderNode(nodes.root.x, nodes.root.y, "income < £60k?", flash === null && animPos !== null && animPos.y === nodes.root.y, 92)}
      {renderLeaf(nodes.right.x, nodes.right.y, "APPROVE", APPROVE, flash === "R")}
      {!grown ? (
        renderLeaf(nodes.left.x, nodes.left.y, "DENY", DENY, flash === "L")
      ) : (
        <>
          {renderNode(nodes.left.x, nodes.left.y, "credit < 550?", animPos !== null && animPos.x === nodes.left.x && flash === null, 82)}
          {renderLeaf(nodes.leafLL.x, nodes.leafLL.y, "DENY", DENY, flash === "LL")}
          {renderLeaf(nodes.leafLR.x, nodes.leafLR.y, "APPROVE", APPROVE, flash === "LR")}
        </>
      )}

      {animPos && (
        <motion.circle cx={animPos.x} cy={animPos.y} r={5} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1} animate={{ cx: animPos.x, cy: animPos.y }} transition={{ type: "tween", ease: "easeInOut", duration: 0.55 }} />
      )}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Tree depth</span>
        <button
          aria-label={grown ? "Prune the tree back to one question" : "Grow the tree by adding a credit-score question"}
          onClick={() => {
            clearTimers();
            setGrown((g) => !g);
            setQuery(null);
            setAnimPos(null);
            setFlash(null);
          }}
          className="flex h-9 items-center justify-center border border-outline bg-cyan px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-white hover:bg-cyan/90"
        >
          {grown ? "Prune tree" : "Grow tree"}
        </button>
        <span className="font-sans text-[12px] text-on-surface-variant">Click anywhere on the applicant map to drop a new applicant and watch it fall through the questions.</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-bold uppercase text-on-surface-variant">Past applicants judged right</span>
          <span data-testid="tree-accuracy" className="text-lg font-bold" style={{ color: correct === APPS.length ? APPROVE : DENY }}>{correct}/{APPS.length}</span>
        </div>
        {query ? (
          <>
            <div className="flex justify-between gap-3"><span className="text-on-surface-variant">income</span><span className="font-bold text-on-surface">£{income(query.x)}k</span></div>
            <div className="flex justify-between gap-3"><span className="text-on-surface-variant">credit score</span><span className="font-bold text-on-surface">{credit(query.y)}</span></div>
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-outline pt-2">
              <span className="text-[11px] font-bold uppercase text-on-surface-variant">Verdict</span>
              <span data-testid="tree-verdict" className="text-base font-bold" style={{ color: verdict ? APPROVE : DENY }}>{verdict ? "APPROVE" : "DENY"}</span>
            </div>
          </>
        ) : (
          <span className="text-[12px] text-on-surface-variant">Drop an applicant to trace a verdict.</span>
        )}
      </div>
    </>
  );

  const mentalModel = (
    <p>
      A decision tree is just a <strong>flowchart of yes/no questions</strong>
      learned from data. Each question is a straight cut on one feature, so the
      tree carves the space into <strong>axis-aligned boxes</strong> — and you can
      read the exact rule behind any decision (&quot;denied because income &lt;
      £60k and credit &lt; 550&quot;). <strong>Deeper trees ask more questions</strong>,
      fitting finer regions: that fixes underfitting here, but pushed too far a
      tree memorises noise and overfits — which is why random forests and gradient
      boosting average many shallow trees instead.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
