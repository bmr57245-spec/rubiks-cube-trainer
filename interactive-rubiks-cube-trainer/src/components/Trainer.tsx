"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cube3D } from "./Cube3D";
import { TimeChart } from "./Charts";
import { applyAlg, generateScramble, solvedCube } from "@/lib/cube";
import { api } from "@/lib/client";
import { LEVELS, averageOf, bestAverage, effective, fmt, fmtSolve, levelFor, meanOf, type SolveRec } from "@/lib/stats";

type Phase = "idle" | "inspect" | "running";
type Penalty = "none" | "plus2" | "dnf";

const ROUND_SIZE = 5;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export function Trainer({ mode }: { mode: "free" | "comp" }) {
  const comp = mode === "comp";
  const [all, setAll] = useState<SolveRec[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [scramble, setScramble] = useState("");
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [display, setDisplay] = useState(0);
  const [holding, setHolding] = useState<"none" | "hold" | "ready">("none");
  const [inspSecs, setInspSecs] = useState(15);
  const [inspectionOn, setInspectionOn] = useState(comp);
  const [hideTime, setHideTime] = useState(false);
  const [showCube, setShowCube] = useState(true);
  const [roundId, setRoundId] = useState(() => uid());
  const [lastId, setLastId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  const holdRef = useRef<{ ready: boolean } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);
  const inspStartRef = useRef(0);
  const raf = useRef<number | null>(null);
  const scrambleRef = useRef("");
  const roundRef = useRef(roundId);
  const inspRef = useRef(inspectionOn);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  useEffect(() => {
    roundRef.current = roundId;
  }, [roundId]);
  useEffect(() => {
    inspRef.current = comp ? true : inspectionOn;
  }, [inspectionOn, comp]);

  const newScramble = useCallback(() => {
    const s = generateScramble(20);
    scrambleRef.current = s;
    setScramble(s);
  }, []);

  useEffect(() => {
    newScramble();
    api<{ solves: SolveRec[] }>("/api/solves?limit=600")
      .then((r) => setAll(r.solves))
      .catch(() => {})
      .finally(() => setLoaded(true));
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [newScramble]);

  const list = useMemo(() => all.filter((s) => s.mode === mode), [all, mode]);
  const roundSolves = useMemo(
    () => (comp ? all.filter((s) => s.roundId === roundId).sort((a, b) => a.id - b.id) : []),
    [all, comp, roundId],
  );
  const roundDone = comp && roundSolves.length >= ROUND_SIZE;
  const roundDoneRef = useRef(false);
  useEffect(() => {
    roundDoneRef.current = roundDone;
  }, [roundDone]);

  const saveSolve = useCallback(
    async (timeMs: number, penalty: Penalty) => {
      setSaving(true);
      try {
        const r = await api<{ solve: SolveRec }>("/api/solves", {
          method: "POST",
          body: JSON.stringify({
            timeMs,
            penalty,
            scramble: scrambleRef.current,
            mode,
            roundId: comp ? roundRef.current : null,
          }),
        });
        setAll((a) => [r.solve, ...a]);
        setLastId(r.solve.id);
      } catch {
        const fake: SolveRec = {
          id: -Date.now(),
          timeMs,
          penalty,
          scramble: scrambleRef.current,
          mode,
          roundId: comp ? roundRef.current : null,
          createdAt: new Date().toISOString(),
        };
        setAll((a) => [fake, ...a]);
        setLastId(fake.id);
      } finally {
        setSaving(false);
        newScramble();
      }
    },
    [comp, mode, newScramble],
  );

  const tick = useCallback(() => {
    if (phaseRef.current === "running") {
      setDisplay(performance.now() - startRef.current);
    } else if (phaseRef.current === "inspect") {
      const el = (performance.now() - inspStartRef.current) / 1000;
      setInspSecs(15 - el);
    } else return;
    raf.current = requestAnimationFrame(tick);
  }, []);

  const penaltyRef = useRef<Penalty>("none");

  const startInspect = useCallback(() => {
    inspStartRef.current = performance.now();
    setInspSecs(15);
    setPhase("inspect");
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const startRun = useCallback(() => {
    if (phaseRef.current === "inspect") {
      const el = performance.now() - inspStartRef.current;
      penaltyRef.current = el > 17000 ? "dnf" : el > 15000 ? "plus2" : "none";
    } else penaltyRef.current = "none";
    startRef.current = performance.now();
    setDisplay(0);
    setLastId(null);
    setPhase("running");
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopRun = useCallback(() => {
    const t = performance.now() - startRef.current;
    if (raf.current) cancelAnimationFrame(raf.current);
    setPhase("idle");
    setDisplay(t);
    void saveSolve(Math.round(t), penaltyRef.current);
  }, [saveSolve]);

  const down = useCallback(() => {
    if (phaseRef.current === "running") {
      stopRun();
      return;
    }
    if (holdRef.current || roundDoneRef.current) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    holdRef.current = { ready: false };
    setHolding("hold");
    holdTimer.current = setTimeout(() => {
      if (holdRef.current) {
        holdRef.current.ready = true;
        setHolding("ready");
      }
    }, 300);
  }, [stopRun]);

  const up = useCallback(() => {
    const h = holdRef.current;
    if (!h) return;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdRef.current = null;
    setHolding("none");
    if (!h.ready) return;
    if (phaseRef.current === "inspect") startRun();
    else if (inspRef.current) startInspect();
    else startRun();
  }, [startInspect, startRun]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code !== "Space") {
        if (e.code === "Escape" && phaseRef.current === "inspect") {
          if (raf.current) cancelAnimationFrame(raf.current);
          setPhase("idle");
        }
        return;
      }
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      if (e.repeat) return;
      down();
    };
    const ku = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      up();
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [down, up]);

  const setPenalty = async (id: number, penalty: Penalty) => {
    setAll((a) => a.map((s) => (s.id === id ? { ...s, penalty } : s)));
    if (id > 0) api(`/api/solves/${id}`, { method: "PATCH", body: JSON.stringify({ penalty }) }).catch(() => {});
  };
  const remove = async (id: number) => {
    setAll((a) => a.filter((s) => s.id !== id));
    if (lastId === id) setLastId(null);
    if (id > 0) api(`/api/solves/${id}`, { method: "DELETE" }).catch(() => {});
  };
  const clearAll = async () => {
    if (!confirm("هل تريد حذف كل النتائج المسجّلة في هذا القسم؟")) return;
    setAll((a) => a.filter((s) => s.mode !== mode));
    api(`/api/solves?mode=${mode}`, { method: "DELETE" }).catch(() => {});
  };
  const newRound = () => {
    setRoundId(uid());
    setLastId(null);
    setDisplay(0);
  };

  const scrambleCube = useMemo(() => (scramble ? applyAlg(solvedCube(), scramble) : solvedCube()), [scramble]);

  const last = all.find((s) => s.id === lastId) ?? null;
  const times = list.map(effective); // الأحدث أولاً
  const ao5 = averageOf(times, 5);
  const ao12 = averageOf(times, 12);
  const best = times.length ? Math.min(...times) : null;
  const mean = meanOf(times);
  const bestAo5 = bestAverage(times, 5);
  const bestAo12 = bestAverage(times, 12);
  const lvl = levelFor(ao12 ?? ao5);

  // ألوان المؤقّت
  let color = "text-white";
  if (holding === "hold") color = "text-red-400";
  if (holding === "ready") color = "text-emerald-400";
  if (phase === "inspect" && holding === "none") color = inspSecs < 0 ? "text-red-400" : inspSecs < 3 ? "text-orange-400" : "text-yellow-300";

  let main: string;
  if (phase === "inspect") main = inspSecs >= 0 ? String(Math.ceil(inspSecs)) : inspSecs > -2 ? "+2" : "DNF";
  else if (phase === "running") main = hideTime ? "···" : fmt(display, 2);
  else main = last ? fmtSolve(last) : display ? fmt(display) : "0.00";

  const hint =
    phase === "running"
      ? "اضغط أي مكان أو المسافة للإيقاف"
      : phase === "inspect"
        ? holding === "ready"
          ? "اترك لبدء الحلّ!"
          : "فترة الفحص — أمسك المسافة (أو اضغط مطوّلاً) ثم اترك للبدء"
        : holding === "ready"
          ? "اترك للبدء!"
          : holding === "hold"
            ? "استمر بالضغط…"
            : roundDone
              ? "انتهت الجولة — ابدأ جولة جديدة"
              : comp || inspectionOn
                ? "أمسك المسافة ثم اترك لبدء الفحص (15 ثانية)"
                : "أمسك المسافة حتى يصبح اللون أخضر ثم اترك للبدء";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        {/* الخلطة */}
        <div className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
                {comp && (
                  <span className="chip border-yellow-300/60 text-yellow-200">
                    المحاولة {Math.min(roundSolves.length + 1, ROUND_SIZE)} من {ROUND_SIZE}
                  </span>
                )}
                الخلطة — أمسك المكعب والأبيض أعلى والأخضر أمامك
              </div>
              <div className="alg text-xl font-bold leading-10 tracking-wide md:text-2xl" dir="ltr">
                {scramble}
              </div>
            </div>
            {showCube && phase === "idle" && (
              <Cube3D cube={scrambleCube} size={110} interactive={false} />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {!comp && (
              <button className="btn btn-sm" onClick={newScramble} disabled={phase !== "idle"}>
                🔀 خلطة جديدة
              </button>
            )}
            <button className="btn btn-sm" onClick={() => setShowCube((v) => !v)}>
              {showCube ? "إخفاء" : "إظهار"} معاينة الخلطة
            </button>
            {!comp && (
              <label className="btn btn-sm cursor-pointer">
                <input type="checkbox" checked={inspectionOn} onChange={(e) => setInspectionOn(e.target.checked)} />
                فحص 15 ثانية
              </label>
            )}
            <label className="btn btn-sm cursor-pointer">
              <input type="checkbox" checked={hideTime} onChange={(e) => setHideTime(e.target.checked)} />
              إخفاء الوقت أثناء الحل
            </label>
          </div>
        </div>

        {/* المؤقّت */}
        <div
          className={`card relative select-none touch-none rounded-3xl p-6 text-center transition ${
            holding === "ready" ? "!border-emerald-400" : holding === "hold" ? "!border-red-400" : ""
          } ${roundDone ? "opacity-60" : "cursor-pointer"}`}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            down();
          }}
          onPointerUp={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            up();
          }}
          style={{ minHeight: 280 }}
        >
          <div className={`timer-digits flex min-h-[170px] items-center justify-center text-[5.5rem] font-black leading-none md:text-[9rem] ${color}`}>
            {main}
          </div>
          <div className="mt-2 text-sm text-slate-400">{hint}</div>
          {phase === "inspect" && (
            <div className="mx-auto mt-3 h-2 w-64 max-w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-yellow-300"
                style={{ width: `${Math.max(0, Math.min(100, (inspSecs / 15) * 100))}%` }}
              />
            </div>
          )}
          {last && phase === "idle" && (
            <div className="mt-4 flex flex-wrap justify-center gap-2" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
              <button className={`btn btn-sm ${last.penalty === "plus2" ? "btn-primary" : ""}`} onClick={() => setPenalty(last.id, last.penalty === "plus2" ? "none" : "plus2")}>
                +2
              </button>
              <button className={`btn btn-sm ${last.penalty === "dnf" ? "btn-red" : ""}`} onClick={() => setPenalty(last.id, last.penalty === "dnf" ? "none" : "dnf")}>
                DNF
              </button>
              {!comp && (
                <button className="btn btn-sm" onClick={() => remove(last.id)}>
                  🗑 حذف
                </button>
              )}
              {saving && <span className="text-sm text-slate-400">…حفظ</span>}
            </div>
          )}
        </div>

        {/* لوحة الجولة */}
        {comp && (
          <RoundPanel solves={roundSolves} roundDone={roundDone} onNew={newRound} />
        )}

        {/* المخطط */}
        {!comp && (
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-extrabold">📈 تقدّمك (آخر 40 حلاً)</h3>
              {list.length > 0 && (
                <button className="btn btn-sm" onClick={clearAll}>
                  حذف الكل
                </button>
              )}
            </div>
            <TimeChart times={[...times].slice(0, 40).reverse()} />
          </div>
        )}

        {comp && <PrepChecklist />}
      </div>

      <aside className="space-y-5">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-extrabold">الإحصاءات {comp ? "(كل الجولات)" : ""}</h3>
            <span className="chip" title={`المستوى ${lvl.id} من ${LEVELS.length}`}>
              ⭐ {lvl.name}
            </span>
          </div>
          {!loaded ? (
            <div className="py-6 text-center text-slate-500">…تحميل</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-center">
              <Stat label="آخر حل" v={times.length ? fmt(times[0]) : "—"} />
              <Stat label="الأفضل" v={best !== null ? fmt(best) : "—"} accent />
              <Stat label="متوسط 5" v={ao5 !== null ? fmt(ao5) : "—"} />
              <Stat label="أفضل متوسط 5" v={bestAo5 !== null ? fmt(bestAo5) : "—"} accent />
              <Stat label="متوسط 12" v={ao12 !== null ? fmt(ao12) : "—"} />
              <Stat label="أفضل متوسط 12" v={bestAo12 !== null ? fmt(bestAo12) : "—"} accent />
              <Stat label="المعدّل العام" v={mean !== null ? fmt(mean) : "—"} />
              <Stat label="عدد الحلول" v={String(list.length)} />
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-extrabold">آخر الحلول</h3>
          {list.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">لا توجد حلول بعد. اضغط المسافة وابدأ!</p>
          ) : (
            <ul className="max-h-[420px] space-y-1 overflow-y-auto pe-1">
              {list.slice(0, 60).map((s, i) => (
                <li key={s.id} className="group flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5">
                  <span className="w-8 text-xs text-slate-500">{list.length - i}</span>
                  <button
                    className="timer-digits flex-1 text-start font-bold hover:text-yellow-300"
                    title={s.scramble}
                    onClick={() => {
                      setLastId(s.id);
                    }}
                  >
                    {fmtSolve(s)}
                  </button>
                  {!comp && (
                    <button className="px-1 text-slate-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100" onClick={() => remove(s.id)} aria-label="حذف">
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white/5 p-2.5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`timer-digits text-xl font-black ${accent ? "text-yellow-300" : ""}`}>{v}</div>
    </div>
  );
}

function RoundPanel({ solves, roundDone, onNew }: { solves: SolveRec[]; roundDone: boolean; onNew: () => void }) {
  const eff = solves.map(effective);
  const avg = solves.length >= ROUND_SIZE ? averageOf([...eff].reverse(), ROUND_SIZE) : null;
  const finite = eff.filter((x) => isFinite(x));
  const bestV = finite.length ? Math.min(...finite) : null;
  const worstV = eff.some((x) => !isFinite(x)) ? Infinity : finite.length ? Math.max(...finite) : null;
  const bestIdx = bestV !== null ? eff.indexOf(bestV) : -1;
  const worstIdx = roundDone && worstV !== null ? eff.lastIndexOf(worstV) : -1;
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-extrabold">🏁 جولة المسابقة (متوسط 5)</h3>
        <button className="btn btn-sm" onClick={onNew}>
          جولة جديدة
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2 text-center">
        {Array.from({ length: ROUND_SIZE }).map((_, i) => {
          const s = solves[i];
          const trimmed = roundDone && (i === bestIdx || i === worstIdx);
          return (
            <div key={i} className={`rounded-xl border p-2 ${s ? "border-[#2a3858] bg-white/5" : "border-dashed border-[#26345a]"}`}>
              <div className="text-xs text-slate-500">{i + 1}</div>
              <div className="timer-digits text-lg font-black">
                {s ? (trimmed ? `(${fmtSolve(s)})` : fmtSolve(s)) : "—"}
              </div>
            </div>
          );
        })}
      </div>
      {roundDone && (
        <div className="mt-4 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-center">
          <div className="text-sm text-yellow-200">النتيجة النهائية للجولة</div>
          <div className="timer-digits text-5xl font-black text-yellow-300">{avg !== null ? fmt(avg) : "—"}</div>
          <div className="mt-1 text-sm text-slate-300">
            {avg !== null && isFinite(avg)
              ? `المستوى المقابل: ${levelFor(avg).name} — ${levelFor(avg).advice}`
              : "جولة DNF — ركّز على إكمال كل حلّ بشكل صحيح أولاً."}
          </div>
        </div>
      )}
    </div>
  );
}

const CHECKS = [
  "سخّنت يديّ بـ 10 حلول",
  "راجعت خوارزميات PLL و OLL الأضعف",
  "المكعب مشحّم والشدّ مناسب",
  "جاهز ذهنياً: تنفّس عميق وبلا ضغط",
  "سأخطط الصليب كاملاً أثناء الفحص",
];

function PrepChecklist() {
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false));
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-extrabold">✅ قائمة التحضير قبل الجولة</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {CHECKS.map((c, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
            <input
              type="checkbox"
              checked={done[i]}
              onChange={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            />
            <span className={done[i] ? "text-slate-500 line-through" : ""}>{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
