import Link from "next/link";
import AlgorithmCard from "@/components/ui/AlgorithmCard";
import AlgorithmSimulator from "@/components/ui/AlgorithmSimulator";
import { algorithms } from "@/data/algorithms";

export default function Home() {
  const coreAlgorithms = algorithms.filter(a => ['linear-regression', 'decision-trees', 'k-means'].includes(a.id));
  const otherAlgorithms = algorithms.filter(a => !['linear-regression', 'decision-trees', 'k-means'].includes(a.id));

  const getColor = (category: string): "primary" | "secondary" | "tertiary" => {
    switch (category) {
      case 'Supervised': return 'primary';
      case 'Unsupervised': return 'secondary';
      case 'Deep Learning': return 'tertiary';
      default: return 'primary';
    }
  };

  const getIcon = (id: string): string => {
    switch (id) {
      case 'linear-regression': return 'show_chart';
      case 'logistic-regression': return 'leaderboard';
      case 'decision-trees': return 'account_tree';
      case 'k-means': return 'bubble_chart';
      case 'support-vector-machines': return 'shield';
      case 'random-forests': return 'forest';
      case 'neural-networks': return 'hub';
      default: return 'data_object';
    }
  };

  const getFormula = (math: string): string => {
     const match = math.match(/\$\$ (.*?) \$\$/);
     return match ? match[1] : 'f(x) = ...';
  };

  return (
    <div className="hero-gradient min-h-screen">
      {/* Hero Section */}
      <section className="px-12 py-24 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Now Enrolling: Advanced Neural Architectures
          </div>
          <h2 className="font-headline text-6xl md:text-7xl font-bold text-on-surface leading-[1.1] tracking-tight mb-8">
            Understand AI, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Mathematically</span> & Intuitively
          </h2>
          <p className="text-on-surface-variant text-xl max-w-2xl leading-relaxed mb-12">
            Peer into the black box of machine learning with interactive visualizations,
            rigorous mathematical derivations, and hands-on laboratory environments.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-lg shadow-primary/20">
              Start Learning
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="px-8 py-4 rounded-lg bg-surface-container-high text-on-surface font-semibold text-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
              Explore Curriculum
            </button>
          </div>
        </div>
      </section>

      {/* Algorithm Bento Grid */}
      <section className="px-12 pb-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="font-headline text-3xl font-bold text-slate-50 mb-2">Core Foundations</h3>
            <p className="text-slate-400">Master the fundamental algorithms powering modern intelligence.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-surface-container-low border border-outline-variant/20 text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 rounded-full bg-surface-container-low border border-outline-variant/20 text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algo) => (
            <AlgorithmCard
              key={algo.id}
              title={algo.title}
              description={algo.shortDescription}
              formula={getFormula(algo.mathematics)}
              icon={getIcon(algo.id)}
              slug={algo.id}
              color={getColor(algo.category)}
            />
          ))}
        </div>
      </section>

      {/* Technical Demo Section */}
      <section className="px-12 pb-32">
        <div className="bg-surface-container rounded-3xl overflow-hidden border border-white/5 flex flex-col lg:flex-row shadow-2xl min-h-[600px]">
          <div className="lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
            <h3 className="font-headline text-4xl font-bold text-slate-50 mb-6">Interactive Neural Playground</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Adjust hyperparameters in real-time and watch the decision boundaries shift.
              Our built-in simulator runs on WebGL, giving you near-native performance for
              training models directly in your browser.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Real-time GPU accelerated training
              </li>
              <li className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Export to PyTorch or TensorFlow
              </li>
            </ul>
            <button className="w-fit px-8 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Launch Simulator
            </button>
          </div>
          <div className="lg:w-1/2 bg-surface-container-highest p-8 relative flex flex-col">
            <div className="flex-1 rounded-xl overflow-hidden shadow-inner border border-white/10 bg-slate-950 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <span className="ml-4 text-xs font-mono text-slate-500">interactive_sandbox.ts</span>
              </div>
              
              <div className="flex-1 relative min-h-[300px]">
                <AlgorithmSimulator />
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 font-mono text-[10px] text-slate-500 flex justify-between">
                <span>EPOCH: 482</span>
                <span>LOSS: 0.0241</span>
                <span>LEARNING_RATE: 0.001</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
