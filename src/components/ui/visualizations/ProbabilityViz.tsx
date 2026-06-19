"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 420;
const plot = { left: 70, top: 40, right: 690, bottom: 340 };

// ---- Distribution math -----------------------------------------------------

function gaussianZ(): number {
  // Box–Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

interface Bin {
  center: number; // value at the centre of the bin
  x0px: number;
  x1px: number;
  cxpx: number;
  pTheory: number; // probability mass attributed to this bin
}

type Scenario = {
  id: string;
  tab: string; // short tab label
  family: string; // distribution name
  column: string; // the data column being measured
  unit: string; // x-axis label
  discrete: boolean;
  params: { key: string; label: string; min: number; max: number; step: number; def: number }[];
  domain: (p: Record<string, number>) => [number, number]; // continuous x-range OR [0, kmax]
  bins: number; // number of bins for continuous; ignored for discrete (uses kmax+1)
  density: (p: Record<string, number>, x: number) => number; // pdf (continuous) at x
  pmf: (p: Record<string, number>, k: number) => number; // pmf (discrete) at integer k
  draw: (p: Record<string, number>) => number; // one sample
  stats: (p: Record<string, number>) => { mean: number; variance: number };
  caption: (p: Record<string, number>) => string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "normal",
    tab: "Heights",
    family: "Normal (Gaussian)",
    column: "Adult heights",
    unit: "height (cm)",
    discrete: false,
    bins: 26,
    params: [
      { key: "mu", label: "average μ", min: 150, max: 190, step: 1, def: 170 },
      { key: "sigma", label: "spread σ", min: 4, max: 16, step: 0.5, def: 8 },
    ],
    domain: (p) => [p.mu - 4 * p.sigma, p.mu + 4 * p.sigma],
    density: (p, x) =>
      Math.exp(-((x - p.mu) ** 2) / (2 * p.sigma ** 2)) / (p.sigma * Math.sqrt(2 * Math.PI)),
    pmf: () => 0,
    draw: (p) => p.mu + p.sigma * gaussianZ(),
    stats: (p) => ({ mean: p.mu, variance: p.sigma ** 2 }),
    caption: (p) =>
      `Heights pile up around the average and fade symmetrically on both sides — the classic bell. μ = ${p.mu} cm slides the centre; σ = ${p.sigma} cm sets how wide the spread is.`,
  },
  {
    id: "binomial",
    tab: "Conversions",
    family: "Binomial (n = 20)",
    column: "Buyers per 20 visitors",
    unit: "buyers (out of 20)",
    discrete: true,
    bins: 0,
    params: [{ key: "p", label: "buy chance p", min: 0.05, max: 0.95, step: 0.05, def: 0.3 }],
    domain: () => [0, 20],
    density: () => 0,
    pmf: (p, k) => choose(20, k) * p.p ** k * (1 - p.p) ** (20 - k),
    draw: (p) => {
      let s = 0;
      for (let i = 0; i < 20; i++) if (Math.random() < p.p) s++;
      return s;
    },
    stats: (p) => ({ mean: 20 * p.p, variance: 20 * p.p * (1 - p.p) }),
    caption: (p) =>
      `Each of 20 visitors independently buys with probability p = ${p.p.toFixed(
        2,
      )}. Count the buyers and the totals cluster near 20p = ${(20 * p.p).toFixed(
        1,
      )} — the Binomial distribution.`,
  },
  {
    id: "poisson",
    tab: "Arrivals",
    family: "Poisson",
    column: "Support tickets per hour",
    unit: "tickets in one hour",
    discrete: true,
    bins: 0,
    params: [{ key: "lambda", label: "rate λ", min: 1, max: 12, step: 0.5, def: 4 }],
    domain: (p) => [0, Math.min(28, Math.ceil(p.lambda + 4 * Math.sqrt(p.lambda)) + 2)],
    density: () => 0,
    pmf: (p, k) => {
      // iterative term = e^-λ λ^k / k!
      let term = Math.exp(-p.lambda);
      for (let i = 1; i <= k; i++) term = (term * p.lambda) / i;
      return term;
    },
    draw: (p) => {
      const L = Math.exp(-p.lambda);
      let k = 0;
      let prod = 1;
      do {
        k++;
        prod *= Math.random();
      } while (prod > L);
      return k - 1;
    },
    stats: (p) => ({ mean: p.lambda, variance: p.lambda }),
    caption: (p) =>
      `Independent events landing in a fixed window. With rate λ = ${p.lambda.toFixed(
        1,
      )} tickets/hour the counts are skewed, and — uniquely — both the mean and the variance equal λ.`,
  },
  {
    id: "exponential",
    tab: "Wait times",
    family: "Exponential",
    column: "Minutes until next signup",
    unit: "minutes",
    discrete: false,
    bins: 26,
    params: [{ key: "rate", label: "rate λ", min: 0.2, max: 2, step: 0.1, def: 0.5 }],
    domain: (p) => [0, 5 / p.rate],
    density: (p, x) => (x < 0 ? 0 : p.rate * Math.exp(-p.rate * x)),
    pmf: () => 0,
    draw: (p) => -Math.log(1 - Math.random()) / p.rate,
    stats: (p) => ({ mean: 1 / p.rate, variance: 1 / p.rate ** 2 }),
    caption: (p) =>
      `Waiting time between random events: mostly short gaps with a long tail of rare long waits. Rate λ = ${p.rate.toFixed(
        1,
      )}/min means an average wait of 1/λ = ${(1 / p.rate).toFixed(1)} min.`,
  },
];

function buildBins(s: Scenario, p: Record<string, number>): Bin[] {
  const [xmin, xmax] = s.domain(p);
  if (s.discrete) {
    const kmax = Math.round(xmax);
    const count = kmax + 1;
    const span = plot.right - plot.left;
    const bw = span / count;
    const bins: Bin[] = [];
    for (let k = 0; k <= kmax; k++) {
      const x0px = plot.left + k * bw;
      bins.push({
        center: k,
        x0px,
        x1px: x0px + bw,
        cxpx: x0px + bw / 2,
        pTheory: s.pmf(p, k),
      });
    }
    return bins;
  }
  const N = s.bins;
  const bw = (xmax - xmin) / N;
  const spanpx = plot.right - plot.left;
  const bwpx = spanpx / N;
  const bins: Bin[] = [];
  for (let i = 0; i < N; i++) {
    const center = xmin + (i + 0.5) * bw;
    const x0px = plot.left + i * bwpx;
    bins.push({
      center,
      x0px,
      x1px: x0px + bwpx,
      cxpx: x0px + bwpx / 2,
      pTheory: s.density(p, center) * bw, // probability mass in the bin
    });
  }
  return bins;
}

export default function ProbabilityViz() {
  const [scenarioId, setScenarioId] = useState("normal");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) as Scenario;

  const [params, setParams] = useState<Record<string, number>>(() =>
    Object.fromEntries(scenario.params.map((pp) => [pp.key, pp.def])),
  );
  const [counts, setCounts] = useState<number[]>([]);
  const [auto, setAuto] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bins = useMemo(() => buildBins(scenario, params), [scenario, params]);
  const n = counts.reduce((a, b) => a + b, 0);

  // y-scale anchored to the theoretical peak so the shape always fills the frame.
  const yMax = useMemo(() => {
    const peak = Math.max(0.05, ...bins.map((b) => b.pTheory));
    return peak * 1.18;
  }, [bins]);
  const barH = (prob: number) => (prob / yMax) * (plot.bottom - plot.top);

  const switchScenario = (s: Scenario) => {
    setAuto(false);
    setScenarioId(s.id);
    setParams(Object.fromEntries(s.params.map((pp) => [pp.key, pp.def])));
    setCounts([]);
  };

  const setParam = (key: string, value: number) => {
    setAuto(false);
    setParams((prev) => ({ ...prev, [key]: value }));
    setCounts([]); // samples were drawn from the old shape; start fresh
  };

  const drawSamples = (amount: number) => {
    setCounts((prev) => {
      const next = prev.length === bins.length ? [...prev] : new Array(bins.length).fill(0);
      const [xmin, xmax] = scenario.domain(params);
      for (let i = 0; i < amount; i++) {
        const v = scenario.draw(params);
        let idx: number;
        if (scenario.discrete) {
          idx = Math.round(v);
        } else {
          const N = scenario.bins;
          idx = Math.floor(((v - xmin) / (xmax - xmin)) * N);
        }
        if (idx >= 0 && idx < next.length) next[idx] += 1;
      }
      return next;
    });
  };

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (auto) timerRef.current = setInterval(() => drawSamples(40), 90);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auto, scenarioId, params]);

  const { mean, variance } = scenario.stats(params);

  // average absolute gap between sampled bars and theory, as a convergence cue
  const gap =
    n > 0
      ? bins.reduce((acc, b, i) => acc + Math.abs((counts[i] ?? 0) / n - b.pTheory), 0)
      : 0;
  const converged = n >= 400 && gap < 0.06;

  const yTicks = useMemo(() => {
    const top = yMax;
    const step = top > 0.3 ? 0.1 : top > 0.15 ? 0.05 : 0.02;
    const ticks: number[] = [];
    for (let t = 0; t <= top + 1e-9; t += step) ticks.push(+t.toFixed(3));
    return ticks;
  }, [yMax]);

  const xLabels = useMemo(() => {
    const [xmin, xmax] = scenario.domain(params);
    if (scenario.discrete) {
      const kmax = Math.round(xmax);
      const stepK = kmax > 16 ? 4 : kmax > 8 ? 2 : 1;
      const out: { px: number; text: string }[] = [];
      for (let k = 0; k <= kmax; k += stepK) {
        const b = bins[k];
        if (b) out.push({ px: b.cxpx, text: String(k) });
      }
      return out;
    }
    const out: { px: number; text: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const val = xmin + (i / 4) * (xmax - xmin);
      const px = plot.left + (i / 4) * (plot.right - plot.left);
      out.push({ px, text: val >= 100 ? val.toFixed(0) : val.toFixed(1) });
    }
    return out;
  }, [scenario, params, bins]);

  // Theory polygon (continuous) through bin tops — cheap, computed each render.
  const theoryArea = scenario.discrete
    ? ""
    : `M${plot.left},${plot.bottom} L${bins
        .map((b) => `${b.cxpx.toFixed(1)},${(plot.bottom - barH(b.pTheory)).toFixed(1)}`)
        .join(" L")} L${plot.right},${plot.bottom} Z`;

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Probability Distribution Explorer"
    >
      <title>Probability Distribution Explorer</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* gridlines + y ticks (probability) */}
      {yTicks.map((t) => {
        const yp = plot.bottom - barH(t);
        return (
          <g key={`y-${t}`}>
            <line x1={plot.left} x2={plot.right} y1={yp} y2={yp} stroke={COLORS.grid} strokeWidth={1} />
            <text x={plot.left - 8} y={yp + 4} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>
              {(t * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}

      {/* axes */}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <text x={plot.left - 8} y={plot.top - 14} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>
        chance
      </text>

      {/* sampled histogram (what you actually observed) */}
      {n > 0 &&
        bins.map((b, i) => {
          const emp = (counts[i] ?? 0) / n;
          const h = barH(emp);
          if (h < 0.5) return null;
          const w = Math.max(2, (b.x1px - b.x0px) * (scenario.discrete ? 0.6 : 0.92));
          return (
            <motion.rect
              key={`emp-${i}`}
              x={b.cxpx - w / 2}
              width={w}
              fill={COLORS.cyan}
              fillOpacity={0.85}
              initial={false}
              animate={{ y: plot.bottom - h, height: h }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
            />
          );
        })}

      {/* theoretical distribution (the model of the column) */}
      {scenario.discrete ? (
        bins.map((b, i) => {
          const yp = plot.bottom - barH(b.pTheory);
          return (
            <g key={`th-${i}`}>
              <line x1={b.cxpx} x2={b.cxpx} y1={plot.bottom} y2={yp} stroke={COLORS.pink} strokeWidth={2} strokeOpacity={0.55} />
              <motion.circle
                cx={b.cxpx}
                r={4.5}
                fill={COLORS.pink}
                initial={false}
                animate={{ cy: yp }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
              />
            </g>
          );
        })
      ) : (
        <motion.path
          d={theoryArea}
          fill={COLORS.pink}
          fillOpacity={0.12}
          stroke={COLORS.pink}
          strokeWidth={2.5}
          initial={false}
          animate={{ d: theoryArea }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      )}

      {/* mean marker */}
      {(() => {
        const [xmin, xmax] = scenario.domain(params);
        const mpx = scenario.discrete
          ? plot.left + ((mean + 0.5) / (Math.round(xmax) + 1)) * (plot.right - plot.left)
          : plot.left + ((mean - xmin) / (xmax - xmin)) * (plot.right - plot.left);
        if (mpx < plot.left || mpx > plot.right) return null;
        return (
          <g>
            <line x1={mpx} x2={mpx} y1={plot.top} y2={plot.bottom} stroke={COLORS.yellow} strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={mpx} y={plot.top - 4} textAnchor="middle" fill={COLORS.yellow} fontSize={11} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              mean
            </text>
          </g>
        );
      })()}

      {/* x-axis labels + unit */}
      {xLabels.map((l, i) => (
        <text key={`xl-${i}`} x={l.px} y={plot.bottom + 18} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={700}>
          {l.text}
        </text>
      ))}
      <text x={(plot.left + plot.right) / 2} y={plot.bottom + 38} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={700}>
        {scenario.unit}
      </text>
    </svg>
  );

  const caption = (
    <span>
      <strong>{scenario.column}</strong> follow a{" "}
      <strong style={{ color: COLORS.pink }}>{scenario.family}</strong> distribution.{" "}
      {scenario.caption(params)}{" "}
      {n === 0
        ? "Draw samples and the bars will fill in under the shape."
        : converged
          ? `After ${n} samples the observed bars match the distribution (gap ${gap.toFixed(3)}).`
          : `${n} samples drawn — the bars are settling onto the shape (gap ${gap.toFixed(3)}).`}
    </span>
  );

  const controls = (
    <>
      {/* scenario picker */}
      <div className="flex flex-col gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          What are you measuring?
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              aria-label={`Measure ${s.column}`}
              aria-pressed={s.id === scenarioId}
              onClick={() => switchScenario(s)}
              className={`border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${
                s.id === scenarioId
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container hover:text-primary"
              }`}
            >
              {s.tab}
            </button>
          ))}
        </div>
      </div>

      {/* parameter sliders */}
      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        {scenario.params.map((pp) => (
          <div key={pp.key} className="flex flex-col gap-1">
            <label htmlFor={`prob-${pp.key}`} className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
              <span>{pp.label}</span>
              <span className="text-on-surface">{params[pp.key]}</span>
            </label>
            <input
              id={`prob-${pp.key}`}
              aria-label={pp.label}
              type="range"
              min={pp.min}
              max={pp.max}
              step={pp.step}
              value={params[pp.key]}
              onChange={(e) => setParam(pp.key, Number(e.target.value))}
              className="w-full cursor-pointer accent-primary"
            />
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between border-t border-outline pt-2 font-mono text-[11px] text-on-surface-variant">
          <span>mean <span className="font-bold text-on-surface">{mean.toFixed(scenario.discrete ? 1 : 1)}</span></span>
          <span>variance <span className="font-bold text-on-surface">{variance.toFixed(1)}</span></span>
        </div>
      </div>

      {/* sampling */}
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Samples drawn: <span data-testid="probability-sample-count" className="text-base font-bold text-primary">{n}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            aria-label="DRAW 1 SAMPLE"
            onClick={() => drawSamples(1)}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container hover:text-primary"
          >
            Draw 1
          </button>
          <button
            aria-label="DRAW 200 SAMPLES"
            onClick={() => drawSamples(200)}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container hover:text-primary"
          >
            Draw 200
          </button>
          <button
            aria-label="TOGGLE AUTO SAMPLER"
            aria-pressed={auto}
            onClick={() => setAuto((a) => !a)}
            className={`flex h-9 items-center justify-center border px-3 font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
              auto ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {auto ? "Stop" : "Auto-rain"}
          </button>
          <button
            aria-label="CLEAR SAMPLES"
            onClick={() => {
              setAuto(false);
              setCounts([]);
            }}
            disabled={n === 0}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A <strong>probability distribution</strong> is the shape of a single column of data — it
        says which values are common, which are rare, and how spread out they are. The{" "}
        <span style={{ color: COLORS.pink }}>filled shape / stems</span> are the idealized
        distribution; the <span style={{ color: COLORS.cyan }}>solid bars</span> are actual samples
        drawn from it.
      </p>
      <p>
        Different real-world quantities have characteristically different shapes, and each is pinned
        down by just a parameter or two: a <strong>Normal</strong> bell (average and spread), a{" "}
        <strong>Binomial</strong> count of successes, a skewed <strong>Poisson</strong> of arrivals,
        an <strong>Exponential</strong> of waiting times. Picking the right distribution for a
        feature is the first modelling decision in a probabilistic model.
      </p>
      <p>
        Draw enough samples and the bars converge onto the curve — the{" "}
        <strong>Law of Large Numbers</strong> — which is why averages over big samples are
        trustworthy even though any single draw is not.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
