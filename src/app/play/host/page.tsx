import type { Metadata } from "next";
import HostApp from "@/features/play/HostApp";

export const metadata: Metadata = {
  title: "Classroom quiz: teacher",
  description: "Run a classroom quiz from the projector. Students join with a code; ending the session deletes it.",
  alternates: { canonical: "/play/host" },
  robots: { index: false, follow: false },
};

export default function PlayHostPage() {
  return <HostApp />;
}
