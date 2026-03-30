"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { algorithms } from "@/data/algorithms";
import { getAlgorithmIcon } from "@/lib/algorithmPresentation";
import {
  House,
  FlaskConical,
} from "lucide-react";


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-outline-variant/30 lg:bg-surface-container overflow-y-auto">
      {/* Compact branding */}
      <div className="shrink-0 px-5 py-6">
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
        <nav className="space-y-6">
          
          <div>
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
              Overview
            </p>
            <div className="space-y-1">
                <Link
                  href={"/"}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === "/"
                      ? "bg-primary/12 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  <House
                    size={18}
                    strokeWidth={pathname === "/" ? 2.2 : 1.8}
                    className={clsx(
                      "shrink-0 transition-colors",
                      pathname === "/"
                        ? "text-primary"
                        : "text-on-surface-variant/70 group-hover:text-on-surface-variant",
                    )}
                  />
                  <span>Home</span>
                </Link>
                
                <Link
                  href={"/playground"}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === "/playground"
                      ? "bg-primary/12 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  <FlaskConical
                    size={18}
                    strokeWidth={pathname === "/playground" ? 2.2 : 1.8}
                    className={clsx(
                      "shrink-0 transition-colors",
                      pathname === "/playground"
                        ? "text-primary"
                        : "text-on-surface-variant/70 group-hover:text-on-surface-variant",
                    )}
                  />
                  <span>Neural Playground</span>
                </Link>
            </div>
          </div>

          <div>
             <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
              Curriculum Modules
            </p>
             <div className="space-y-1">
                {algorithms.map((algorithm) => {
                  const href = `/algorithms/${algorithm.id}`;
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={algorithm.id}
                      href={href}
                      className={clsx(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/12 text-primary"
                          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      
                      <span className="truncate">{algorithm.title}</span>
                    </Link>
                  );
                })}
             </div>
          </div>

        </nav>
      </div>

      {/* Compact stats footer */}
      <div className="shrink-0 border-t border-outline-variant/30 px-5 py-4">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            <span className="font-semibold text-on-surface">{algorithms.length}</span> modules
          </span>
          <span className="text-outline-variant">•</span>
          <span>
            <span className="font-semibold text-on-surface">
              1
            </span>{" "}
            lab
          </span>
        </div>
      </div>
    </aside>
  );
}
