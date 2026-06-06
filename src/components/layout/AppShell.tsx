"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useHydrated } from "@/lib/useHydrated";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const showStudySidebar = isHydrated && pathname.startsWith("/algorithms/");

  return (
    <div className="min-h-screen lg:flex">
      {showStudySidebar && <Sidebar />}
      <div
        className={clsx(
          "flex min-h-screen min-w-0 flex-1 flex-col",
          showStudySidebar && "lg:ml-[300px]",
        )}
      >
        <div
          className={clsx(
            "flex min-h-screen w-full min-w-0 flex-1 flex-col bg-background",
            showStudySidebar
              ? "mx-auto max-w-[1500px] border-x border-outline"
              : "max-w-none",
          )}
        >
          <Header />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
