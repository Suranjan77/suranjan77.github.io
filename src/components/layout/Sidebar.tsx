"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navigation = [
  { name: "Supervised", href: "/algorithms/supervised", icon: "layers" },
  { name: "Unsupervised", href: "/algorithms/unsupervised", icon: "psychology" },
  { name: "Deep Learning", href: "/algorithms/deep-learning", icon: "model_training" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col w-72 border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
      <div className="p-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-400 font-headline">
          ML Learn
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 font-headline font-medium tracking-tight",
                isActive
                  ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border-r-2 border-blue-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">Researcher</p>
            <p className="text-xs text-slate-500">Tier: Elite</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
