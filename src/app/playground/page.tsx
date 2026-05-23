import type { Metadata } from "next";
import Link from "next/link";
import AlgorithmSimulator from "@/components/ui/AlgorithmSimulator";

export const metadata: Metadata = {
  title: "Neural Network Playground",
  description:
    "Build classification datasets, tune model settings, and watch a neural network learn a decision boundary in real time.",
};

const guidelines = [
  ["01", "Establish Data Points", "Plot samples on the canvas and alternate between Class A and Class B. Keep at least one point from each class."],
  ["02", "Select a Preset", "Load Linear, XOR, or Rings to inspect how geometry changes the boundary the network must learn."],
  ["03", "Configure and Train", "Adjust hidden units, learning rate, and regularisation, then run training to observe the fitted surface."],
  ["04", "Analyse the Output", "Read loss, accuracy, and weight magnitude together. The contour marks the region where the model is uncertain."],
] as const;

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="border border-outline bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface hover:border-primary hover:text-primary"
            >
              Back
            </Link>
            <div className="border border-outline bg-surface-container-high px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Interactive Laboratory
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-center">
            <div>
              <h1 className="text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
                Neural Network Playground
              </h1>
              <p className="mt-7 text-base font-medium leading-8 text-on-surface-variant">
                Construct a classification dataset, adjust model hyperparameters, and observe a neural network deduce a decision boundary in your browser.
              </p>
            </div>
            <div className="grid border border-outline bg-border sm:grid-cols-3">
              {[
                ["Model", "2 → H → 1"],
                ["Method", "Backprop"],
                ["Task", "Binary"],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-outline bg-surface px-5 py-7 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">{label}</p>
                  <p className="mt-2 font-headline text-2xl font-medium text-on-surface">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-outline px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px] border border-outline bg-surface">
          <div className="flex flex-col gap-3 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <span className="font-headline text-xl font-medium text-on-surface">
                Playground Environment
              </span>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Interactive Neural Network Canvas
              </p>
            </div>
            <Link
              href="/algorithms/neural-networks"
              className="border border-outline bg-surface-container px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface hover:border-primary hover:text-primary"
            >
              Read Theory
            </Link>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <AlgorithmSimulator />
          </div>
        </div>
      </section>

      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <h2 className="mb-8 font-headline text-4xl font-medium text-on-surface">
            Operating Notes
          </h2>
          <div className="grid gap-px border border-outline bg-border sm:grid-cols-2 lg:grid-cols-4">
            {guidelines.map(([step, title, description]) => (
              <article key={step} className="bg-surface p-6">
                <div className="mb-8 font-mono text-[11px] text-on-surface-variant">{step}</div>
                <h3 className="font-headline text-xl font-medium text-on-surface">{title}</h3>
                <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-px border border-outline bg-border lg:grid-cols-2">
          <article className="bg-surface p-7">
            <h3 className="font-headline text-2xl font-medium text-on-surface">Architecture</h3>
            <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">
              The simulator runs a single-hidden-layer perceptron. Inputs are normalized canvas coordinates, hidden units use tanh, and the output sigmoid represents the probability of Class B.
            </p>
            <div className="crop-marks relative mt-6 border border-outline bg-surface-container-lowest px-4 py-4 font-mono text-sm leading-7 text-on-surface">
              <div>Hidden: z = W1·x + b1, a = tanh(z)</div>
              <div>Output: y_hat = sigmoid(w2^T·a + b2)</div>
            </div>
          </article>

          <article className="bg-surface p-7">
            <h3 className="font-headline text-2xl font-medium text-on-surface">Training Loop</h3>
            <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">
              Each training step performs full-batch gradient descent against binary cross-entropy and adds L2 regularisation to discourage unnecessarily large weights.
            </p>
            <div className="crop-marks relative mt-6 border border-outline bg-surface-container-lowest px-4 py-4 font-mono text-sm leading-7 text-primary">
              L = -(1/n) sum [y log(y_hat) + (1-y) log(1-y_hat)]
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
