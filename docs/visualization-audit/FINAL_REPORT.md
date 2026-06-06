# Interactive Diagram Audit Report

## Executive Summary

The audit infrastructure covers all 40 curriculum diagrams. Routing is now registry-backed, the stale `instance-based-trees` visualization key is reconciled to the canonical `decision-trees` module, and unknown IDs render explicit error UI. Every registered diagram has a named visual, finite default output, and named native controls.

Six diagrams currently meet the plan's strict independent numerical-oracle requirement: Linear Regression, Logistic Regression, PCA, Evaluation Metrics, CNN, and Computer Vision. The remaining 34 are retained as useful diagrams but remain in REMEDIATION with S3 test-coverage defects. They are not represented as mathematically verified merely because they render.

## Score And Disposition Summary
- Total diagrams: 40
- VERIFIED / KEEP: 6
- REMEDIATION / REFINE: 34
- REWORK, REPLACE, or REMOVE: 0
- Open S1 defects: 0
- Open S2 defects: 0
- Open S3 defects: 34

The complete score table is maintained in [AUDIT_REGISTER.md](AUDIT_REGISTER.md).

## Accuracy Methods
- Exact deterministic display assertions for regression, classification, convolution, confusion-matrix metrics, and PCA.
- Seeded PRNG infrastructure for stochastic diagrams.
- Default finite-output checks across all diagrams.
- Registry completeness checks against all `LearningModule` records.

## Accessibility And Responsive Results
- All 40 diagrams expose a registry-backed accessible visual name.
- Default-state native controls have accessible names.
- Cypress crawls all 40 routes at the default desktop viewport and checks the
  Calculus route at 360px.
- Full desktop, tablet, landscape, and mobile captures remain pending S3
  evidence work.

## Test Coverage Change
- Before: the router test covered 26 hand-listed diagrams and unknown IDs silently showed Linear Regression.
- After: registry tests cover all 40 schema modules, unknown IDs show an alert, and all diagrams share finite-output, named-visual, named-control, and responsive browser checks.

## Remaining Limitations
- Thirty-four diagrams still need independent default, interior, boundary, preset, and reset numerical or state-transition oracles.
- Screenshot evidence confirms layout and state capture, not mathematical correctness.
- Manual keyboard-only, reduced-motion, and 200% zoom evidence should be added per dossier as each S3 oracle task is closed.

## Validation

- `npm run lint`: passed.
- `npm run test -- --reporter=dot`: 16 files and 8,367 tests passed.
- `npm run build`: passed; 55 static pages generated, including all 40 module routes.
- Cypress against the fresh static export: 9 specs and 30 tests passed.
