/**
 * The Dunning–Kruger poster shown in the lobby while students join. Built in
 * HTML and SVG rather than as an image so its text stays sharp on any
 * projector and can be read by a screen reader. It keeps its own poster
 * colours; the stages are told apart by number as well as colour.
 */

const INK = "#141414";
const CREAM = "#FFF5E6";
const CURVE = "#5B3FF0";

const STAGES = [
  {
    n: 1,
    title: "Peak delulu",
    colour: "#FF6B4A",
    body: "You know about 2% of something and feel 100% ready. You don't know enough to see what you're missing.",
    quote: "Bro, this is easy.",
  },
  {
    n: 2,
    title: "Flop era",
    colour: "#D6F33C",
    body: "You learn a bit more and it hits you how much there is. Confidence: deleted. This is normal.",
    quote: "Why is nobody talking about how hard this is??",
  },
  {
    n: 3,
    title: "Glow-up arc",
    colour: "#CDC4FF",
    body: "You keep practising and it starts clicking. Confidence comes back slowly, and this time it's earned.",
    quote: "Okay, I'm lowkey getting it.",
  },
  {
    n: 4,
    title: "Main character",
    colour: "#8FE3C9",
    body: "You actually know your stuff, and you also know what you still don't know. That's the real flex.",
    quote: "Honestly? It depends.",
  },
] as const;

/** Where each stage sits on the curve, in the chart's 600 × 400 viewBox. */
const POINTS = [
  { x: 147, y: 75 },
  { x: 272, y: 307 },
  { x: 404, y: 248 },
  { x: 564, y: 160 },
];

const CURVE_PATH = "M47 354 C78 190 108 75 147 75 C190 75 232 310 272 307 C322 303 362 274 404 248 C462 212 515 180 564 160";

/** The tags on the chart, placed as a share of the chart's width and height. */
const TAGS: { stage: number; style: React.CSSProperties; rotate: number; note?: string }[] = [
  { stage: 0, style: { left: "30%", top: "11%" }, rotate: -3, note: "“I could teach this tbh”" },
  { stage: 3, style: { right: "3%", top: "19%" }, rotate: 3, note: "(but for real this time)" },
  { stage: 2, style: { left: "46%", top: "45%" }, rotate: -2 },
  { stage: 1, style: { left: "49%", top: "79%" }, rotate: 2 },
];

/** The site squares its corners; the poster keeps its own rounded look. */
const card = "rounded-[14px] border-2 shadow-[5px_5px_0_#141414]";

function Sparkle({ size, fill, className }: { size: number; fill: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M50 2 C54 36 64 46 98 50 C64 54 54 64 50 98 C46 64 36 54 2 50 C36 46 46 36 50 2Z"
        fill={fill}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chart() {
  return (
    <figure className="m-0 min-w-0">
      <p className="text-sm font-semibold sm:text-base">
        <span aria-hidden="true">↑ </span>Confidence (the vibes)
      </p>
      <div className="@container relative mt-1">
        <svg
          viewBox="0 0 600 400"
          className="block h-auto w-full"
          role="img"
          aria-label="A curve of confidence against how much you actually know. Confidence shoots up to a peak (1) while knowledge is still tiny, crashes to a low (2) as you learn more, then climbs slowly through 3 to 4 as you become an expert."
        >
          <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 360 V22 M30 34 L40 20 L50 34" />
            <path d="M40 360 H586 M572 350 L588 360 L572 370" />
          </g>
          <path d={CURVE_PATH} fill="none" stroke={CURVE} strokeWidth="10" strokeLinecap="round" />
          {POINTS.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="17" fill={INK} stroke={CREAM} strokeWidth="3" />
              <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-body)">
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        {TAGS.map((tag) => {
          const stage = STAGES[tag.stage];
          return (
            <div
              key={stage.n}
              aria-hidden="true"
              className={`${card} absolute px-[1.6cqw] py-[0.8cqw] leading-tight`}
              style={{ ...tag.style, background: stage.colour, borderColor: INK, transform: `rotate(${tag.rotate}deg)` }}
            >
              <span className="block text-[clamp(0.75rem,3.2cqw,1.75rem)] font-bold">{stage.title}</span>
              {tag.note && <span className="block text-[clamp(0.5rem,1.7cqw,0.95rem)] font-medium">{tag.note}</span>}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-1 grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 text-xs sm:text-sm">
        <span>Total newbie</span>
        <span className="text-center text-sm font-semibold sm:text-base">How much you actually know <span aria-hidden="true">→</span></span>
        <span className="text-right">Actual expert</span>
      </figcaption>
    </figure>
  );
}

export default function MountDeluluPoster() {
  return (
    <article
      aria-labelledby="mount-delulu-title"
      className="@container relative overflow-hidden rounded-[24px] border-2 p-5 font-body sm:p-8"
      style={{ background: CREAM, color: INK, borderColor: INK }}
    >
      <Sparkle size={64} fill="#D6F33C" className="absolute right-5 top-5 hidden @lg:block" />
      <Sparkle size={30} fill="#FF6B4A" className="absolute right-24 top-20 hidden @lg:block" />

      <header className="max-w-3xl pr-0 @lg:pr-24">
        <p className="inline-block rounded-[999px] px-4 py-1.5 text-sm font-semibold text-white" style={{ background: INK }}>
          The Dunning–Kruger effect
        </p>
        <h2 id="mount-delulu-title" className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] @2xl:text-6xl">
          Mount Delulu is real.
        </h2>
        <p className="mt-3 text-lg leading-snug @2xl:text-xl @6xl:text-2xl">
          Why knowing a tiny bit feels like knowing everything, and how you actually level up.
        </p>
      </header>

      <div className="mt-6 grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @4xl:items-center">
        <Chart />
        <ol className="m-0 grid list-none gap-4 p-0 @md:grid-cols-2 @6xl:gap-5">
          {STAGES.map((stage) => (
            <li key={stage.n} className={`${card} flex flex-col p-4 @6xl:p-5`} style={{ background: stage.colour, borderColor: INK }}>
              <h3 className="text-base font-bold @6xl:text-xl">
                {stage.n} · {stage.title}
              </h3>
              <p className="mt-2 text-sm leading-snug @6xl:text-lg">{stage.body}</p>
              <p className="mt-auto pt-3 text-sm font-semibold leading-snug @6xl:text-lg">You be like: “{stage.quote}”</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-4 @2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-[14px] p-5 text-white @2xl:p-7" style={{ background: INK }}>
          <h3 className="text-2xl font-bold @6xl:text-3xl">Where are you on the curve?</h3>
          <p className="mt-2 leading-snug @6xl:text-xl">
            Pick one thing (coding, driving, your fave game, cooking) and place yourself honestly. No cap. Being in the flop era means you&apos;re learning.
          </p>
        </section>
        <section className="rounded-[14px] border-2 border-dashed p-5" style={{ borderColor: INK }}>
          <h3 className="font-bold">Real talk</h3>
          <p className="mt-1 text-sm leading-snug @6xl:text-base">
            This curve is the internet&apos;s meme version. The original 1999 study by Dunning and Kruger found people who scored lowest on tests tended to overestimate their scores the most.
          </p>
        </section>
      </div>
    </article>
  );
}
