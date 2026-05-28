"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showStudySidebar = pathname.startsWith("/algorithms/");

  return (
    <div className="min-h-screen lg:flex">
      {showStudySidebar && <Sidebar />}
      <div
        className={clsx(
          "flex min-h-screen min-w-0 flex-1 flex-col",
          showStudySidebar && "lg:ml-[278px]",
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
