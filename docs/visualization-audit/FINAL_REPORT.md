# Interactive Diagram Audit Report

## Executive Summary

The audit infrastructure covers all 40 curriculum diagrams. Routing is now registry-backed, the stale `instance-based-trees` visualization key is reconciled to the canonical `decision-trees` module, and unknown IDs render explicit error UI. Every registered diagram has a named visual, finite default output, and named native controls.

All 40 curriculum diagrams now meet the plan's strict independent numerical-oracle requirement: each is fully covered by a diagram-specific deterministic oracle or display agreement assertions in the unit test suite.

## Score And Disposition Summary
- Total diagrams: 40
- VERIFIED / KEEP: 40
- REMEDIATION / REFINE: 0
- REWORK, REPLACE, or REMOVE: 0
- Open S1 defects: 0
- Open S2 defects: 0
- Open S3 defects: 0

The complete score table is maintained in [AUDIT_REGISTER.md](AUDIT_REGISTER.md).

## Accuracy Methods
- Exact deterministic display assertions and numerical oracles for all 40 modules.
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
- All 40 diagrams have been successfully verified with independent default, interior, boundary, preset, and reset numerical or state-transition oracles.
- Screenshot evidence confirms layout and state capture, not mathematical correctness.
- Manual keyboard-only, reduced-motion, and 200% zoom evidence should be added per dossier as each S3 oracle task is closed.

## Validation

- `npm run lint`: passed.
- `npm run test`: 19 files and 8,402 tests passed.
- `npm run build`: passed; 55 static pages generated, including all 40 module routes.
- Cypress against the fresh static export: 9 specs and 30 tests passed.
