import { COLORS, type Cube } from "@/lib/cube";

// عرض علوي ثنائي الأبعاد للطبقة الأخيرة (الأصفر في الأعلى)
export function TopView({ cube, size = 110 }: { cube: Cube; size?: number }) {
  const cell = 26;
  const strip = 8;
  const gap = 2;
  const pad = 4;
  const total = cell * 3 + strip * 2 + pad * 2 + gap * 6;
  const off = pad + strip + gap;
  const rects: React.ReactNode[] = [];
  const draw = (key: string, x: number, y: number, w: number, h: number, c: number) =>
    rects.push(
      <rect key={key} x={x} y={y} width={w} height={h} rx={3} fill={COLORS[c]} stroke="#05080f" strokeWidth={1} />,
    );
  cube.forEach((s, i) => {
    const [nx, ny, nz] = s.n;
    const [px, py, pz] = s.p;
    if (ny === -1) {
      draw(`t${i}`, off + (px + 1) * (cell + gap), off + (pz + 1) * (cell + gap), cell, cell, s.c);
    } else if (py === -1) {
      if (nz === 1) draw(`f${i}`, off + (px + 1) * (cell + gap), off + 3 * (cell + gap), cell, strip, s.c);
      else if (nz === -1) draw(`b${i}`, off + (px + 1) * (cell + gap), pad, cell, strip, s.c);
      else if (nx === 1) draw(`r${i}`, off + 3 * (cell + gap), off + (pz + 1) * (cell + gap), strip, cell, s.c);
      else if (nx === -1) draw(`l${i}`, pad, off + (pz + 1) * (cell + gap), strip, cell, s.c);
    }
  });
  return (
    <svg viewBox={`0 0 ${total} ${total}`} width={size} height={size} role="img" aria-label="منظر علوي للحالة">
      {rects}
    </svg>
  );
}
