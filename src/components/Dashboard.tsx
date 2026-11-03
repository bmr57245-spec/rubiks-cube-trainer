"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, TimeChart } from "./Charts";
import { api } from "@/lib/client";
import { LEVELS, averageOf, bestAverage, effective, fmt, levelFor, meanOf, type SolveRec } from "@/lib/stats";
import { LESSONS, TRACKS, type Lesson } from "@/lib/lessons";
import { ALL_ALGS, OLL, PLL } from "@/lib/algs";

interface AlgStat {
  algId: string;
  box: number;
}

export function Dashboard() {
  const [solves, setSolves] = useState<SolveRec[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [algs, setAlgs] = useState<AlgStat[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ solves: SolveRec[] }>("/api/solves?limit=1000").then((r) => setSolves(r.solves)),
      api<{ completed: string[] }>("/api/progress").then((r) => setDone(r.completed)),
      api<{ stats: AlgStat[] }>("/api/algs").then((r) => setAlgs(r.stats)),
    ])
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const d = useMemo(() => {
    const times = solves.map(effective);
    const rep = averageOf(times, 12) ?? averageOf(times, 5) ?? meanOf(times.slice(0, 5));
    const level = levelFor(solves.length ? rep : null);
    const next = LEVELS[level.id];
    let progress = 0;
    if (next && rep !== null && isFinite(rep)) {
      if (level.id === 1) progress = 0;
      else progress = ((level.maxMs - rep) / (level.maxMs - next.maxMs)) * 100;
    }
    if (level.id === 1 && solves.length) progress = 100;
    const days = new Set(solves.map((s) => new Date(s.createdAt).toDateString()));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      if (days.has(dt.toDateString())) streak++;
      else if (i > 0) break;
    }
    const today = solves.filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString()).length;
    return {
      times,
      rep,
      level,
      next,
      progress: Math.max(0, Math.min(100, progress)),
      streak,
      today,
      best: times.length ? Math.min(...times) : null,
      bestAo5: bestAverage(times, 5),
      bestAo12: bestAverage(times, 12),
      comp: solves.filter((s) => s.mode === "comp").length,
    };
  }, [solves]);

  const boxOf = (id: string) => algs.find((a) => a.algId === id)?.box ?? 0;
  const ollMastered = OLL.filter((a) => boxOf(a.id) >= 4).length;
  const pllMastered = PLL.filter((a) => boxOf(a.id) >= 4).length;
  const twoLook = ALL_ALGS.filter((a) => a.twoLook);
  const twoLookMastered = twoLook.filter((a) => boxOf(a.id) >= 3).length;
  const nextLesson = LESSONS.find((l) => !done.includes(l.id));

  // توصية ذكية
  const rec = useMemo(() => {
    const lvl = d.level.id;
    const beginnerDone = LESSONS.filter((l) => l.track === "beginner").every((l) => done.includes(l.id));
    if (!done.length && !solves.length)
      return { t: "ابدأ من الدرس الأول", d: "لا بيانات بعد. ابدأ المسار الأول وتعلّم أساسيات المكعب.", href: "/learn/intro", cta: "افتح الدرس الأول" };
    if (!beginnerDone && nextLesson)
      return { t: `أكمل: ${nextLesson.title}`, d: "أنهِ المسار الأول بالترتيب قبل الانتقال إلى CFOP.", href: `/learn/${nextLesson.id}`, cta: "تابع الدرس" };
    if (!solves.length)
      return { t: "حان وقت أول حلّ بالمؤقّت", d: "أنهيت مسار المبتدئ! سجّل أول حلّ كامل وابدأ بقياس تقدّمك.", href: "/train", cta: "افتح المؤقّت" };
    if (lvl <= 3)
      return { t: "تعلّم الصليب الفعّال و F2L", d: "الانتقال من طريقة المبتدئين إلى CFOP هو القفزة الأكبر في السرعة.", href: "/learn/cfop-intro", cta: "ابدأ مسار CFOP" };
    if (twoLookMastered < twoLook.length)
      return { t: "أتقن خوارزميات المرحلتين (OLL/PLL)", d: `أتقنت ${twoLookMastered} من ${twoLook.length}. التكرار المتباعد هو أسرع طريقة.`, href: "/algs", cta: "ابدأ التدريب" };
    if (lvl <= 5)
      return { t: "حسّن F2L وحركات الأصابع", d: "ركّز على الحلّ دون توقف بين الأزواج، وسجّل 25 حلاً يومياً.", href: "/learn/f2l-advanced", cta: "راجع الدرس" };
    if (ollMastered < 57 || pllMastered < 21)
      return { t: "وسّع مكتبتك: OLL و PLL الكاملة", d: `OLL: ${ollMastered}/57 · PLL: ${pllMastered}/21 قوية أو متقنة.`, href: "/algs", cta: "تدرّب الآن" };
    if (d.comp < 5)
      return { t: "جرّب جولات المسابقة", d: "تدرّب على الفحص 15 ثانية والمتوسط الرسمي تحت الضغط.", href: "/compete", cta: "ابدأ جولة" };
    return { t: "حافظ على الاستمرارية", d: "اجلس جلسات يومية واختم كل يوم بجولة مسابقة. ركّز على التطلّع المسبق.", href: "/compete", cta: "جولة جديدة" };
  }, [d, done, solves.length, nextLesson, ollMastered, pllMastered, twoLook, twoLookMastered]);

  if (!loaded) return <div className="card p-10 text-center text-muted">…جارٍ تحميل تقدّمك</div>;

  return (
    <div className="space-y-6">
      {/* المستوى */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="card relative overflow-hidden p-6">
          <div className="absolute -start-10 -top-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="text-sm text-muted">مستواك الحالي</div>
          <div className="mt-1 flex flex-wrap items-end gap-3">
            <div className="text-5xl font-black text-accent">{d.level.name}</div>
            <div className="mb-1 chip">
              المستوى {d.level.id} من {LEVELS.length}
            </div>
          </div>
          <div className="mt-2 text-fg-2">
            {d.rep !== null && isFinite(d.rep) ? (
              <>
                متوسطك الحالي: <b className="timer-digits text-fg">{fmt(d.rep)}</b> ثانية
              </>
            ) : (
              "سجّل حلولك بالمؤقّت لنحدّد مستواك."
            )}
          </div>
          {d.next ? (
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-sm">
                <span>الهدف التالي: {d.next.name}</span>
                <span className="text-muted">{d.next.goal}</span>
              </div>
              <Bar value={d.progress} max={100} />
            </div>
          ) : (
            <div className="mt-5 text-ok">🏆 وصلت لأعلى مستوى! حافظ عليه.</div>
          )}
          <p className="mt-4 rounded-xl bg-tint/5 p-3 text-sm leading-7 text-fg-2">💡 {d.level.advice}</p>
        </div>

        <div className="card flex flex-col justify-between border-accent/40 bg-gradient-to-br from-accent/10 to-transparent p-6">
          <div>
            <div className="text-sm text-accent-soft">الخطوة الموصى بها الآن</div>
            <h2 className="mt-1 text-2xl font-black">{rec.t}</h2>
            <p className="mt-2 leading-8 text-fg-2">{rec.d}</p>
          </div>
          <Link href={rec.href} className="btn btn-primary mt-5 self-start">
            {rec.cta} ←
          </Link>
        </div>
      </div>

      {/* أرقام */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Mini label="إجمالي الحلول" v={String(solves.length)} />
        <Mini label="الأفضل" v={d.best !== null ? fmt(d.best) : "—"} />
        <Mini label="أفضل متوسط 5" v={d.bestAo5 !== null ? fmt(d.bestAo5) : "—"} />
        <Mini label="أفضل متوسط 12" v={d.bestAo12 !== null ? fmt(d.bestAo12) : "—"} />
        <Mini label="حلول اليوم" v={String(d.today)} />
        <Mini label="أيام متتالية 🔥" v={String(d.streak)} />
      </div>

      <div className="card p-5">
        <h3 className="mb-2 font-extrabold">📈 تطوّر أزمنتك (آخر 60 حلاً)</h3>
        <TimeChart times={d.times.slice(0, 60).reverse()} height={220} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-extrabold">🎓 تقدّم الدروس</h3>
          <div className="space-y-4">
            {(Object.keys(TRACKS) as Lesson["track"][]).map((t) => {
              const items = LESSONS.filter((l) => l.track === t);
              const c = items.filter((l) => done.includes(l.id)).length;
              return (
                <div key={t}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{TRACKS[t].name}</span>
                    <span className="text-muted">
                      {c}/{items.length}
                    </span>
                  </div>
                  <Bar value={c} max={items.length} color={TRACKS[t].color} />
                </div>
              );
            })}
          </div>
          <Link href="/learn" className="btn btn-sm mt-4">
            كل الدروس
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-extrabold">🧠 إتقان الخوارزميات</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>OLL</span>
                <span className="text-muted">{ollMastered}/57</span>
              </div>
              <Bar value={ollMastered} max={57} color="#ff6a13" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>PLL</span>
                <span className="text-muted">{pllMastered}/21</span>
              </div>
              <Bar value={pllMastered} max={21} color="#00a651" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>حالات المرحلتين (2-look)</span>
                <span className="text-muted">
                  {twoLookMastered}/{twoLook.length}
                </span>
              </div>
              <Bar value={twoLookMastered} max={twoLook.length} />
            </div>
          </div>
          <Link href="/algs" className="btn btn-sm mt-4">
            تدريب الخوارزميات
          </Link>
        </div>
      </div>

      {/* السلّم */}
      <div className="card p-5">
        <h3 className="mb-4 font-extrabold">🪜 سلّم المستويات</h3>
        <div className="grid gap-2 md:grid-cols-3">
          {LEVELS.map((l) => {
            const reached = l.id <= d.level.id;
            const current = l.id === d.level.id;
            return (
              <div
                key={l.id}
                className={`rounded-xl border p-3 ${
                  current ? "border-accent bg-accent/10" : reached ? "border-ok/40 bg-ok/5" : "border-line-2 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <b>
                    {l.id}. {l.name}
                  </b>
                  <span>{current ? "📍" : reached ? "✓" : "🔒"}</span>
                </div>
                <div className="text-sm text-muted">{l.goal}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className="timer-digits text-2xl font-black">{v}</div>
    </div>
  );
}
