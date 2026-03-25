import AlgorithmCard from "@/components/ui/AlgorithmCard";
import { algorithms } from "@/data/algorithms";

export default function UnsupervisedPage() {
  const filtered = algorithms.filter(a => a.category === 'Unsupervised');

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
    <div className="p-12 relative overflow-hidden min-h-screen">
      <div className="neural-glow top-20 left-40 bg-secondary/5"></div>
      
      <section className="max-w-5xl mx-auto mb-16">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold tracking-widest uppercase mb-6">
          Category
        </div>
        <h2 className="font-headline text-6xl font-bold tracking-tighter text-on-surface mb-6">
          Unsupervised Learning
        </h2>
        <p className="text-xl text-on-surface-variant leading-relaxed max-w-3xl">
          Unsupervised learning is where you only have input data (X) and no corresponding output variables. The goal is to model the underlying structure or distribution in the data in order to learn more about the data.
        </p>
      </section>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((algo) => (
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
    </div>
  );
}
