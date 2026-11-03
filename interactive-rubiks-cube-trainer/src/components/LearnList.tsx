"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LESSONS, TRACKS, type Lesson } from "@/lib/lessons";
import { api } from "@/lib/client";

export function LearnList() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    api<{ completed: string[] }>("/api/progress")
      .then((r) => setDone(r.completed))
      .catch(() => {});
  }, []);

  const tracks = Object.keys(TRACKS) as Lesson["track"][];
  const firstUndone = LESSONS.find((l) => !done.includes(l.id));

  return (
    <div className="space-y-12">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-sm text-slate-400">تقدّمك في التعلّم</div>
          <div className="text-2xl font-black">
            {done.length} / {LESSONS.length} درساً
          </div>
          <div className="mt-2 h-2.5 w-64 max-w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-l from-yellow-300 to-emerald-400 transition-all"
              style={{ width: `${(done.length / LESSONS.length) * 100}%` }}
            />
          </div>
        </div>
        {firstUndone ? (
          <Link href={`/learn/${firstUndone.id}`} className="btn btn-primary">
            {done.length ? "تابع من حيث توقفت" : "ابدأ الدرس الأول"}: {firstUndone.title} ←
          </Link>
        ) : (
          <Link href="/dashboard" className="btn btn-green">
            🎉 أنهيت كل الدروس — شاهد تقدّمك
          </Link>
        )}
      </div>

      {tracks.map((t) => {
        const items = LESSONS.filter((l) => l.track === t);
        const tr = TRACKS[t];
        const count = items.filter((l) => done.includes(l.id)).length;
        return (
          <section key={t}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black" style={{ color: tr.color === "#0057b8" ? "#6aa9ff" : tr.color === "#d71920" ? "#ff6b72" : "#2ee08a" }}>
                  {tr.name}
                </h2>
                <p className="text-slate-400">{tr.desc}</p>
              </div>
              <span className="chip">
                {count}/{items.length} مكتمل
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l, i) => {
                const isDone = done.includes(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/learn/${l.id}`}
                    className="card group relative overflow-hidden p-5 transition hover:-translate-y-1 hover:border-yellow-300/60"
                  >
                    <div
                      className="absolute -start-10 -top-10 h-24 w-24 rounded-full opacity-20 blur-2xl"
                      style={{ background: tr.color }}
                    />
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl font-black text-white"
                        style={{ background: tr.color }}
                      >
                        {isDone ? "✓" : i + 1}
                      </span>
                      <span className="text-xs text-slate-400">⏱ {l.minutes} د</span>
                    </div>
                    <h3 className="text-lg font-extrabold group-hover:text-yellow-300">{l.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-400">{l.summary}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
