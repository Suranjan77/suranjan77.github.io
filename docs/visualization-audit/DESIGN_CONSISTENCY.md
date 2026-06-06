# Diagram Design Consistency Contract

## Structure
- Wrap every diagram in `VisualizationShell`.
- Present title, explanatory subtitle, plot or scenario, controls, and a final key insight in that order.
- Use a single-column layout below the large breakpoint and keep the explanatory visual before controls.

## Controls
- Every input, select, and button has a visible label or accessible name.
- Sliders expose current value, units, minimum meaning, and maximum meaning.
- Stepper controls have bounded previous/next behavior and a reset action.
- Reset restores the documented initial state; disabled actions remain visibly and programmatically disabled.

## Visuals
- SVG and non-SVG visual models use `role="img"` with a registry-backed unique accessible label.
- Meaning is not encoded by color alone; labels, shape, position, or text provide a second cue.
- Displayed numeric output must remain finite and use precision appropriate to the concept.
- Illustrative and toy outputs must say so in nearby copy.

## Motion And Responsive Behavior
- Animation must not own mathematical state and must stop cleanly on unmount.
- Reduced motion preserves all explanatory states without requiring playback.
- Required audit viewports are 360x800, 768x1024, 1024x768, and 1440x900.
- Page-level horizontal overflow, clipped controls, and hidden labels are release failures.

## Errors
- Unknown module IDs render a named alert.
- A missing registry entry must fail the registry completeness test and must never render an unrelated diagram.
