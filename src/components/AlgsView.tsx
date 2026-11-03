"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoPlayer, buildSetup, type Demo } from "./DemoPlayer";
import { TopView } from "./TopView";
import { Cube3D } from "./Cube3D";
import { ALL_ALGS, OLL, PLL, type Alg } from "@/lib/algs";
import { api } from "@/lib/client";
import { fmt } from "@/lib/stats";

interface Stat {
  algId: string;
  box: number;
  attempts: number;
  successes: number;
  bestMs: number | null;
}

const BOX_LABEL = ["جديدة", "بداية", "تتقدّم", "جيدة", "قوية", "متقنة"];
const BOX_COLOR = ["#475569", "#d71920", "#ff6a13", "#ffd400", "#00a651", "#2ee08a"];

const demoOf = (a: Alg): Demo => ({ title: `${a.set} ${a.name}`, note: a.group, alg: a.alg });

function Case({ a, box, onClick, active }: { a: Alg; box: number; onClick: () => void; active: boolean }) {
  const cube = useMemo(() => buildSetup(demoOf(a)), [a]);
  return (
    <button
      onClick={onClick}
      className={`card relative flex flex-col items-center gap-1 p-3 transition hover:-translate-y-0.5 ${active ? "!border-accent" : ""}`}
    >
      <span className="absolute end-2 top-2 h-2.5 w-2.5 rounded-full" style={{ background: BOX_COLOR[box] }} title={BOX_LABEL[box]} />
      <TopView cube={cube} size={96} />
      <div className="font-black">
        {a.set} {a.name}
      </div>
      <div className="alg w-full truncate text-center text-[11px] text-muted" dir="ltr">
        {a.alg}
      </div>
    </button>
  );
}

export function AlgsView() {
  const [tab, setTab] = useState<"lib" | "drill">("lib");
  const [stats, setStats] = useState<Record<string, Stat>>({});

  useEffect(() => {
    api<{ stats: Stat[] }>("/api/algs")
      .then((r) => setStats(Object.fromEntries(r.stats.map((s) => [s.algId, s]))))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button className={`btn ${tab === "lib" ? "btn-primary" : ""}`} onClick={() => setTab("lib")}>
          📚 المكتبة
        </button>
        <button className={`btn ${tab === "drill" ? "btn-primary" : ""}`} onClick={() => setTab("drill")}>
          🎯 تدريب بالتكرار المتباعد
        </button>
      </div>
      {tab === "lib" ? <Library stats={stats} /> : <Drill stats={stats} setStats={setStats} />}
    </div>
  );
}

function Library({ stats }: { stats: Record<string, Stat> }) {
  const [set, setSet] = useState<"ALL" | "OLL" | "PLL">("ALL");
  const [group, setGroup] = useState("");
  const [q, setQ] = useState("");
  const [only2, setOnly2] = useState(false);
  const [sel, setSel] = useState<Alg | null>(PLL[3]);

  const base = set === "OLL" ? OLL : set === "PLL" ? PLL : ALL_ALGS;
  const groups = useMemo(() => [...new Set(base.map((a) => a.group))], [base]);
  const items = base.filter(
    (a) =>
      (!group || a.group === group) &&
      (!only2 || a.twoLook) &&
      (!q || `${a.set} ${a.name} ${a.alg}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["ALL", "OLL", "PLL"] as const).map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${set === s ? "btn-primary" : ""}`}
              onClick={() => {
                setSet(s);
                setGroup("");
              }}
            >
              {s === "ALL" ? "الكل (78)" : s === "OLL" ? "OLL (57)" : "PLL (21)"}
            </button>
          ))}
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="btn btn-sm !bg-surface-2"
          >
            <option value="">كل الأنواع</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <label className="btn btn-sm cursor-pointer">
            <input type="checkbox" checked={only2} onChange={(e) => setOnly2(e.target.checked)} />
            طريقة المرحلتين فقط
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 ابحث (مثال: T أو Sune)"
            className="min-w-0 flex-1 rounded-xl border border-line-2 bg-sunk/30 px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
          {BOX_LABEL.map((l, i) => (
            <span key={l} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: BOX_COLOR[i] }} /> {l}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((a) => (
            <Case key={a.id} a={a} box={stats[a.id]?.box ?? 0} active={sel?.id === a.id} onClick={() => setSel(a)} />
          ))}
        </div>
        {items.length === 0 && <p className="py-10 text-center text-faint">لا توجد نتائج مطابقة.</p>}
      </div>
      <aside className="lg:sticky lg:top-20">
        <DemoPlayer demo={sel ? demoOf(sel) : null} />
        {sel && stats[sel.id] && (
          <div className="card mt-3 flex items-center justify-between p-3 text-sm">
            <span>
              المستوى: <b style={{ color: BOX_COLOR[stats[sel.id].box] }}>{BOX_LABEL[stats[sel.id].box]}</b>
            </span>
            <span>
              المحاولات: {stats[sel.id].attempts} · أفضل زمن: {fmt(stats[sel.id].bestMs)}
            </span>
          </div>
        )}
      </aside>
    </div>
  );
}

function pickNext(pool: Alg[], stats: Record<string, Stat>, lastId: string | null): Alg {
  const cands = pool.length > 1 ? pool.filter((a) => a.id !== lastId) : pool;
  const weights = cands.map((a) => {
    const s = stats[a.id];
    if (!s) return 7;
    return 1 + (5 - s.box) * 1.6;
  });
  const total = weights.reduce((x, y) => x + y, 0);
  let r = Math.random() * total;
  for (let i = 0; i < cands.length; i++) {
    r -= weights[i];
    if (r <= 0) return cands[i];
  }
  return cands[cands.length - 1];
}

function Drill({ stats, setStats }: { stats: Record<string, Stat>; setStats: React.Dispatch<React.SetStateAction<Record<string, Stat>>> }) {
  const [set, setSet] = useState<"ALL" | "OLL" | "PLL">("PLL");
  const [only2, setOnly2] = useState(true);
  const [cur, setCur] = useState<Alg | null>(null);
  const [phase, setPhase] = useState<"show" | "rate">("show");
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const raf = useRef<number | null>(null);
  const finalRef = useRef(0);
  const lastId = useRef<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const pool = useMemo(() => {
    const b = set === "OLL" ? OLL : set === "PLL" ? PLL : ALL_ALGS;
    const f = only2 ? b.filter((a) => a.twoLook) : b;
    return f.length ? f : b;
  }, [set, only2]);

  const loop = useCallback(() => {
    setElapsed(performance.now() - startRef.current);
    raf.current = requestAnimationFrame(loop);
  }, []);

  const next = useCallback(() => {
    const a = pickNext(pool, stats, lastId.current);
    lastId.current = a.id;
    setCur(a);
    setPhase("show");
    setRevealed(false);
    startRef.current = performance.now();
    setElapsed(0);
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }, [pool, stats, loop]);

  useEffect(() => {
    lastId.current = null;
    next();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const stop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    finalRef.current = performance.now() - startRef.current;
    setElapsed(finalRef.current);
    setPhase("rate");
  }, []);

  const rate = useCallback(
    async (result: "good" | "slow" | "fail") => {
      if (!cur) return;
      const id = cur.id;
      try {
        const r = await api<{ stat: Stat }>("/api/algs", {
          method: "POST",
          body: JSON.stringify({ algId: id, result, timeMs: Math.round(finalRef.current) }),
        });
        setStats((s) => ({ ...s, [id]: r.stat }));
      } catch {}
      next();
    },
    [cur, next, setStats],
  );

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT")) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (phase === "show") stop();
      } else if (phase === "rate") {
        if (e.key === "1") rate("good");
        else if (e.key === "2") rate("slow");
        else if (e.key === "3") rate("fail");
      }
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [phase, stop, rate]);

  const cube = useMemo(() => (cur ? buildSetup(demoOf(cur)) : null), [cur]);
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0, 0];
    for (const a of pool) c[stats[a.id]?.box ?? 0]++;
    return c;
  }, [pool, stats]);
  const mastered = counts[4] + counts[5];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["PLL", "OLL", "ALL"] as const).map((s) => (
            <button key={s} className={`btn btn-sm ${set === s ? "btn-primary" : ""}`} onClick={() => setSet(s)}>
              {s === "ALL" ? "OLL + PLL" : s}
            </button>
          ))}
          <label className="btn btn-sm cursor-pointer">
            <input type="checkbox" checked={only2} onChange={(e) => setOnly2(e.target.checked)} />
            حالات المرحلتين فقط
          </label>
        </div>

        {cur && cube && (
          <div className="text-center">
            <div className="mb-1 text-sm text-muted">
              أمسك مكعبك، اضبطه على هذه الحالة (الأصفر في الأعلى) ونفّذ الخوارزمية من ذاكرتك
            </div>
            <div className="timer-digits my-2 text-6xl font-black text-accent">{fmt(elapsed, 1)}</div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div>
                <TopView cube={cube} size={190} />
                <div className="mt-1 font-black">
                  {cur.set} {cur.name} <span className="text-xs font-normal text-muted">· {cur.group}</span>
                </div>
              </div>
              <Cube3D cube={cube} size={190} initialRx={-35} initialRy={-30} />
            </div>

            {phase === "show" ? (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button className="btn btn-primary" onClick={stop}>
                  ⏹ انتهيت (المسافة)
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    stop();
                    setRevealed(true);
                  }}
                >
                  👁 لا أذكر — أرني الحل
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <div className="alg mb-3 rounded-xl bg-sunk/30 p-3 text-xl font-bold" dir="ltr">
                  {cur.alg}
                </div>
                <div className="mb-2 text-sm text-muted">قيّم أداءك (مفاتيح 1 / 2 / 3):</div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button className="btn btn-green" onClick={() => rate("good")}>
                    ✓ أتقنتها (1)
                  </button>
                  <button className="btn btn-primary" onClick={() => rate("slow")}>
                    ~ ببطء (2)
                  </button>
                  <button className="btn btn-red" onClick={() => rate("fail")}>
                    ✗ نسيتها (3)
                  </button>
                </div>
              </div>
            )}
            {phase === "rate" && revealed && (
              <div className="mx-auto mt-5 max-w-sm">
                <DemoPlayer demo={demoOf(cur)} size={200} />
              </div>
            )}
            {phase === "rate" && !revealed && (
              <button className="mt-4 text-sm text-muted underline" onClick={() => setRevealed(true)}>
                شاهد الحلّ بالتحريك
              </button>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <h3 className="mb-3 font-extrabold">تقدّمك في هذه المجموعة</h3>
          <div className="mb-3 text-3xl font-black text-accent">
            {mastered} <span className="text-base font-normal text-muted">/ {pool.length} حالة قوية أو متقنة</span>
          </div>
          <div className="space-y-2">
            {BOX_LABEL.map((l, i) => (
              <div key={l} className="flex items-center gap-2 text-sm">
                <span className="w-14 text-muted">{l}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-tint/10">
                  <div className="h-full rounded-full" style={{ width: `${(counts[i] / Math.max(1, pool.length)) * 100}%`, background: BOX_COLOR[i] }} />
                </div>
                <span className="w-6 text-end">{counts[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4 text-sm leading-7 text-fg-2">
          <b className="text-accent">كيف يعمل التدريب؟</b>
          <br />
          تظهر لك الحالة، تنفّذها على مكعبك الحقيقي وتضغط المسافة. الحالات التي تنساها أو تتأخر بها تظهر لك أكثر، والمتقنة أقل — فتتعلّم أسرع.
        </div>
      </aside>
    </div>
  );
}
