// محرك المكعب: حالة المكعب تُمثَّل بـ 54 ملصقاً، لكل ملصق موضع (p) واتجاه (n) ولون (c)
// الإحداثيات بنظام CSS: x يمين، y لأسفل، z باتجاه المشاهد.

export type Vec = [number, number, number];
export interface Sticker {
  p: Vec;
  n: Vec;
  c: number;
}
export type Cube = Sticker[];

// 0 أبيض، 1 أصفر، 2 أخضر، 3 أزرق، 4 أحمر، 5 برتقالي
export const COLORS = ["#f8fafc", "#ffd400", "#00a651", "#0057b8", "#d71920", "#ff6a13"];

const FACE_DEFS: { n: Vec; c: number }[] = [
  { n: [0, -1, 0], c: 0 }, // U
  { n: [0, 1, 0], c: 1 }, // D
  { n: [0, 0, 1], c: 2 }, // F
  { n: [0, 0, -1], c: 3 }, // B
  { n: [1, 0, 0], c: 4 }, // R
  { n: [-1, 0, 0], c: 5 }, // L
];

export function solvedCube(): Cube {
  const out: Cube = [];
  for (const f of FACE_DEFS) {
    const k = f.n.findIndex((v) => v !== 0);
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        const p: Vec = [0, 0, 0];
        const others = [0, 1, 2].filter((i) => i !== k);
        p[k] = f.n[k];
        p[others[0]] = a;
        p[others[1]] = b;
        out.push({ p, n: [...f.n] as Vec, c: f.c });
      }
    }
  }
  return out;
}

const z0 = (v: number) => (v === 0 ? 0 : v);

function cross(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a: Vec, b: Vec) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// تدوير ربع دورة (موجب = مع عقارب الساعة عند النظر من رأس المحور)
export function rotQuarter(v: Vec, axis: Vec, dir: 1 | -1): Vec {
  const d = dot(axis, v);
  const c = cross(axis, v);
  return [
    z0(axis[0] * d + dir * c[0]),
    z0(axis[1] * d + dir * c[1]),
    z0(axis[2] * d + dir * c[2]),
  ];
}

export interface MoveSpec {
  axis: Vec;
  min: number;
  max: number;
  turns: number; // 1 أو -1 أو 2
}

const BASE: Record<string, { axis: Vec; min: number; max: number }> = {
  U: { axis: [0, -1, 0], min: 1, max: 1 },
  D: { axis: [0, 1, 0], min: 1, max: 1 },
  R: { axis: [1, 0, 0], min: 1, max: 1 },
  L: { axis: [-1, 0, 0], min: 1, max: 1 },
  F: { axis: [0, 0, 1], min: 1, max: 1 },
  B: { axis: [0, 0, -1], min: 1, max: 1 },
  M: { axis: [-1, 0, 0], min: 0, max: 0 },
  E: { axis: [0, 1, 0], min: 0, max: 0 },
  S: { axis: [0, 0, 1], min: 0, max: 0 },
  x: { axis: [1, 0, 0], min: -1, max: 1 },
  y: { axis: [0, -1, 0], min: -1, max: 1 },
  z: { axis: [0, 0, 1], min: -1, max: 1 },
  u: { axis: [0, -1, 0], min: 0, max: 1 },
  d: { axis: [0, 1, 0], min: 0, max: 1 },
  r: { axis: [1, 0, 0], min: 0, max: 1 },
  l: { axis: [-1, 0, 0], min: 0, max: 1 },
  f: { axis: [0, 0, 1], min: 0, max: 1 },
  b: { axis: [0, 0, -1], min: 0, max: 1 },
};

export function parseMove(tok: string): MoveSpec | null {
  let t = tok.trim();
  if (!t) return null;
  t = t.replace(/^([URFDLB])w/, (_, l: string) => l.toLowerCase());
  const m = /^([URFDLBMESxyzurfdlb])(2'|2|')?$/.exec(t);
  if (!m) return null;
  const base = BASE[m[1]];
  const mod = m[2];
  const turns = mod === "'" ? -1 : mod ? 2 : 1;
  return { axis: base.axis, min: base.min, max: base.max, turns };
}

export function parseAlg(alg: string): string[] {
  return alg
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/^([URFDLB])w/, (_, l: string) => l.toLowerCase()))
    .map((t) => (t.endsWith("2'") ? t.slice(0, -1) : t));
}

export function invertMove(tok: string): string {
  if (tok.endsWith("2")) return tok;
  if (tok.endsWith("'")) return tok.slice(0, -1);
  return tok + "'";
}

export function invertAlg(alg: string): string {
  return parseAlg(alg).reverse().map(invertMove).join(" ");
}

export function inLayer(p: Vec, spec: { axis: Vec; min: number; max: number }) {
  const d = dot(p, spec.axis);
  return d >= spec.min && d <= spec.max;
}

export function applySpec(cube: Cube, spec: MoveSpec): Cube {
  const steps = Math.abs(spec.turns);
  const dir: 1 | -1 = spec.turns < 0 ? -1 : 1;
  return cube.map((s) => {
    if (!inLayer(s.p, spec)) return s;
    let p = s.p;
    let n = s.n;
    for (let i = 0; i < steps; i++) {
      p = rotQuarter(p, spec.axis, dir);
      n = rotQuarter(n, spec.axis, dir);
    }
    return { p, n, c: s.c };
  });
}

export function applyMove(cube: Cube, tok: string): Cube {
  const spec = parseMove(tok);
  return spec ? applySpec(cube, spec) : cube;
}

export function applyAlg(cube: Cube, alg: string): Cube {
  let c = cube;
  for (const t of parseAlg(alg)) c = applyMove(c, t);
  return c;
}

export function stateFrom(alg: string, base: Cube = solvedCube()): Cube {
  return applyAlg(base, alg);
}

const key = (v: Vec) => `${v[0]},${v[1]},${v[2]}`;

function centerColors(cube: Cube): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of cube) {
    if (s.p.filter((v) => v !== 0).length === 1) m.set(key(s.n), s.c);
  }
  return m;
}

export function isSolved(cube: Cube): boolean {
  const cc = centerColors(cube);
  return cube.every((s) => cc.get(key(s.n)) === s.c);
}

// الطبقة العليا = الطبقة التي تحوي مركز اللون الأصفر
function yellowNormal(cube: Cube): Vec {
  const s = cube.find((x) => x.c === 1 && x.p.filter((v) => v !== 0).length === 1)!;
  return s.n;
}

// الطبقتان الأوليان (F2L) محلولتان بالنسبة لمراكز الأصفر في الأعلى
export function f2lSolved(cube: Cube): boolean {
  const cc = centerColors(cube);
  const ny = yellowNormal(cube);
  return cube.every((s) => dot(s.p, ny) === 1 || cc.get(key(s.n)) === s.c);
}

export function ollSolved(cube: Cube): boolean {
  const ny = yellowNormal(cube);
  return f2lSolved(cube) && cube.every((s) => !(dot(s.p, ny) === 1 && key(s.n) === key(ny)) || s.c === 1);
}

// محلول مع السماح بحركة U (AUF)
export function pllSolved(cube: Cube): boolean {
  const ny = yellowNormal(cube);
  const spec: MoveSpec = { axis: ny, min: 1, max: 1, turns: 1 };
  let c = cube;
  for (let i = 0; i < 4; i++) {
    if (isSolved(c)) return true;
    c = applySpec(c, spec);
  }
  return false;
}

export const FACES = ["U", "R", "F", "D", "L", "B"];

export function generateScramble(len = 20): string {
  const axisOf: Record<string, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };
  const out: string[] = [];
  let last = "";
  let last2 = "";
  while (out.length < len) {
    const f = FACES[Math.floor(Math.random() * 6)];
    if (f === last) continue;
    if (last2 && axisOf[f] === axisOf[last] && axisOf[f] === axisOf[last2]) continue;
    const mod = ["", "'", "2"][Math.floor(Math.random() * 3)];
    out.push(f + mod);
    last2 = last;
    last = f;
  }
  return out.join(" ");
}

// ========== مساعدات الرسم ثلاثي الأبعاد ==========
export function orientBasis(n: Vec): { u: Vec; v: Vec } {
  const [x, y, z] = n;
  if (z === 1) return { u: [1, 0, 0], v: [0, 1, 0] };
  if (z === -1) return { u: [-1, 0, 0], v: [0, 1, 0] };
  if (x === 1) return { u: [0, 0, -1], v: [0, 1, 0] };
  if (x === -1) return { u: [0, 0, 1], v: [0, 1, 0] };
  if (y === 1) return { u: [1, 0, 0], v: [0, 0, -1] };
  return { u: [1, 0, 0], v: [0, 0, 1] };
}

export function rotVecAngle(v: Vec, axis: Vec, ang: number): Vec {
  const d = dot(axis, v);
  const c = cross(axis, v);
  const cs = Math.cos(ang);
  const sn = Math.sin(ang);
  return [
    axis[0] * d * (1 - cs) + v[0] * cs + c[0] * sn,
    axis[1] * d * (1 - cs) + v[1] * cs + c[1] * sn,
    axis[2] * d * (1 - cs) + v[2] * cs + c[2] * sn,
  ];
}

export function moveLabelAr(tok: string): string {
  const names: Record<string, string> = {
    U: "الوجه العلوي",
    D: "الوجه السفلي",
    R: "الوجه الأيمن",
    L: "الوجه الأيسر",
    F: "الوجه الأمامي",
    B: "الوجه الخلفي",
    M: "الطبقة الوسطى (بين اليمين واليسار)",
    E: "الطبقة الوسطى الأفقية",
    S: "الطبقة الوسطى (بين الأمام والخلف)",
    x: "كل المكعب مثل R",
    y: "كل المكعب مثل U",
    z: "كل المكعب مثل F",
  };
  const base = tok[0];
  const mod = tok.slice(1);
  const nm = names[base] ?? (base === base.toLowerCase() ? "وجه عريض (طبقتان)" : base);
  const dir = mod === "'" ? "عكس عقارب الساعة" : mod === "2" ? "نصف دورة (180°)" : "مع عقارب الساعة";
  return `${nm} — ${dir}`;
}
