# ML Learn

ML Learn is an interactive machine learning curriculum that connects visual
intuition, model behavior, and implementation-oriented explanations. It
currently includes 29 modules across two guided tracks.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run test
npm run lint
npm run build
npm run test:e2e
```

`test:e2e` builds the static export, serves the generated `out/` artifact, and
runs the Cypress browser suite against the production-equivalent output.

## Project Structure

- `src/data/algorithms_content/`: typed lesson content and the module registry.
- `src/components/ui/visualizations/`: interactive module visualizations.
- `src/components/lesson/`: reusable lesson-page sections and navigation.
- `src/app/`: Next.js pages, route metadata, sitemap, and track pages.
- `cypress/e2e/`: end-to-end coverage for core learner journeys.

## Add A Module

1. Create a typed `LearningModule` file in `src/data/algorithms_content/`.
2. Export it from `src/data/algorithms_content/index.ts`.
3. Add or reuse an appropriate category and learning track.
4. Create the visualization component in
   `src/components/ui/visualizations/`.
5. Register the visualization in `D3Visualization.tsx`.
6. Run the full validation commands above.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, D3, Framer Motion, KaTeX,
Vitest, Testing Library, and Cypress.
