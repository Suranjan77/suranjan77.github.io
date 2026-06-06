import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getAlgorithmBySlug } from "@/lib/algorithmPresentation";
import { algorithmsList } from "@/data/algorithms_content";
import LessonPage from "@/components/lesson/LessonPage";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const algorithm = getAlgorithmBySlug(resolvedParams.slug);

  if (!algorithm) {
    return {
      title: "Algorithm Not Found",
    };
  }

  return {
    title: `${algorithm.title} | ML Learn`,
    description: algorithm.shortDescription,
  };
}

export async function generateStaticParams() {
  return algorithmsList.map((algorithm) => ({
    slug: algorithm.id,
  }));
}

export default async function AlgorithmPage({ params }: PageProps) {
  const resolvedParams = await params;
  const algorithm = algorithmsList.find(a => a.id === resolvedParams.slug);

  if (!algorithm) {
    notFound();
  }

  return <LessonPage module={algorithm} allModules={algorithmsList} />;
}
