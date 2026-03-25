"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 w-full z-30 h-16 sticky top-0 bg-slate-950/60 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-indigo-400 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
          search
        </span>
        <h1 className="font-headline text-xl md:text-2xl text-slate-100 font-bold tracking-tight">
          The Digital Observatory
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-6">
          <Link
            href="/"
            className="text-indigo-400 font-bold hover:text-blue-400 transition-colors text-sm uppercase tracking-widest"
          >
            Dashboard
          </Link>
          <Link
            href="/library"
            className="text-slate-400 hover:text-blue-400 transition-colors text-sm uppercase tracking-widest"
          >
            Library
          </Link>
          <Link
            href="/playground"
            className="text-slate-400 hover:text-blue-400 transition-colors text-sm uppercase tracking-widest"
          >
            Playground
          </Link>
        </div>
        <span className="material-symbols-outlined text-indigo-400 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
          terminal
        </span>
      </div>
    </header>
  );
}
