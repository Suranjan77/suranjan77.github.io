"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

const Footer = dynamic(() => import("@/components/layout/Footer"));

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isVisualisation = pathname.startsWith("/visualisations/");
  // The quiz screens run full-screen on a projector or a phone, without the site's navigation.
  const isQuiz = pathname === "/play" || pathname.startsWith("/play/host");
  const [embedMode, setEmbedMode] = useState(false);

  useEffect(() => {
    setEmbedMode(isVisualisation && new URLSearchParams(window.location.search).get("embed") === "1");
  }, [isVisualisation]);

  if (isQuiz) return <main id="main-content" className="min-h-dvh min-w-0 bg-background">{children}</main>;

  return (
    <div
      className={
        isVisualisation
          ? "visualisation-app-shell flex h-dvh min-w-0 flex-col overflow-hidden bg-background"
          : "flex min-h-dvh min-w-0 flex-col bg-background"
      }
    >
      {embedMode ? null : <Header />}
      <main id="main-content" className={isVisualisation ? "visualisation-app-main min-h-0 min-w-0 flex-1 overflow-hidden" : "min-w-0 flex-1"}>
        {children}
      </main>
      {isVisualisation ? null : <Footer />}
    </div>
  );
}
