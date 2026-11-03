"use client";

import { memo, useMemo, useRef, useState } from "react";
import { COLORS, inLayer, orientBasis, rotVecAngle, type Cube, type Vec } from "@/lib/cube";
import type { Anim } from "@/hooks/useCube";

const FACE_NORMALS: Vec[] = [
  [0, -1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
];

const CUBIES: Vec[] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) CUBIES.push([x, y, z]);

function matrixFor(p: Vec, n: Vec, S: number, off: number, anim: Anim | null, inL: boolean): string {
  const { u, v } = orientBasis(n);
  let t: Vec = [p[0] * S + n[0] * off, p[1] * S + n[1] * off, p[2] * S + n[2] * off];
  let uu = u;
  let vv = v;
  let nn = n;
  if (anim && inL) {
    t = rotVecAngle(t, anim.spec.axis, anim.angle);
    uu = rotVecAngle(u, anim.spec.axis, anim.angle);
    vv = rotVecAngle(v, anim.spec.axis, anim.angle);
    nn = rotVecAngle(n, anim.spec.axis, anim.angle);
  }
  const f = (x: number) => x.toFixed(4);
  return `matrix3d(${f(uu[0])},${f(uu[1])},${f(uu[2])},0,${f(vv[0])},${f(vv[1])},${f(vv[2])},0,${f(nn[0])},${f(nn[1])},${f(nn[2])},0,${f(t[0])},${f(t[1])},${f(t[2])},1)`;
}

interface Props {
  cube: Cube;
  anim?: Anim | null;
  size?: number; // حجم المكعب بالبكسل
  interactive?: boolean;
  initialRx?: number;
  initialRy?: number;
  autoRotate?: boolean;
  className?: string;
}

function Cube3DInner({
  cube,
  anim = null,
  size = 260,
  interactive = true,
  initialRx = -28,
  initialRy = -36,
  autoRotate = false,
  className = "",
}: Props) {
  const S = size / 3;
  const [rot, setRot] = useState({ rx: initialRx, ry: initialRy });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const plates = useMemo(() => {
    const out: { p: Vec; n: Vec }[] = [];
    for (const p of CUBIES) for (const n of FACE_NORMALS) out.push({ p, n });
    return out;
  }, []);

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    drag.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setRot((r) => ({ rx: Math.max(-89, Math.min(89, r.rx - dy * 0.5)), ry: r.ry + dx * 0.5 }));
  };
  const onUp = () => {
    drag.current = null;
  };

  const base = "absolute backface-hidden";
  const half = S / 2;

  return (
    <div
      className={`select-none touch-none ${interactive ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}
      style={{ width: size * 1.5, height: size * 1.5, perspective: size * 4.2 }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      dir="ltr"
    >
      <div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={`absolute left-1/2 top-1/2 h-0 w-0 ${autoRotate ? "cube-spin" : ""}`}
          style={{
            transformStyle: "preserve-3d",
            transform: autoRotate ? undefined : `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)`,
            ["--rx" as string]: `${rot.rx}deg`,
          }}
        >
          {plates.map((pl, i) => {
            const inL = anim ? inLayer(pl.p, anim.spec) : false;
            return (
              <div
                key={i}
                className={base}
                style={{
                  width: S,
                  height: S,
                  left: -half,
                  top: -half,
                  background: "#0b0f19",
                  backfaceVisibility: "hidden",
                  transform: matrixFor(pl.p, pl.n, S, half, anim, inL),
                }}
              />
            );
          })}
          {cube.map((s, i) => {
            const inL = anim ? inLayer(s.p, anim.spec) : false;
            const gap = Math.max(2, S * 0.07);
            return (
              <div
                key={i}
                className={base}
                style={{
                  width: S - gap * 2,
                  height: S - gap * 2,
                  left: -(S - gap * 2) / 2,
                  top: -(S - gap * 2) / 2,
                  background: `linear-gradient(135deg, ${COLORS[s.c]}, ${COLORS[s.c]}ee)`,
                  borderRadius: S * 0.12,
                  backfaceVisibility: "hidden",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)",
                  transform: matrixFor(s.p, s.n, S, half + 0.6, anim, inL),
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const Cube3D = memo(Cube3DInner);
