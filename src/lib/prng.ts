/**
 * Mulberry32 — a simple, fast, deterministic PRNG.
 * Same seed always produces the same sequence.
 */
export function createSeededRNG(seed: number) {
  let state = seed | 0;

  function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function nextGaussian(): number {
    // Box-Muller transform
    const u1 = next() || 0.0001; // Avoid 0 to prevent NaN in log
    const u2 = next();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  return { next, nextInt, nextGaussian };
}
