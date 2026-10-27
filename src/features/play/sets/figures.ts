import type { QuizImage } from "../types";
import sizes from "./figure-sizes.json";

/**
 * Pictures for one course, rendered from scripts/play-figures/<folder>.html
 * to public/play/<folder>/<name>.png by scripts/render-play-figures.mjs.
 */
export function figuresFrom(folder: string) {
  return function figure(name: string, alt: string): QuizImage {
    const key = `${folder}/${name}`;
    const size = (sizes as Record<string, number[]>)[key];
    if (!size) throw new Error(`No rendered figure "${key}". Run node scripts/render-play-figures.mjs.`);
    return { src: `/play/${key}.png`, alt, width: size[0], height: size[1] };
  };
}
