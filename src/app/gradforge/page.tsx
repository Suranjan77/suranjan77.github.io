import type { Metadata } from "next";
import Link from "next/link";
import GradForgeLab from "@/components/ui/GradForgeLab";

export const metadata: Metadata = {
  title: "GradForge Autograd Lab",
  description:
    "Build a mini Python autograd engine, explore computation graphs, and step through reverse-mode gradients in the browser.",
};

const workflow = [
  ["01", "Choose a graph", "Start with a guided expression that isolates multiplication, branching, activation functions, or gradient accumulation."],
  ["02", "Trace execution", "Move through the forward pass, topological ordering, loss seed, and reverse pass one operation at a time."],
  ["03", "Inspect the chain rule", "Select any node to compare its value, local derivative, incoming gradient, and contribution to its parents."],
  ["04", "Edit the engine", "Change the Python expression, run a custom trace, and verify the analytical result against finite differences."],
] as const;

const concepts = [
  ["Computation graph", "Every scalar value records the operation and parent values that created it."],
  ["Reverse-mode autodiff", "A topological traversal applies local derivative rules from the output back to every dependency."],
  ["Gradient checking", "Finite differences provide an independent numerical check for the gradients produced by the engine."],
] as const;

export default function GradForgePage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant"
          >
            <Link href="/" className="transition-colors hover:text-primary">Home</Link>
            <span className="text-outline-dark">/</span>
            <Link href="/algorithms/backpropagation" className="transition-colors hover:text-primary">
              Backpropagation
            </Link>
            <span className="text-outline-dark">/</span>
            <span className="text-primary">GradForge</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,570px)_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-primary">
                  Interactive Laboratory
                </p>
                <span className="border border-outline bg-surface-container-high px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                  Modern AI Track
                </span>
              </div>
              <h1 className="mt-4 text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
                GradForge
              </h1>
              <p className="mt-5 max-w-xl font-headline text-2xl leading-snug text-on-surface">
                Build backpropagation from scalar operations.
              </p>
              <p className="mt-5 text-base font-medium leading-8 text-on-surface-variant">
                A practical companion to the Backpropagation module. Write a
                small Python expression, inspect its computation graph, and
                follow every gradient contribution through reverse-mode
                automatic differentiation.
              </p>
            </div>

            <div className="grid border border-outline bg-border sm:grid-cols-3">
              {[
                ["Format", "Guided lab"],
                ["Engine", "Scalar autodiff"],
                ["Prerequisite", "Backpropagation"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-outline bg-surface px-5 py-7 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
                  <p className="mt-2 font-headline text-xl font-medium text-on-surface">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-outline px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px] border border-outline bg-surface">
          <div className="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="font-headline text-xl font-medium text-on-surface">Autograd Workspace</h2>
              <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Code · graph · reverse pass · verification
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/algorithms/backpropagation"
                className="border border-outline bg-surface-container px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                Read Backpropagation
              </Link>
              <Link
                href="/playground"
                className="border border-outline bg-surface px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                Neural Playground
              </Link>
            </div>
          </div>
          <div className="p-3 sm:p-5 lg:p-6">
            <GradForgeLab />
          </div>
        </div>
      </section>

      <section className="border-b border-outline px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-primary">Lab workflow</p>
              <h2 className="mt-3 font-headline text-4xl font-medium text-on-surface">
                From expression to gradient
              </h2>
            </div>
            <p className="max-w-md text-sm font-medium leading-7 text-on-surface-variant">
              Follow the sequence once with a preset before editing the Python
              expression or changing the mathematical detail level.
            </p>
          </div>
          <div className="grid gap-px border border-outline bg-border sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map(([step, title, description]) => (
              <article key={step} className="bg-surface p-6">
                <p className="font-mono text-[13px] text-on-surface-variant">{step}</p>
                <h3 className="mt-8 font-headline text-xl font-medium text-on-surface">{title}</h3>
                <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-px border border-outline bg-border lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-primary p-7 text-on-primary sm:p-9">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-primary/70">
              Curriculum connection
            </p>
            <h2 className="mt-4 font-headline text-3xl font-medium leading-tight">
              Theory first, then inspect the machinery.
            </h2>
            <p className="mt-5 text-sm font-medium leading-7 text-on-primary/80">
              The Backpropagation lesson develops the chain rule and
              vector-Jacobian product formally. GradForge turns those ideas
              into an executable scalar engine.
            </p>
            <Link
              href="/algorithms/backpropagation"
              className="mt-7 inline-flex border border-on-primary/50 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors hover:bg-on-primary hover:text-primary"
            >
              Open the lesson →
            </Link>
          </div>
          <div className="grid bg-border sm:grid-cols-3">
            {concepts.map(([title, description]) => (
              <article
                key={title}
                className="border-b border-outline bg-surface p-6 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <h3 className="font-headline text-xl font-medium text-on-surface">{title}</h3>
                <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
