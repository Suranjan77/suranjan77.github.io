"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Supervised", href: "/algorithms/supervised" },
  { label: "Unsupervised", href: "/algorithms/unsupervised" },
  { label: "Deep Learning", href: "/algorithms/deep-learning" },
  { label: "Playground", href: "/playground", accent: true },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/30 glass-panel">
      {/* Gradient accent line at top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-tertiary to-secondary opacity-60" />

      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <span className="text-sm font-bold text-primary">ML</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-headline text-sm font-bold tracking-tight text-on-surface">
              ML Learn
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-on-surface-variant">
              Digital Observatory
            </p>
          </div>
        </Link>

        {/* Navigation pills */}
        <nav
          aria-label="Primary"
          className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/12 text-primary"
                    : item.accent
                      ? "text-tertiary hover:bg-tertiary/8 hover:text-tertiary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-3 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick action */}
        <Link
          href="/algorithms/neural-networks"
          className="hidden shrink-0 items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface md:inline-flex"
        >
          Neural Networks →
        </Link>
      </div>
    </header>
  );
}
