"use client";

import { useCallback, useEffect, useState } from "react";
import { Cube3D } from "./Cube3D";
import { useCube } from "@/hooks/useCube";
import { solvedCube } from "@/lib/cube";

const MOVES = ["U", "U'", "U2", "R", "R'", "R2", "F", "F'", "F2", "L", "L'", "D", "D'", "B", "B'"];

function pick(): { answer: string; options: string[] } {
  const answer = MOVES[Math.floor(Math.random() * MOVES.length)];
  const opts = new Set<string>([answer]);
  while (opts.size < 4) opts.add(MOVES[Math.floor(Math.random() * MOVES.length)]);
  return { answer, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function NotationQuiz() {
  const { cube, anim, move, set } = useCube();
  const [q, setQ] = useState<{ answer: string; options: string[] } | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });

  const next = useCallback(() => {
    const nq = pick();
    setQ(nq);
    setChosen(null);
    set(solvedCube());
    setTimeout(() => move(nq.answer, 650), 350);
  }, [move, set]);

  useEffect(() => {
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = (o: string) => {
    if (chosen || !q) return;
    setChosen(o);
    setScore((s) => ({ ok: s.ok + (o === q.answer ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">🧠 اختبار سريع: ما هذه الحركة؟</h2>
        <span className="chip">
          النتيجة {score.ok}/{score.total}
        </span>
      </div>
      <p className="mb-2 text-sm text-muted">شاهد الحركة على المكعب ثم اختر رمزها الصحيح.</p>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Cube3D cube={cube} anim={anim} size={190} initialRx={-28} initialRy={-36} />
        <div className="grid flex-1 grid-cols-2 gap-3">
          {q?.options.map((o) => {
            const state = !chosen ? "" : o === q.answer ? "!border-ok !bg-ok/20" : o === chosen ? "!border-bad !bg-bad/20" : "opacity-50";
            return (
              <button key={o} className={`btn alg !text-2xl ${state}`} onClick={() => answer(o)}>
                {o}
              </button>
            );
          })}
          {chosen && (
            <button className="btn btn-primary col-span-2" onClick={next}>
              {chosen === q?.answer ? "أحسنت! التالي ←" : `الصحيح هو ${q?.answer} — التالي ←`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
