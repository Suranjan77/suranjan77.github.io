"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { algorithms } from "@/data/algorithms";
import { curriculumTracks } from "@/lib/curriculum";
import { FlaskConical, House } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[278px] lg:flex-col lg:overflow-y-auto lg:border-r lg:border-outline lg:bg-background">
      <div className="shrink-0 border-b border-outline px-5 py-6">
        <Link href="/" className="block">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-favicon.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0"
            />
            <div>
              <p className="font-headline text-base font-medium tracking-wide text-on-surface">
                ML Learn
              </p>
              <p className="font-mono text-[10px] font-normal uppercase tracking-[0.24em] text-on-surface-variant">
                Intuitively
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-3 py-5">
        <nav className="space-y-8">
          <div>
            <p className="mb-3 px-3 font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-on-surface-variant">
              Overview
            </p>
            <div className="space-y-1">
              <Link
                href={"/"}
                className={clsx(
                  "group relative flex items-center gap-3 border border-transparent px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors",
                  pathname === "/"
                    ? "border-outline bg-surface text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <House
                  size={18}
                  strokeWidth={pathname === "/" ? 2.2 : 1.8}
                  className={clsx(
                    "shrink-0 transition-colors",
                    pathname === "/"
                      ? "text-primary"
                      : "text-on-surface-variant group-hover:text-on-surface",
                  )}
                />
                <span>Home</span>
              </Link>

              <Link
                href={"/playground"}
                className={clsx(
                  "group relative flex items-center gap-3 border border-transparent px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors",
                  pathname === "/playground"
                    ? "border-outline bg-surface text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <FlaskConical
                  size={18}
                  strokeWidth={pathname === "/playground" ? 2.2 : 1.8}
                  className={clsx(
                    "shrink-0 transition-colors",
                    pathname === "/playground"
                      ? "text-primary"
                      : "text-on-surface-variant group-hover:text-on-surface",
                  )}
                />
                <span>Neural Playground</span>
              </Link>
            </div>
          </div>

          <div>
            {curriculumTracks.map((track) => (
              <div key={track.name} className="mb-4">
                <p className="mb-2 px-3 font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-on-surface-variant">
                  {track.name}
                </p>
                <div className="space-y-1">
                  {track.ids.map((id) => {
                    const algo = algorithms.find((a) => a.id === id);
                    if (!algo) return null;
                    const href = `/algorithms/${algo.id}`;
                    const isActive = pathname === href;

                    return (
                      <Link
                        key={algo.id}
                        href={href}
                        className={clsx(
                          "group relative flex items-center gap-3 border border-transparent px-3 py-1.5 text-[13px] transition-colors",
                          isActive
                            ? "border-outline bg-surface font-medium text-primary"
                            : "text-on-surface-variant hover:text-on-surface",
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-primary" />
                        )}
                        <span className="truncate">{algo.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      <div className="shrink-0 border-t border-outline/70 px-5 py-4">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            <span className="font-semibold text-on-surface">
              {algorithms.length}
            </span>{" "}
            modules
          </span>
          <span className="text-outline-variant">•</span>
          <span>
            <span className="font-semibold text-on-surface">
              {algorithms.length}
            </span>{" "}
            labs
          </span>
        </div>
      </div>
    </aside>
  );
}
