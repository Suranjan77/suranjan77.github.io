"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { label: "Curriculum", mobileLabel: "Curric", href: "/#curriculum" },
  { label: "Playground", mobileLabel: "Lab", href: "/playground" },
  { label: "GradForge", mobileLabel: "Grad", href: "/gradforge" },
  { label: "About", mobileLabel: "About", href: "/#philosophy" },
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
    <header className="sticky top-0 z-30 border-b border-outline bg-background/95">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-favicon.svg"
            alt=""
            width={34}
            height={34}
            priority
            className="h-8 w-8 shrink-0 sm:h-[34px] sm:w-[34px]"
          />
          <span>
            <p className="font-headline text-xl font-medium leading-none tracking-normal text-on-surface">
              ML Learn
            </p>
            <p className="mt-1 font-mono text-xs font-normal uppercase tracking-[0.16em] text-on-surface-variant sm:text-[10px] sm:tracking-[0.32em]">
              Learning AI & ML
            </p>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex max-w-[48vw] items-center gap-5 overflow-x-auto sm:max-w-none sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative whitespace-nowrap border-b py-1 font-mono text-xs font-normal uppercase tracking-[0.14em] transition-colors sm:py-0 sm:text-[11px] sm:tracking-[0.22em]",
                  item.label === "About" && "hidden sm:inline",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:border-outline-dark hover:text-on-surface",
                )}
              >
                <span className="sm:hidden">{item.mobileLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
