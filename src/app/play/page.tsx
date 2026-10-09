import type { Metadata } from "next";
import PlayerApp from "@/features/play/PlayerApp";

export const metadata: Metadata = {
  title: "Join the classroom quiz",
  description: "Join a classroom quiz with the code on your teacher's screen.",
  alternates: { canonical: "/play" },
  robots: { index: false, follow: false },
};

export default function PlayPage() {
  return <PlayerApp />;
}
