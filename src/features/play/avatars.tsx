import { useId, type ReactNode } from "react";
import { NICKNAME_ANIMALS, nicknameParts, type NicknameAnimal, type NicknameColour } from "./nicknames";

/**
 * A drawn animal for every nickname: "Coral Otter" is an otter on coral. Each
 * animal is a few flat shapes on a 100 × 100 grid, in one style: a sticker-like
 * outline, dark eyes with a highlight, and pink cheeks.
 */

const INK = "#2E2622";
const BLUSH = "#F28C9B";
const WHITE = "#FFFDF9";

export const AVATAR_COLOURS: Record<NicknameColour, string> = {
  Amber: "#F4B740",
  Blue: "#76AEE0",
  Bronze: "#C9955A",
  Coral: "#F5937E",
  Copper: "#D9834F",
  Crimson: "#DE5266",
  Golden: "#EBC75E",
  Green: "#86BD72",
  Indigo: "#7B7FD0",
  Jade: "#57B593",
  Lemon: "#F0E27E",
  Lilac: "#C9AEE6",
  Mint: "#A2DFC5",
  Orange: "#F8A253",
  Pearl: "#EAE4D8",
  Plum: "#A86A9A",
  Ruby: "#D04A69",
  Sage: "#B0C39B",
  Scarlet: "#EC6352",
  Silver: "#C8CDD4",
  Teal: "#4BA6A8",
  Violet: "#A17DD8",
};

function Eyes({ y, dx, r = 4 }: { y: number; dx: number; r?: number }) {
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse cx={50 + side * dx} cy={y} rx={r * 0.85} ry={r} fill={INK} />
          <circle cx={50 + side * dx + r * 0.3} cy={y - r * 0.38} r={r * 0.32} fill={WHITE} />
        </g>
      ))}
    </g>
  );
}

/** Eyes on a dark patch: a white ring round each, so they still read. */
function RingedEyes({ y, dx }: { y: number; dx: number }) {
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <circle cx={50 + side * dx} cy={y} r={4.2} fill={WHITE} />
          <circle cx={50 + side * dx} cy={y + 0.4} r={2.7} fill={INK} />
          <circle cx={50 + side * dx + 0.9} cy={y - 0.7} r={0.9} fill={WHITE} />
        </g>
      ))}
    </g>
  );
}

function Cheeks({ y, dx, opacity = 0.55 }: { y: number; dx: number; opacity?: number }) {
  return (
    <g fill={BLUSH} opacity={opacity}>
      <ellipse cx={50 - dx} cy={y} rx={5} ry={3} />
      <ellipse cx={50 + dx} cy={y} rx={5} ry={3} />
    </g>
  );
}

/** A small "w" mouth under the nose. */
function Mouth({ y, width = 4.5 }: { y: number; width?: number }) {
  return (
    <path
      d={`M${50 - width} ${y} q${width / 2} ${width * 0.7} ${width} 0 q${width / 2} ${width * 0.7} ${width} 0`}
      fill="none"
      stroke={INK}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Whiskers({ y, from = 30, colour = INK }: { y: number; from?: number; colour?: string }) {
  return (
    <g stroke={colour} strokeWidth={1.4} strokeLinecap="round" opacity={0.55}>
      <path d={`M${from} ${y} l-11 -2 M${from} ${y + 4} l-11 2`} />
      <path d={`M${100 - from} ${y} l11 -2 M${100 - from} ${y + 4} l11 2`} />
    </g>
  );
}

/** Mirrors its children across the middle of the avatar. */
function Mirror({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="matrix(-1 0 0 1 100 0)">{children}</g>
    </>
  );
}

/** Points round a centre, alternating between two radii: a mane, or spines. */
function spikes(cx: number, cy: number, outer: number, inner: number, from: number, to: number, count: number): string {
  const points: string[] = [];
  for (let i = 0; i <= count * 2; i += 1) {
    const angle = ((from + ((to - from) * i) / (count * 2)) * Math.PI) / 180;
    const r = i % 2 === 0 ? inner : outer;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

const ANIMALS: Record<NicknameAnimal, () => ReactNode> = {
  Badger: () => (
    <>
      <Mirror>
        <circle cx={28} cy={36} r={7.5} fill={INK} />
        <circle cx={28} cy={36} r={3.5} fill="#BDB8B2" />
      </Mirror>
      <ellipse cx={50} cy={58} rx={29} ry={27} fill={WHITE} stroke="#A9A39C" strokeWidth={2} />
      <Mirror>
        <path d="M33 33 C26 39 27 55 37 69 L43 66 C40 56 41 42 44 32 C40 31 36 31.5 33 33 Z" fill={INK} />
      </Mirror>
      <RingedEyes y={52} dx={11} />
      <ellipse cx={50} cy={70} rx={5} ry={3.6} fill={INK} />
      <Mouth y={74} width={3.5} />
      <Cheeks y={66} dx={20} />
    </>
  ),
  Bear: () => (
    <>
      <Mirror>
        <circle cx={28} cy={33} r={10} fill="#A9744F" stroke="#7A5236" strokeWidth={2} />
        <circle cx={28} cy={33} r={5} fill="#E7B39C" />
      </Mirror>
      <circle cx={50} cy={57} r={29} fill="#A9744F" stroke="#7A5236" strokeWidth={2} />
      <ellipse cx={50} cy={67} rx={12.5} ry={10} fill="#EBCDA9" />
      <ellipse cx={50} cy={62.5} rx={4.6} ry={3.3} fill={INK} />
      <path d="M50 65.5 v3" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Mouth y={68.5} width={4} />
      <Eyes y={51} dx={11.5} />
      <Cheeks y={61} dx={20} />
    </>
  ),
  Cat: () => (
    <>
      <Mirror>
        <path d="M22 44 L25 15 L46 30 Z" fill="#F0A04B" stroke="#C27426" strokeWidth={2} strokeLinejoin="round" />
        <path d="M27 37 L28.5 22 L39.5 30 Z" fill="#F7B9A8" />
      </Mirror>
      <ellipse cx={50} cy={58} rx={30} ry={27} fill="#F0A04B" stroke="#C27426" strokeWidth={2} />
      <g stroke="#C27426" strokeWidth={2.6} strokeLinecap="round">
        <path d="M50 32 v7 M43 33 l1.6 6 M57 33 l-1.6 6" />
      </g>
      <ellipse cx={50} cy={68} rx={11} ry={7.5} fill="#FFE7C8" />
      <path d="M46.8 63 h6.4 l-3.2 3.4 z" fill="#E5737F" stroke="#E5737F" strokeWidth={1.2} strokeLinejoin="round" />
      <Mouth y={67} width={3.6} />
      <Whiskers y={63} from={33} />
      <Eyes y={53} dx={12} />
      <Cheeks y={62} dx={20} />
    </>
  ),
  Deer: () => (
    <>
      <Mirror>
        <path d="M38 31 C36 23 33 18 28 13 M34 22 C30 22 26.5 20 24 16.5" fill="none" stroke="#7A5232" strokeWidth={3.6} strokeLinecap="round" />
        <ellipse cx={22} cy={47} rx={12} ry={6.5} transform="rotate(-25 22 47)" fill="#C8925A" stroke="#9C6A38" strokeWidth={2} />
        <ellipse cx={22.5} cy={47} rx={7} ry={3} transform="rotate(-25 22.5 47)" fill="#F2C8B4" />
      </Mirror>
      <ellipse cx={50} cy={59} rx={24} ry={27} fill="#C8925A" stroke="#9C6A38" strokeWidth={2} />
      <g fill="#F4E2C6">
        <circle cx={44} cy={40} r={2} />
        <circle cx={56} cy={41} r={1.7} />
        <circle cx={50} cy={36} r={1.6} />
      </g>
      <ellipse cx={50} cy={72} rx={12} ry={9.5} fill="#F2DDBF" />
      <ellipse cx={50} cy={68.5} rx={4.6} ry={3.2} fill={INK} />
      <Mouth y={72.5} width={3.4} />
      <Eyes y={55} dx={10} />
      <Cheeks y={64} dx={16} />
    </>
  ),
  Duck: () => (
    <>
      <path d="M48 31 C45 23 49 17 55 16 C52 20 52.5 25 55 30 Z" fill="#F6CF4A" stroke="#D9A520" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={50} cy={57} r={28} fill="#F6CF4A" stroke="#D9A520" strokeWidth={2} />
      <path d="M36 64.5 Q50 57.5 64 64.5 Q63.5 72.5 50 72.5 Q36.5 72.5 36 64.5 Z" fill="#F28A2E" stroke="#CC6A1C" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M41 63.6 Q50 60.2 59 63.6" fill="none" stroke="#F8B26A" strokeWidth={1.8} strokeLinecap="round" />
      <Eyes y={51} dx={12} />
      <Cheeks y={60} dx={20} />
    </>
  ),
  Fox: () => (
    <>
      <Mirror>
        <path d="M23 46 L29 13 L47 31 Z" fill="#E8833A" stroke="#B85E22" strokeWidth={2} strokeLinejoin="round" />
        <path d="M28.5 39 L31.5 22 L40.5 31.5 Z" fill="#4A2E22" />
      </Mirror>
      <path d="M50 30 C70 30 81 43 81 56 C81 70 65 83 50 86 C35 83 19 70 19 56 C19 43 30 30 50 30 Z" fill="#E8833A" stroke="#B85E22" strokeWidth={2} />
      <path d="M20.5 58 C30 59 43 63 50 71 C57 63 70 59 79.5 58 C77 72 63 84 50 85 C37 84 23 72 20.5 58 Z" fill={WHITE} />
      <ellipse cx={50} cy={72} rx={4.6} ry={3.4} fill={INK} />
      <Mouth y={76} width={3.2} />
      <Eyes y={53} dx={12.5} />
      <Cheeks y={64} dx={21} opacity={0.45} />
    </>
  ),
  Frog: () => (
    <>
      <Mirror>
        <circle cx={33} cy={37} r={12.5} fill="#7CBF5C" stroke="#4E8E35" strokeWidth={2} />
      </Mirror>
      <ellipse cx={50} cy={61} rx={33} ry={24} fill="#7CBF5C" stroke="#4E8E35" strokeWidth={2} />
      <Mirror>
        <circle cx={33} cy={37} r={8} fill={WHITE} />
        <circle cx={34} cy={38} r={4.6} fill={INK} />
        <circle cx={35.6} cy={36.2} r={1.5} fill={WHITE} />
      </Mirror>
      <ellipse cx={50} cy={72} rx={18} ry={9} fill="#BFE3A0" />
      <g fill="#3F7A2B">
        <circle cx={46.5} cy={56} r={1.2} />
        <circle cx={53.5} cy={56} r={1.2} />
      </g>
      <path d="M33 63 Q50 76 67 63" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <Cheeks y={62} dx={25} />
    </>
  ),
  Hamster: () => (
    <>
      <Mirror>
        <circle cx={29} cy={35} r={7.5} fill="#E7A55E" stroke="#B97A38" strokeWidth={2} />
        <circle cx={29} cy={35} r={3.8} fill="#F4B4BC" />
      </Mirror>
      <ellipse cx={50} cy={59} rx={32} ry={28} fill="#E7A55E" stroke="#B97A38" strokeWidth={2} />
      <ellipse cx={50} cy={40} rx={4.5} ry={8} fill={WHITE} />
      <path d="M22 66 C22 55 36 53 50 59 C64 53 78 55 78 66 C78 79 65 87 50 87 C35 87 22 79 22 66 Z" fill={WHITE} />
      <ellipse cx={50} cy={62.5} rx={3} ry={2.3} fill="#E5737F" />
      <Mouth y={65.5} width={3.4} />
      <Eyes y={52} dx={12.5} />
      <Cheeks y={65} dx={19} />
    </>
  ),
  Hedgehog: () => (
    <>
      <polygon points={spikes(50, 58, 41, 30, 150, 390, 11)} fill="#7A5A42" stroke="#5A4030" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={50} cy={58} r={31} fill="#7A5A42" />
      <path d="M26 64 C26 48 36 40 50 40 C64 40 74 48 74 64 C74 76 62 85 50 85 C38 85 26 76 26 64 Z" fill="#F0D9B8" stroke="#C9AA82" strokeWidth={2} />
      <circle cx={50} cy={68} r={3.8} fill={INK} />
      <Mouth y={72.5} width={3.2} />
      <Eyes y={59} dx={10} />
      <Cheeks y={67} dx={16} />
    </>
  ),
  Koala: () => (
    <>
      <Mirror>
        <circle cx={25} cy={38} r={15} fill="#A7A9B0" stroke="#7C7E86" strokeWidth={2} />
        <circle cx={26} cy={39} r={9} fill="#EDE9E3" />
      </Mirror>
      <ellipse cx={50} cy={59} rx={28} ry={26} fill="#A7A9B0" stroke="#7C7E86" strokeWidth={2} />
      <ellipse cx={50} cy={62} rx={7} ry={9.5} fill="#4A4044" />
      <ellipse cx={47.6} cy={58.5} rx={1.6} ry={2.4} fill="#7A7076" />
      <path d="M46 75 q4 3 8 0" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Eyes y={53} dx={14} r={3.6} />
      <Cheeks y={64} dx={20} />
    </>
  ),
  Lion: () => (
    <>
      <polygon points={spikes(50, 57, 40, 33, 0, 360, 14)} fill="#C9722E" stroke="#A85A22" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={50} cy={57} r={33} fill="#C9722E" />
      <Mirror>
        <circle cx={31} cy={36} r={7} fill="#F2B85A" stroke="#A85A22" strokeWidth={2} />
        <circle cx={31} cy={36} r={3.4} fill="#E59A6B" />
      </Mirror>
      <circle cx={50} cy={59} r={25} fill="#F2B85A" />
      <ellipse cx={50} cy={68} rx={11.5} ry={8.5} fill="#FBE3B8" />
      <path d="M45.5 62.5 h9 l-4.5 4.5 z" fill="#7A4A2E" stroke="#7A4A2E" strokeWidth={1.4} strokeLinejoin="round" />
      <Mouth y={68.5} width={3.6} />
      <Eyes y={54} dx={10} />
      <Cheeks y={63} dx={16} />
    </>
  ),
  Llama: () => (
    <>
      <Mirror>
        <ellipse cx={35} cy={26} rx={5.5} ry={13} transform="rotate(-16 35 26)" fill="#F1E6D2" stroke="#C9B79A" strokeWidth={2} />
        <ellipse cx={35} cy={27} rx={2.4} ry={8} transform="rotate(-16 35 27)" fill="#E8C3B5" />
      </Mirror>
      <ellipse cx={50} cy={61} rx={22} ry={28} fill="#F1E6D2" stroke="#C9B79A" strokeWidth={2} />
      <g fill="#FBF5EA" stroke="#C9B79A" strokeWidth={1.6}>
        <circle cx={42} cy={36} r={7} />
        <circle cx={58} cy={36} r={7} />
        <circle cx={50} cy={32} r={8} />
      </g>
      <ellipse cx={50} cy={74} rx={13} ry={10} fill="#E6D5BA" />
      <path d="M46.5 71 q3.5 2.5 7 0" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d="M50 72.5 v3 M47 77 q3 2 6 0" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <Eyes y={57} dx={10} />
      <Cheeks y={66} dx={15} />
    </>
  ),
  Mouse: () => (
    <>
      <Mirror>
        <circle cx={26} cy={35} r={15} fill="#B5B0AC" stroke="#8C8682" strokeWidth={2} />
        <circle cx={27} cy={36} r={9.5} fill="#F4B4BC" />
      </Mirror>
      <ellipse cx={50} cy={61} rx={25} ry={24} fill="#B5B0AC" stroke="#8C8682" strokeWidth={2} />
      <ellipse cx={50} cy={70} rx={10} ry={7} fill="#DDD8D3" />
      <circle cx={50} cy={66} r={3.3} fill="#E5737F" />
      <Mouth y={70} width={3.2} />
      <Whiskers y={66} from={36} />
      <Eyes y={57} dx={10} />
      <Cheeks y={65} dx={17} />
    </>
  ),
  Narwhal: () => (
    <>
      <path d="M46.5 35 L53.5 35 L50.7 7 Q50 5 49.3 7 Z" fill="#F3E9D2" stroke="#BFAE86" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M47.3 29 l5.4 -2 M47.9 22.5 l4.4 -1.8 M48.5 16 l3.2 -1.4" stroke="#BFAE86" strokeWidth={1.4} strokeLinecap="round" />
      <ellipse cx={50} cy={62} rx={32} ry={27} fill="#7FA7C9" stroke="#557EA3" strokeWidth={2} />
      <ellipse cx={50} cy={75} rx={21} ry={12} fill="#D9E7F2" />
      <g fill="#557EA3" opacity={0.55}>
        <ellipse cx={34} cy={45} rx={2.4} ry={1.8} />
        <ellipse cx={64} cy={42} rx={2} ry={1.5} />
        <ellipse cx={70} cy={50} rx={2.4} ry={1.8} />
        <ellipse cx={28} cy={53} rx={1.6} ry={1.3} />
      </g>
      <path d="M44 68 q6 5 12 0" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <Eyes y={59} dx={14} />
      <Cheeks y={67} dx={22} />
    </>
  ),
  Octopus: () => (
    <>
      <g fill="#B57BD1" stroke="#8A55A8" strokeWidth={2}>
        <ellipse cx={27} cy={82} rx={7} ry={11} transform="rotate(20 27 82)" />
        <ellipse cx={42} cy={86} rx={6.5} ry={11} transform="rotate(6 42 86)" />
        <ellipse cx={58} cy={86} rx={6.5} ry={11} transform="rotate(-6 58 86)" />
        <ellipse cx={73} cy={82} rx={7} ry={11} transform="rotate(-20 73 82)" />
      </g>
      <path d="M21 62 C21 36 34 23 50 23 C66 23 79 36 79 62 C79 73 66 80 50 80 C34 80 21 73 21 62 Z" fill="#B57BD1" stroke="#8A55A8" strokeWidth={2} />
      <g fill="#D7B3E8">
        <circle cx={38} cy={36} r={3} />
        <circle cx={46} cy={31} r={2} />
        <circle cx={63} cy={36} r={2.4} />
        <circle cx={26} cy={86} r={1.6} />
        <circle cx={42} cy={90} r={1.6} />
        <circle cx={58} cy={90} r={1.6} />
        <circle cx={74} cy={86} r={1.6} />
      </g>
      <path d="M44 66 q6 5 12 0" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <Eyes y={56} dx={11} />
      <Cheeks y={64} dx={19} />
    </>
  ),
  Otter: () => (
    <>
      <Mirror>
        <circle cx={22} cy={50} r={6} fill="#7B563B" stroke="#5A3D29" strokeWidth={2} />
        <circle cx={22} cy={50} r={2.6} fill="#C99E86" />
      </Mirror>
      <ellipse cx={50} cy={61} rx={31} ry={24} fill="#7B563B" stroke="#5A3D29" strokeWidth={2} />
      <path d="M21 63 C24 52 36 49 50 55 C64 49 76 52 79 63 C77 76 64 84 50 84 C36 84 23 76 21 63 Z" fill="#EAD5B8" />
      <ellipse cx={50} cy={62.5} rx={6} ry={4} fill={INK} />
      <path d="M50 66.5 v2.5" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Mouth y={69} width={3.6} />
      <Whiskers y={65} from={38} colour="#5A3D29" />
      <Eyes y={52} dx={12} />
      <Cheeks y={66} dx={22} />
    </>
  ),
  Owl: () => (
    <>
      <Mirror>
        <path d="M23 40 L21 15 L40 29 Z" fill="#9B6B43" stroke="#6E4A2C" strokeWidth={2} strokeLinejoin="round" />
      </Mirror>
      <ellipse cx={50} cy={59} rx={30} ry={29} fill="#9B6B43" stroke="#6E4A2C" strokeWidth={2} />
      <Mirror>
        <circle cx={38} cy={53} r={12.5} fill="#EBD5B3" />
        <circle cx={38} cy={53} r={7.2} fill="#F4B740" />
        <circle cx={38.5} cy={53.5} r={4.6} fill={INK} />
        <circle cx={40} cy={51.8} r={1.5} fill={WHITE} />
      </Mirror>
      <path d="M45.5 62 L54.5 62 L50 71 Z" fill="#E8913A" stroke="#C26F22" strokeWidth={1.4} strokeLinejoin="round" />
      <g fill="none" stroke="#6E4A2C" strokeWidth={1.6} strokeLinecap="round" opacity={0.7}>
        <path d="M38 78 q3 3 6 0 M47 81 q3 3 6 0 M56 78 q3 3 6 0" />
      </g>
    </>
  ),
  Panda: () => (
    <>
      <Mirror>
        <circle cx={28} cy={32} r={10} fill={INK} />
      </Mirror>
      <circle cx={50} cy={57} r={29} fill={WHITE} stroke="#CFC8BE" strokeWidth={2} />
      <Mirror>
        <ellipse cx={38} cy={53} rx={7.5} ry={9.5} transform="rotate(30 38 53)" fill={INK} />
      </Mirror>
      <RingedEyes y={52} dx={11.5} />
      <ellipse cx={50} cy={63.5} rx={4.6} ry={3.2} fill={INK} />
      <path d="M50 66.5 v2.5" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Mouth y={69} width={3.6} />
      <Cheeks y={64} dx={19} />
    </>
  ),
  Penguin: () => (
    <>
      <circle cx={50} cy={57} r={31} fill="#2F3440" stroke="#1E222B" strokeWidth={2} />
      <path d="M50 45 C44 34 25 36 25 55 C25 71 37 83 50 83 C63 83 75 71 75 55 C75 36 56 34 50 45 Z" fill={WHITE} />
      <path d="M43.5 62 Q50 57.5 56.5 62 Q50 70 43.5 62 Z" fill="#F29A38" stroke="#D27A1E" strokeWidth={1.4} strokeLinejoin="round" />
      <Eyes y={54} dx={11} />
      <Cheeks y={64} dx={17} />
    </>
  ),
  Puffin: () => (
    <>
      <circle cx={50} cy={56} r={31} fill="#2F3440" stroke="#1E222B" strokeWidth={2} />
      <path d="M27 56 C27 42 73 42 73 56 C73 73 63 84 50 84 C37 84 27 73 27 56 Z" fill={WHITE} />
      <Mirror>
        <path d="M34.5 47.5 l4.5 -3 l3 3.2 z" fill="#8A93A3" />
      </Mirror>
      <path d="M41.5 59 Q50 54.5 58.5 59 L54.5 76 Q50 80.5 45.5 76 Z" fill="#F07A33" stroke="#C85A1C" strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M41.7 59.6 Q50 55.2 58.3 59.6 L57.3 64 Q50 60.6 42.7 64 Z" fill="#6D7B8C" />
      <path d="M44.6 70 Q50 67.4 55.4 70 L54.9 72.6 Q50 70.2 45.1 72.6 Z" fill="#F6C94A" />
      <Eyes y={53} dx={11} />
      <Cheeks y={64} dx={18} />
    </>
  ),
  Rabbit: () => (
    <>
      <Mirror>
        <ellipse cx={38} cy={25} rx={8} ry={20} transform="rotate(-8 38 25)" fill="#F2EEE8" stroke="#C9BFB3" strokeWidth={2} />
        <ellipse cx={38} cy={27} rx={3.8} ry={14} transform="rotate(-8 38 27)" fill="#F6B5BE" />
      </Mirror>
      <circle cx={50} cy={61} r={27} fill="#F2EEE8" stroke="#C9BFB3" strokeWidth={2} />
      <path d="M46.8 64 h6.4 l-3.2 3.2 z" fill="#E5737F" stroke="#E5737F" strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M50 67.2 v2" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <rect x={47.4} y={69.2} width={5.2} height={4.6} rx={1} fill={WHITE} stroke="#C9BFB3" strokeWidth={1.2} />
      <path d="M50 69.4 v4.2" stroke="#C9BFB3" strokeWidth={1} />
      <Eyes y={57} dx={11} />
      <Cheeks y={65} dx={18} />
    </>
  ),
  Raccoon: () => (
    <>
      <Mirror>
        <path d="M23 44 L27 17 L45 31 Z" fill="#9EA0A6" stroke="#6D6F76" strokeWidth={2} strokeLinejoin="round" />
        <path d="M28 38 L30 24 L39 31 Z" fill="#4A4044" />
      </Mirror>
      <ellipse cx={50} cy={59} rx={30} ry={27} fill="#9EA0A6" stroke="#6D6F76" strokeWidth={2} />
      <ellipse cx={50} cy={68} rx={16} ry={12} fill={WHITE} />
      <Mirror>
        <ellipse cx={37} cy={43.5} rx={8.5} ry={3.4} fill={WHITE} />
      </Mirror>
      <path d="M20 55 C24 46 40 46 47 54 L50 57 L53 54 C60 46 76 46 80 55 C76 63 62 63 54 59 L50 61 L46 59 C38 63 24 63 20 55 Z" fill={INK} />
      <RingedEyes y={54} dx={13} />
      <ellipse cx={50} cy={65} rx={4.4} ry={3.1} fill={INK} />
      <Mouth y={69} width={3.4} />
      <Cheeks y={68} dx={19} opacity={0.45} />
    </>
  ),
  Seal: () => (
    <>
      <ellipse cx={50} cy={59} rx={31} ry={28} fill="#B7C0C9" stroke="#8C97A3" strokeWidth={2} />
      <Mirror>
        <ellipse cx={44.5} cy={67} rx={7.2} ry={5.6} fill="#E2E7EC" />
        <circle cx={42} cy={66} r={0.9} fill="#6E7884" />
        <circle cx={44.5} cy={69} r={0.9} fill="#6E7884" />
        <circle cx={47} cy={66.5} r={0.9} fill="#6E7884" />
      </Mirror>
      <ellipse cx={50} cy={62} rx={4.4} ry={3.2} fill={INK} />
      <path d="M47 72.5 q3 2.4 6 0" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Eyes y={51} dx={13} r={5.2} />
      <Cheeks y={62} dx={22} />
    </>
  ),
  Tiger: () => (
    <>
      <Mirror>
        <circle cx={27} cy={34} r={9} fill="#EE8E3A" stroke="#B65E1E" strokeWidth={2} />
        <circle cx={27} cy={34} r={4.5} fill={WHITE} />
      </Mirror>
      <ellipse cx={50} cy={58} rx={31} ry={28} fill="#EE8E3A" stroke="#B65E1E" strokeWidth={2} />
      <g stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M50 31 v8 M42 32 l2 6.5 M58 32 l-2 6.5" />
        <path d="M20 53 h8 M21 61 l7.5 -1.5 M80 53 h-8 M79 61 l-7.5 -1.5" />
      </g>
      <Mirror>
        <ellipse cx={44} cy={68} rx={8.5} ry={6.8} fill={WHITE} />
      </Mirror>
      <ellipse cx={50} cy={62.5} rx={4.4} ry={3.2} fill="#D96B6B" />
      <path d="M50 65.5 v2.5" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Mouth y={68} width={3.4} />
      <Eyes y={51} dx={12} />
    </>
  ),
};

/** The avatar for a nickname. A name that is not one of ours gets an animal picked from its letters. */
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const clip = useId();
  const parts = nicknameParts(name);
  const animal = parts?.animal ?? NICKNAME_ANIMALS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % NICKNAME_ANIMALS.length];
  const background = parts ? AVATAR_COLOURS[parts.colour] : "#E8E2D5";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <clipPath id={clip}>
        <circle cx={50} cy={50} r={50} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect width={100} height={100} fill={background} />
        <circle cx={50} cy={112} r={40} fill="#FFFFFF" opacity={0.18} />
        {ANIMALS[animal]()}
      </g>
    </svg>
  );
}

/** A few of the avatars, as a greeting on the teacher's and the students' first screens. */
export function AvatarParade({ size = 44 }: { size?: number }) {
  const names = ["Amber Fox", "Mint Panda", "Lilac Owl", "Coral Otter", "Blue Penguin", "Lemon Frog"];
  return (
    <span className="flex -space-x-2" aria-hidden="true">
      {names.map((name, i) => (
        <span key={name} className="quiz-pop rounded-[999px] ring-4 ring-[color:var(--quiz-paper)]" style={{ animationDelay: `${i * 70}ms` }}>
          <Avatar name={name} size={size} />
        </span>
      ))}
    </span>
  );
}
