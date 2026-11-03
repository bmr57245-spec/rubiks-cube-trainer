import { averageOf, fmt } from "@/lib/stats";

// مخطط خطي لأزمنة الحلول (من الأقدم إلى الأحدث) مع خط متوسط Ao5
export function TimeChart({ times, height = 180 }: { times: number[]; height?: number }) {
  const data = times.filter((t) => isFinite(t));
  if (times.length < 2) {
    return (
      <div className="grid place-items-center text-sm text-slate-500" style={{ height }}>
        أضف حلّين على الأقل لرؤية المخطط
      </div>
    );
  }
  const W = 640;
  const H = height;
  const pad = { l: 44, r: 10, t: 12, b: 20 };
  const max = Math.max(...data) * 1.08;
  const min = Math.min(...data) * 0.92;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, times.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / Math.max(1, max - min)) * (H - pad.t - pad.b);
  const pts = times.map((t, i) => (isFinite(t) ? `${x(i)},${y(t)}` : null)).filter(Boolean) as string[];
  const ao: string[] = [];
  const newestFirst = [...times].reverse();
  for (let i = 4; i < times.length; i++) {
    const slice = newestFirst.slice(times.length - 1 - i, times.length - 1 - i + 5);
    const a = averageOf(slice, 5);
    if (a !== null && isFinite(a)) ao.push(`${x(i)},${y(a)}`);
  }
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + (max - min) * f);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ direction: "ltr" }} role="img" aria-label="مخطط الأزمنة">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#1f2a44" strokeDasharray="3 4" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#7d8bb0">
            {fmt(t, 1)}
          </text>
        </g>
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke="#5b7bd6" strokeWidth="2" opacity=".8" />
      {times.map((t, i) =>
        isFinite(t) ? <circle key={i} cx={x(i)} cy={y(t)} r="3" fill="#8fb0ff" /> : null,
      )}
      {ao.length > 1 && <polyline points={ao.join(" ")} fill="none" stroke="#ffd400" strokeWidth="3" />}
      <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize="11" fill="#ffd400">
        — Ao5
      </text>
    </svg>
  );
}

export function Bar({ value, max, color = "#ffd400" }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%`, background: color }} />
    </div>
  );
}
