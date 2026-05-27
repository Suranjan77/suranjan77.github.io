import type { Metadata } from "next";
import Link from "next/link";
import GradForgeLab from "@/components/ui/GradForgeLab";

export const metadata: Metadata = {
  title: "GradForge Autograd Lab",
  description:
    "Build a tiny Rust-style autograd engine, inspect computation graphs, and step through reverse-mode gradients in the browser.",
};

const promises = [
  ["Graph", "Forward values, local derivatives, topological order, and backward flow stay synchronized."],
  ["Rust", "Arena NodeId design, ownership notes, and backward rules are taught beside the trace."],
  ["Maths", "Every gradient can be inspected through path contributions and chain-rule expansion."],
] as const;

export default function GradForgePage() {
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
              Interactive Rust Autograd Lab
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                GradForge
              </p>
              <h1 className="mt-4 text-balance font-headline text-5xl font-medium leading-tight text-on-surface sm:text-6xl">
                Build Autograd from Scratch in Rust.
              </h1>
              <p className="mt-7 text-base font-medium leading-8 text-on-surface-variant">
                A visual debugger and executable textbook for reverse-mode
                automatic differentiation. Write Rust-shaped graph code, step
                through the backward pass, and ask why each gradient has the
                value it has.
              </p>
            </div>

            <div className="grid border border-outline bg-border sm:grid-cols-3">
              {promises.map(([label, text]) => (
                <article
                  key={label}
                  className="border-b border-outline bg-surface p-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {label}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6 text-on-surface-variant">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <GradForgeLab />
        </div>
      </section>
    </div>
  );
}
