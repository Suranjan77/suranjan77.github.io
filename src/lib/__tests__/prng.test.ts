import { describe, it, expect } from 'vitest';
import { createSeededRNG } from '../prng';

describe('Seeded PRNG', () => {
  it('same seed produces same sequence', () => {
    const rng1 = createSeededRNG(42);
    const rng2 = createSeededRNG(42);
    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = createSeededRNG(42);
    const rng2 = createSeededRNG(99);
    // At least one of the first 10 values should differ
    let allSame = true;
    for (let i = 0; i < 10; i++) {
      if (rng1.next() !== rng2.next()) allSame = false;
    }
    expect(allSame).toBe(false);
  });

  it('nextInt stays within bounds', () => {
    const rng = createSeededRNG(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('next() produces values in [0, 1)', () => {
    const rng = createSeededRNG(7);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});
