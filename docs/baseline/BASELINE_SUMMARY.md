# Baseline Summary

**Date Taken:** 2026-06-06
**OS:** Linux

## Build Baseline
- **Command:** `npm run build`
- **Result:** Successfully compiled (0 errors, 0 warnings).
- **Paths generated:** 33 static pages (dynamic routes for 24 paths + other root routes).

## Lint Baseline
- **Command:** `npm run lint`
- **Result:** Failed (Exit Code 1)
- **Total Problems:** 79 problems (15 errors, 64 warnings).
- **Primary issues:**
  - Conditionally called hooks (`useState` in `D3Visualization.tsx`)
  - Impure function calls during render (`Math.random()` in `LLMViz.tsx`)
  - Unused variables/imports across visualizer files
  - Missing dependency arrays in `useEffect` hooks
  - Variable accessed before declaration (`spawnConfetti` in `KMeansViz.tsx`)

## Test Baseline
- **Command:** `npm run test`
- **Result:** Passed (9 test files, 5095 tests passed, 0 failed, 0 skipped).
- **Test files:**
  - `useAnimationEngine.test.tsx`
  - `visualizationPrimitives.test.tsx`
  - `algorithms.test.ts`
  - `CurriculumExplorer.test.tsx`
  - `VisualizationAlgorithmAccuracy.test.tsx`
  - `AlgorithmSimulator.test.tsx`
  - `GradForgeLab.test.tsx`
  - `D3Visualization.test.tsx`
  - `VisualizationInteractions.test.tsx`
