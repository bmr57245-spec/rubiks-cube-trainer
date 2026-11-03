export interface SolveRec {
  id: number;
  timeMs: number;
  penalty: "none" | "plus2" | "dnf" | string;
  scramble: string;
  mode: string;
  roundId?: string | null;
  createdAt: string;
}

export const DNF = Infinity;

export function effective(s: Pick<SolveRec, "timeMs" | "penalty">): number {
  if (s.penalty === "dnf") return DNF;
  return s.timeMs + (s.penalty === "plus2" ? 2000 : 0);
}

export function fmt(ms: number | null | undefined, digits = 2): string {
  if (ms === null || ms === undefined) return "—";
  if (!isFinite(ms)) return "DNF";
  const total = ms / 1000;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  const sec = s.toFixed(digits).padStart(digits ? digits + 3 : 2, "0");
  return m > 0 ? `${m}:${sec}` : s.toFixed(digits);
}

export function fmtSolve(s: Pick<SolveRec, "timeMs" | "penalty">): string {
  if (s.penalty === "dnf") return "DNF";
  return fmt(effective(s)) + (s.penalty === "plus2" ? "+" : "");
}

// متوسط n محاولات (يستبعد الأفضل والأسوأ حسب قواعد WCA). times من الأحدث إلى الأقدم
export function averageOf(times: number[], n: number): number | null {
  if (times.length < n) return null;
  const arr = times.slice(0, n);
  const trim = Math.ceil(n * 0.05);
  const sorted = [...arr].sort((a, b) => a - b);
  const kept = sorted.slice(trim, n - trim);
  if (kept.some((x) => !isFinite(x))) return DNF;
  return kept.reduce((a, b) => a + b, 0) / kept.length;
}

export function bestAverage(times: number[], n: number): number | null {
  // times من الأحدث للأقدم
  let best: number | null = null;
  for (let i = 0; i + n <= times.length; i++) {
    const a = averageOf(times.slice(i), n);
    if (a !== null && isFinite(a) && (best === null || a < best)) best = a;
  }
  return best;
}

export function meanOf(times: number[]): number | null {
  const ok = times.filter((t) => isFinite(t));
  if (!ok.length) return null;
  return ok.reduce((a, b) => a + b, 0) / ok.length;
}

export interface Level {
  id: number;
  name: string;
  maxMs: number; // الحد الأعلى للزمن للوصول لهذا المستوى
  goal: string;
  advice: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "مستكشف",
    maxMs: Infinity,
    goal: "أكمل أول حلّ كامل لك",
    advice: "ابدأ من مسار «المبتدئ» في قسم التعلّم، وأنهِ الدروس بالترتيب.",
  },
  {
    id: 2,
    name: "متعلّم",
    maxMs: 180000,
    goal: "حلّ أقل من 3 دقائق",
    advice: "كرّر الطريقة المبسّطة يومياً وركّز على إتقان الخوارزميات دون النظر للدليل.",
  },
  {
    id: 3,
    name: "هاوٍ",
    maxMs: 90000,
    goal: "حلّ أقل من 90 ثانية",
    advice: "تعلّم الصليب الفعّال و F2L الحدسي، وابدأ باستخدام المؤقت يومياً.",
  },
  {
    id: 4,
    name: "متوسط",
    maxMs: 60000,
    goal: "متوسط أقل من 60 ثانية",
    advice: "انتقل إلى CFOP: الصليب ثم F2L ثم OLL/PLL على مرحلتين.",
  },
  {
    id: 5,
    name: "متقدّم",
    maxMs: 30000,
    goal: "متوسط أقل من 30 ثانية",
    advice: "حسّن حركات الأصابع، وأتقن الـ F2L دون تدويرات زائدة.",
  },
  {
    id: 6,
    name: "خبير",
    maxMs: 20000,
    goal: "متوسط أقل من 20 ثانية",
    advice: "ابدأ بتعلّم OLL الكامل (57) تدريجياً مع PLL الكامل (21).",
  },
  {
    id: 7,
    name: "نخبة",
    maxMs: 12000,
    goal: "متوسط أقل من 12 ثانية",
    advice: "ركّز على التطلّع المسبق (Lookahead) ومعدّل الحركات في الثانية، وجرّب الصليب المحايد.",
  },
  {
    id: 8,
    name: "بطل",
    maxMs: 8000,
    goal: "متوسط أقل من 8 ثوانٍ",
    advice: "حلّ جلسات المسابقة بانتظام، وحسّن الاستقرار وتقليل الأخطاء تحت الضغط.",
  },
  {
    id: 9,
    name: "عالمي",
    maxMs: 6000,
    goal: "متوسط أقل من 6 ثوانٍ",
    advice: "تعلّم تقنيات متقدمة مثل ZBLL/COLL والصليب+1، وحافظ على الثبات الذهني.",
  },
];

export function levelFor(avgMs: number | null): Level {
  if (avgMs === null || !isFinite(avgMs)) return LEVELS[0];
  let lvl = LEVELS[1];
  for (const l of LEVELS.slice(1)) if (avgMs < l.maxMs) lvl = l;
  return lvl;
}
