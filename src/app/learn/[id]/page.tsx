import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LessonView } from "@/components/LessonView";
import { LESSONS, LESSON_BY_ID } from "@/lib/lessons";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = LESSON_BY_ID[id];
  return { title: l ? `${l.title} — مُتقِن المكعب` : "درس" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = LESSON_BY_ID[id];
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
