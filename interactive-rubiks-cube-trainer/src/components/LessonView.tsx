"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DemoPlayer, buildSetup, type Demo } from "./DemoPlayer";
import { TopView } from "./TopView";
import { NotationQuiz } from "./NotationQuiz";
import { LESSONS, TRACKS, type Lesson, type LessonDemo } from "@/lib/lessons";
import { api } from "@/lib/client";

function DemoButton({ d, active, onClick }: { d: LessonDemo; active: boolean; onClick: () => void }) {
  const top = useMemo(() => (d.ll ? buildSetup(d) : null), [d]);
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-2.5 text-start transition ${
        active
          ? "border-yellow-300 bg-yellow-300/10"
          : "border-[#26345a] bg-[#101830] hover:border-[#3a4d78]"
      }`}
    >
      {top && <TopView cube={top} size={56} />}
      <span className="min-w-0">
        <span className="block font-bold">{d.title}</span>
        <span className="alg block truncate text-sm text-slate-400" dir="ltr">
          {d.alg}
        </span>
        {d.note && <span className="block text-xs text-slate-500">{d.note}</span>}
      </span>
      <span className="ms-auto text-lg">{active ? "🎬" : "▶"}</span>
    </button>
  );
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const allDemos = useMemo(() => lesson.sections.flatMap((s) => s.demos ?? []), [lesson]);
  const [active, setActive] = useState<Demo | null>(allDemos[0] ?? null);
  const [done, setDone] = useState(false);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[idx + 1];
  const prev = LESSONS[idx - 1];
  const track = TRACKS[lesson.track];

  useEffect(() => {
    api<{ completed: string[] }>("/api/progress")
      .then((r) => setDone(r.completed.includes(lesson.id)))
      .catch(() => {});
  }, [lesson.id]);

  const toggleDone = async () => {
    const v = !done;
    setDone(v);
    try {
      await api("/api/progress", { method: "POST", body: JSON.stringify({ lessonId: lesson.id, done: v }) });
    } catch {
      setDone(!v);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/learn" className="text-sm text-slate-400 hover:text-yellow-300">
          ← كل الدروس
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="chip" style={{ borderColor: track.color, color: "#fff" }}>
            {track.name}
          </span>
          <span className="chip">⏱ {lesson.minutes} دقائق</span>
          {done && <span className="chip text-emerald-300">✓ مكتمل</span>}
        </div>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">{lesson.title}</h1>
        <p className="mt-2 max-w-2xl text-slate-300">{lesson.summary}</p>
        <p className="mt-3 inline-block rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          🎯 هدف الدرس: {lesson.goal}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="order-2 space-y-5 lg:order-1">
          {lesson.sections.map((s, i) => (
            <section key={i} className="card prose-ar p-5">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-yellow-300 text-sm font-black text-black">
                  {i + 1}
                </span>
                {s.h}
              </h2>
              {s.p?.map((t, j) => (
                <p key={j} className="mb-2">
                  {t}
                </p>
              ))}
              {s.bullets && (
                <ul className="my-3 space-y-2">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 leading-8 text-slate-200">
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-yellow-300" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.demos && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {s.demos.map((d, j) => (
                    <DemoButton
                      key={j}
                      d={d}
                      active={active === d}
                      onClick={() => {
                        setActive(d);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}

          {lesson.quiz === "notation" && <NotationQuiz />}

          {lesson.tips && (
            <section className="rounded-2xl border border-yellow-300/30 bg-yellow-300/5 p-5">
              <h3 className="mb-2 font-extrabold text-yellow-300">💡 نصائح</h3>
              <ul className="space-y-1 text-slate-200">
                {lesson.tips.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <button className={`btn ${done ? "" : "btn-green"}`} onClick={toggleDone}>
              {done ? "↩ إلغاء الإكمال" : "✓ أنهيت هذا الدرس"}
            </button>
            <div className="flex gap-2">
              {prev && (
                <Link className="btn btn-sm" href={`/learn/${prev.id}`}>
                  → {prev.title}
                </Link>
              )}
              {next && (
                <Link className="btn btn-primary btn-sm" href={`/learn/${next.id}`}>
                  {next.title} ←
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/lab" className="btn btn-sm">
              🧪 جرّب في المختبر
            </Link>
            <Link href="/train" className="btn btn-sm">
              ⏱ تدرّب بالمؤقّت
            </Link>
          </div>
        </div>

        <aside className="order-1 lg:sticky lg:top-20 lg:order-2">
          <DemoPlayer demo={active} />
        </aside>
      </div>
    </div>
  );
}
