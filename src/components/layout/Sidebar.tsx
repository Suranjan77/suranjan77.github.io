"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { algorithms } from "@/data/algorithms";
import {
  House,
  Brain,
  Layers,
  Cpu,
  FlaskConical,
} from "lucide-react";

const navigation = [
  {
    name: "Home",
    href: "/",
    match: (pathname: string) => pathname === "/",
    icon: House,
  },
  {
    name: "Supervised",
    href: "/algorithms/supervised",
    match: (pathname: string) =>
      pathname === "/algorithms/supervised" ||
      getAlgorithmCategoryPath(pathname) === "/algorithms/supervised",
    icon: Brain,
  },
  {
    name: "Unsupervised",
    href: "/algorithms/unsupervised",
    match: (pathname: string) =>
      pathname === "/algorithms/unsupervised" ||
      getAlgorithmCategoryPath(pathname) === "/algorithms/unsupervised",
    icon: Layers,
  },
  {
    name: "Deep Learning",
    href: "/algorithms/deep-learning",
    match: (pathname: string) =>
      pathname === "/algorithms/deep-learning" ||
      getAlgorithmCategoryPath(pathname) === "/algorithms/deep-learning",
    icon: Cpu,
  },
  {
    name: "Playground",
    href: "/playground",
    match: (pathname: string) => pathname === "/playground",
    icon: FlaskConical,
  },
] as const;

function getAlgorithmCategoryPath(pathname: string): string | null {
  if (!pathname.startsWith("/algorithms/")) {
    return null;
  }

  const slug = pathname.replace("/algorithms/", "");

  if (!slug || slug.includes("/")) {
    return null;
  }

  const algorithm = algorithms.find((item) => item.id === slug);

  if (!algorithm) {
    return null;
  }

  switch (algorithm.category) {
    case "Supervised":
      return "/algorithms/supervised";
    case "Unsupervised":
      return "/algorithms/unsupervised";
    case "Deep Learning":
      return "/algorithms/deep-learning";
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[220px] lg:flex-col lg:border-r lg:border-outline-variant/30 lg:bg-surface-container">
      {/* Compact branding */}
      <div className="px-5 py-6">
        <Link href="/" className="block">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <span className="text-sm font-bold text-primary">ML</span>
            </div>
            <div>
              <p className="font-headline text-[15px] font-bold tracking-tight text-on-surface">
                ML Learn
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                Observatory
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
          Navigate
        </p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.match(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}

                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={clsx(
                    "shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant/70 group-hover:text-on-surface-variant",
                  )}
                />

                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Compact stats footer */}
      <div className="border-t border-outline-variant/30 px-5 py-4">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            <span className="font-semibold text-on-surface">3</span> tracks
          </span>
          <span className="text-outline-variant">•</span>
          <span>
            <span className="font-semibold text-on-surface">
              {algorithms.length}
            </span>{" "}
            algorithms
          </span>
        </div>
      </div>
    </aside>
  );
}
