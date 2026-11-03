"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cube3D } from "./Cube3D";
import { useCube } from "@/hooks/useCube";
import { applyAlg, invertAlg, parseAlg, solvedCube } from "@/lib/cube";

export interface Demo {
  title: string;
  note?: string;
  alg: string;
  setup?: string; // افتراضياً: عكس الخوارزمية
  orient?: string; // اتجاه المكعب (افتراضي z2: الأصفر في الأعلى)
}

export function buildSetup(d: Demo) {
  const orient = d.orient ?? "z2";
  return applyAlg(applyAlg(solvedCube(), orient), d.setup ?? invertAlg(d.alg));
}

const SPEEDS = [
  { label: "بطيء", ms: 650 },
  { label: "عادي", ms: 380 },
  { label: "سريع", ms: 170 },
];

export function DemoPlayer({ demo, size = 250 }: { demo: Demo | null; size?: number }) {
  const { cube, anim, move, set } = useCube();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const run = useRef(0);
  const stepRef = useRef(0);
  const tokens = demo ? parseAlg(demo.alg) : [];
  const demoRef = useRef(demo);
  demoRef.current = demo;
  const demoKey = demo ? `${demo.alg}|${demo.setup ?? "inv"}|${demo.orient ?? ""}` : "";

  const reset = useCallback(() => {
    run.current++;
    setPlaying(false);
    stepRef.current = 0;
    setStep(0);
    if (demoRef.current) set(buildSetup(demoRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoKey, set]);

  useEffect(() => {
    reset();
  }, [reset]);

  const play = async () => {
    if (!demo) return;
    if (stepRef.current >= tokens.length) {
      reset();
      await new Promise((r) => setTimeout(r, 60));
    }
    const id = ++run.current;
    setPlaying(true);
    for (let i = stepRef.current; i < tokens.length; i++) {
      if (run.current !== id) return;
      await move(tokens[i], SPEEDS[speed].ms);
      if (run.current !== id) return;
      stepRef.current = i + 1;
      setStep(i + 1);
    }
    setPlaying(false);
  };

  const pause = () => {
    run.current++;
    setPlaying(false);
  };

  const next = async () => {
    if (!demo || playing || stepRef.current >= tokens.length) return;
    const i = stepRef.current;
    stepRef.current = i + 1;
    setStep(i + 1);
    await move(tokens[i], SPEEDS[speed].ms);
  };

  return (
    <div className="card p-4">
      <div className="flex min-h-[44px] items-start justify-between gap-2">
        <div>
          <div className="font-extrabold text-yellow-300">{demo?.title ?? "اختر مثالاً لمشاهدته"}</div>
          {demo?.note && <div className="mt-1 text-sm text-slate-400">{demo.note}</div>}
        </div>
      </div>
      <div className="flex justify-center py-1">
        <Cube3D cube={cube} anim={anim} size={size} className="mx-auto" />
      </div>
      {demo && (
        <>
          <div className="alg ltr mb-3 flex flex-wrap justify-center gap-1.5 text-lg font-bold" dir="ltr">
            {tokens.map((t, i) => (
              <span
                key={i}
                className={`rounded-lg px-2 py-0.5 transition ${
                  i < step ? "bg-emerald-500/20 text-emerald-300" : i === step ? "bg-yellow-300 text-black" : "bg-white/5 text-slate-300"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {playing ? (
              <button className="btn btn-sm" onClick={pause}>
                ⏸ إيقاف
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={play}>
                ▶ {step >= tokens.length && tokens.length ? "إعادة التشغيل" : step > 0 ? "متابعة" : "تشغيل"}
              </button>
            )}
            <button className="btn btn-sm" onClick={next} disabled={playing || step >= tokens.length}>
              ⏭ خطوة
            </button>
            <button className="btn btn-sm" onClick={reset}>
              ↺ من البداية
            </button>
            <div className="flex overflow-hidden rounded-xl border border-[#2a3858]">
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSpeed(i)}
                  className={`px-2.5 py-1 text-xs font-bold ${speed === i ? "bg-yellow-300 text-black" : "bg-[#131c33] text-slate-300"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <p className="mt-3 text-center text-xs text-slate-500">اسحب المكعب بإصبعك أو الفأرة لتدويره ومشاهدته من كل الجهات</p>
    </div>
  );
}
