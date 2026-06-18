"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  NarrativeControls,
  VizShell,
} from "../visualizationPrimitives";
import { useNarrativeStepper } from "./useAnimationEngine";

const W = 720;
const H = 460;

// Screen anchors for the pseudo-3D projection.
const CX = W / 2; // horizontal centre
const CY_FLAT = 232; // vertical centre when viewed top-down
const CY_TILT = 322; // ground sinks down as the scene tilts into 3D
const SCALE_X = 74;
const SCALE_Y_FLAT = 74;
const SCALE_Y_TILT = 38; // depth compresses under the tilt
const LIFT_HEIGHT = 232; // how far a z=1 point rises on screen

const MAX_R = 3.35; // world radius used to normalise the height channel
const Z_PLANE = 0.4; // height of the separating plane (in z units)
const BOUNDARY_R = MAX_R * Math.sqrt(Z_PLANE); // circle radius the plane maps back to

// Deterministic ring dataset: an inner core encircled by an outer ring.
// label 1 = inner core (pink), label 0 = outer ring (cyan).
function buildPoints() {
  const pts: { id: number; wx: number; wy: number; z: number; label: 0 | 1 }[] =
    [];
  // Inner core
  const inner = [
    [0, 0],
    [0.7, 0.4],
    [-0.6, 0.5],
    [0.4, -0.7],
    [-0.5, -0.5],
    [0.9, -0.2],
    [-0.9, 0.1],
    [0.1, 0.9],
    [-0.2, -0.9],
  ];
  inner.forEach(([wx, wy], i) => {
    const d = Math.hypot(wx, wy);
    pts.push({ id: i, wx, wy, z: (d / MAX_R) ** 2, label: 1 });
  });
  // Outer ring
  const ringCount = 14;
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    // mild deterministic jitter so it reads as data, not a perfect circle
    const r = 2.85 + 0.35 * Math.sin(angle * 3.1);
    const wx = r * Math.cos(angle);
    const wy = r * Math.sin(angle);
    const d = Math.hypot(wx, wy);
    pts.push({ id: 100 + i, wx, wy, z: (d / MAX_R) ** 2, label: 0 });
  }
  return pts;
}

// Project a world point (wx, wy, z) to screen coordinates at a given lift (0..1).
// As the scene tilts (lift -> 1) depth compresses vertically and the back of
// the floor (smaller wy) foreshortens horizontally, so flat surfaces read as
// receding planes rather than flat rectangles.
function project(wx: number, wy: number, z: number, lift: number) {
  const sy = SCALE_Y_FLAT * (1 - lift) + SCALE_Y_TILT * lift;
  const baseY = CY_FLAT * (1 - lift) + CY_TILT * lift;
  const persp = 1 + 0.16 * lift * (wy / MAX_R); // front wider, back narrower
  return {
    x: CX + wx * SCALE_X * persp,
    y: baseY + wy * sy - z * LIFT_HEIGHT * lift,
  };
}

const SPRING = { type: "spring" as const, stiffness: 90, damping: 18 };

const BEATS = [
  {
    name: "Tangled",
    caption:
      "In 2D the inner core is trapped inside the outer ring. Try a straight line however you like — no line can separate them.",
  },
  {
    name: "Lift",
    caption:
      "Add a third dimension: lift each point by its distance from the centre, squared. The outer ring floats up; the core stays low.",
  },
  {
    name: "Slice",
    caption:
      "Now a single flat plane slides between the two heights and separates them perfectly. That is the kernel trick.",
  },
  {
    name: "Back to 2D",
    caption:
      "Project that flat plane back down and it becomes a circle — the curved boundary SVM draws around the core.",
  },
];

const STEP_LIFT = [0, 1, 1, 0];

export default function SVMViz() {
  const points = useMemo(() => buildPoints(), []);
  const { currentStep, isPlaying, stepForward, stepBackward, reset, play, pause } =
    useNarrativeStepper(BEATS.length, 2200);

  // The lift slider provides free play; using it overrides the guided beat.
  const [liftOverride, setLiftOverride] = React.useState<number | null>(null);

  const lift = liftOverride ?? STEP_LIFT[currentStep];
  const guided = liftOverride === null;
  const showPlane = guided ? currentStep >= 2 : lift > 0.55;
  const showFailLine = guided && currentStep === 0;
  const showCircle = guided && currentStep === 3;

  const caption = guided
    ? BEATS[currentStep].caption
    : lift > 0.55
      ? "Lifted into 3D — the flat plane now sits cleanly between the low core and the raised ring."
      : "Flattened back toward 2D — the ring closes back around the core.";

  const resumeGuided = (fn: () => void) => () => {
    setLiftOverride(null);
    fn();
  };

  // Separating plane as a 3D slab: a top surface at z = Z_PLANE plus a thin
  // front edge that gives it visible thickness.
  const PLANE_THICKNESS = 0.07;
  const toPts = (coords: { x: number; y: number }[]) =>
    coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const planeTopPts = toPts(
    [
      [-MAX_R, -MAX_R],
      [MAX_R, -MAX_R],
      [MAX_R, MAX_R],
      [-MAX_R, MAX_R],
    ].map(([wx, wy]) => project(wx, wy, Z_PLANE, lift)),
  );
  // Front edge (nearest the viewer = largest wy) extruded down by the thickness.
  const planeSidePts = toPts([
    project(-MAX_R, MAX_R, Z_PLANE, lift),
    project(MAX_R, MAX_R, Z_PLANE, lift),
    project(MAX_R, MAX_R, Z_PLANE - PLANE_THICKNESS, lift),
    project(-MAX_R, MAX_R, Z_PLANE - PLANE_THICKNESS, lift),
  ]);

  // Project points and split by height so the plane can be drawn between the
  // groups: low core (below the plane) draws first, then the plane, then the
  // raised ring (above) on top — that depth ordering is what reads as 3D.
  const projected = points.map((p) => ({
    ...p,
    scr: project(p.wx, p.wy, p.z, lift),
  }));
  const byDepth = (a: { scr: { y: number } }, b: { scr: { y: number } }) =>
    a.scr.y - b.scr.y;
  const belowPlane = projected.filter((p) => p.z < Z_PLANE).sort(byDepth);
  const abovePlane = projected.filter((p) => p.z >= Z_PLANE).sort(byDepth);
  const orderedAll = [...projected].sort(byDepth);

  const renderPoint = (p: (typeof projected)[number]) => (
    <motion.circle
      key={p.id}
      initial={false}
      animate={{ cx: p.scr.x, cy: p.scr.y }}
      transition={SPRING}
      r={7}
      fill={p.label === 1 ? COLORS.pink : COLORS.cyan}
      stroke={COLORS.bg}
      strokeWidth={2}
    />
  );

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="SVM Kernel Trick Lift to 3D"
    >
      <title>S V M Kernel Trick Diagram</title>
      <SVGFilters />
      <defs>
        <linearGradient id="svm-plane-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.yellow} stopOpacity={0.32} />
          <stop offset="100%" stopColor={COLORS.yellow} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Ground reference frame: a faint square that tilts with the scene */}
      <motion.polygon
        initial={false}
        animate={{
          points: [
            [-MAX_R, -MAX_R],
            [MAX_R, -MAX_R],
            [MAX_R, MAX_R],
            [-MAX_R, MAX_R],
          ]
            .map(([wx, wy]) => {
              const p = project(wx, wy, 0, lift);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" "),
        }}
        transition={SPRING}
        fill={COLORS.grid}
        fillOpacity={0.25}
        stroke={COLORS.border}
        strokeWidth={1}
      />

      {/* Failed straight-line separator (2D beat) */}
      {showFailLine && (
        <g>
          <line
            x1={CX - 3.6 * SCALE_X}
            y1={CY_FLAT + 1.7 * SCALE_Y_FLAT}
            x2={CX + 3.6 * SCALE_X}
            y2={CY_FLAT - 1.7 * SCALE_Y_FLAT}
            stroke={COLORS.muted}
            strokeWidth={2.5}
            strokeDasharray="8 6"
          />
          <text
            x={CX + 3.4 * SCALE_X}
            y={CY_FLAT - 1.7 * SCALE_Y_FLAT - 10}
            textAnchor="end"
            fill={COLORS.muted}
            fontSize={13}
            fontWeight={700}
          >
            no line works
          </text>
        </g>
      )}

      {/* Decision boundary as a circle (final 2D beat) */}
      {showCircle && (
        <motion.circle
          key="boundary-circle"
          cx={CX}
          cy={CY_FLAT}
          r={BOUNDARY_R * SCALE_X}
          fill={COLORS.pink}
          fillOpacity={0.06}
          stroke={COLORS.pink}
          strokeWidth={3}
          strokeDasharray="7 5"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          filter="url(#glow)"
        />
      )}

      {/* Depth-ordered scene. When the plane is shown it is drawn BETWEEN the
          two point groups so it visibly separates them in 3D: low core below,
          plane, raised ring above. Otherwise all points draw together. */}
      {showPlane ? (
        <>
          {belowPlane.map(renderPoint)}
          <motion.g key="plane" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Thickness edge first, then the lit top surface over it */}
            <polygon
              points={planeSidePts}
              fill={COLORS.yellow}
              fillOpacity={0.7}
              stroke={COLORS.yellow}
              strokeWidth={1}
            />
            <polygon
              points={planeTopPts}
              fill="url(#svm-plane-grad)"
              stroke={COLORS.yellow}
              strokeWidth={2}
            />
          </motion.g>
          {abovePlane.map(renderPoint)}
        </>
      ) : (
        orderedAll.map(renderPoint)
      )}

      {/* Height axis cue while lifted */}
      {lift > 0.15 && (
        <text
          x={28}
          y={70}
          fill={COLORS.muted}
          fontSize={12}
          fontWeight={700}
          opacity={lift}
        >
          height = distance²
        </text>
      )}
    </svg>
  );

  const controls = (
    <>
      <div className="flex items-center sm:min-w-[340px]">
        <NarrativeControls
          isPlaying={isPlaying}
          onPlayToggle={resumeGuided(isPlaying ? pause : play)}
          onStepForward={resumeGuided(stepForward)}
          onStepBackward={resumeGuided(stepBackward)}
          onReset={resumeGuided(reset)}
          currentStep={currentStep}
          totalSteps={BEATS.length}
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
        <label
          htmlFor="svm-lift"
          className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary"
        >
          Free play: lift into the third dimension
        </label>
        <input
          id="svm-lift"
          aria-label="Lift into third dimension"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={lift}
          onChange={(e) => setLiftOverride(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          <span>Flat (2D)</span>
          <span>Lifted (3D)</span>
        </div>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-3">
      <p>
        A Support Vector Machine looks for the widest possible gap between two
        classes. When the classes are tangled in their original space — like a
        ring wrapped around a core — no straight boundary exists. The{" "}
        <strong>kernel trick</strong> lets SVM act as if it lifted every point
        into a higher dimension (here, by distance-from-centre squared) where a
        flat boundary <em>does</em> exist. Project that flat plane back down and
        it becomes a curve.
      </p>
      <p className="text-[13px] text-on-surface-variant/80">
        Deliberate simplification: a real kernel never computes the lifted
        coordinates explicitly — it measures similarity between points directly.
        The lift here is the geometric intuition behind that shortcut.
      </p>
    </div>
  );

  return (
    <VizShell
      canvas={canvas}
      controls={controls}
      caption={caption}
      mentalModel={mentalModel}
    />
  );
}
