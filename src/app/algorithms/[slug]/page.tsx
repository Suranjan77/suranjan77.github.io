import { notFound } from "next/navigation";
import { algorithms } from "@/data/algorithms";
import CodeBlock from "@/components/ui/CodeBlock";
import AlgorithmVisualization from "@/components/ui/AlgorithmVisualization";
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const algorithm = algorithms.find(a => a.id === resolvedParams.slug);
  return {
    title: algorithm ? `${algorithm.title} - ML Learn` : 'Algorithm Not Found'
  };
}

export default async function AlgorithmPage({ params }: PageProps) {
  const resolvedParams = await params;
  const algorithm = algorithms.find(a => a.id === resolvedParams.slug);

  if (!algorithm) {
    notFound();
  }

  return (
    <div className="p-12 relative overflow-hidden">
      <div className="neural-glow top-20 left-40"></div>
      <div className="neural-glow bottom-40 right-20 bg-tertiary/5"></div>

      {/* Header Section */}
      <section className="max-w-5xl mx-auto mb-16">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
          {algorithm.category} Learning
        </div>
        <h2 className="font-headline text-6xl font-bold tracking-tighter text-on-surface mb-6">
          {algorithm.title}
        </h2>
        <p className="text-xl text-on-surface-variant leading-relaxed max-w-3xl">
          {algorithm.fullDescription}
        </p>
      </section>

      {/* Bento Grid Content */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Intuition Section (Wide) */}
        <div className="md:col-span-8 glass-card p-8 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-tertiary">
              <span className="material-symbols-outlined">lightbulb</span>
              <h3 className="font-headline text-2xl font-semibold">Real-World Intuition</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              {algorithm.intuition}
            </p>
            <div className="mt-8 flex justify-center h-64">
              <AlgorithmVisualization algorithmId={algorithm.id} />
            </div>
          </div>
        </div>

        {/* Math Section (Narrow/Tall) */}
        <div className="md:col-span-4 bg-surface-container-high p-8 rounded-xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <span className="material-symbols-outlined">functions</span>
            <h3 className="font-headline text-xl font-semibold">The Logic</h3>
          </div>
          <div className="prose prose-invert max-w-none text-on-surface-variant">
            <ReactMarkdown 
              remarkPlugins={[remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {algorithm.mathematics}
            </ReactMarkdown>
          </div>
        </div>

        {/* Code Block (Full Width) */}
        <div className="md:col-span-12">
           <CodeBlock code={algorithm.codeSnippet} />
        </div>

        {/* Pros & Cons */}
        <div className="md:col-span-6 rounded-xl overflow-hidden group">
          <div className="p-8 bg-gradient-to-br from-primary/20 to-surface-container h-full border border-primary/10 transition-transform duration-500 group-hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface">Strengths</h3>
            </div>
            <ul className="space-y-4">
              {algorithm.pros.map((pro, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="text-primary mt-1 material-symbols-outlined text-sm">arrow_forward</span>
                  <span className="text-on-surface-variant">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-6 rounded-xl overflow-hidden group">
          <div className="p-8 bg-gradient-to-br from-error/10 to-surface-container h-full border border-error/10 transition-transform duration-500 group-hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface">Limitations</h3>
            </div>
            <ul className="space-y-4">
              {algorithm.cons.map((con, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="text-error mt-1 material-symbols-outlined text-sm">close</span>
                  <span className="text-on-surface-variant">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Spacing */}
      <footer className="max-w-5xl mx-auto mt-24 pt-8 border-t border-outline-variant/10 text-on-surface-variant flex justify-between items-center text-sm">
        <p>© 2026 The Digital Observatory</p>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="hover:text-primary transition-colors" href="#">API Reference</a>
        </div>
      </footer>
    </div>
  );
}
