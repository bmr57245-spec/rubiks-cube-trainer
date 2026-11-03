"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applySpec, parseAlg, parseMove, solvedCube, type Cube, type MoveSpec } from "@/lib/cube";

export interface Anim {
  spec: MoveSpec;
  angle: number; // بالراديان، موجب = مع عقارب الساعة
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function useCube(initial?: Cube) {
  const [cube, setCubeState] = useState<Cube>(() => initial ?? solvedCube());
  const [anim, setAnim] = useState<Anim | null>(null);
  const cubeRef = useRef<Cube>(cube);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const epoch = useRef(0);
  const raf = useRef<number | null>(null);
  const pending = useRef(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      epoch.current++;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const set = useCallback((c: Cube) => {
    epoch.current++;
    pending.current = 0;
    if (raf.current) cancelAnimationFrame(raf.current);
    cubeRef.current = c;
    setCubeState(c);
    setAnim(null);
    setBusy(false);
  }, []);

  const animateOne = useCallback((tok: string, ms: number, myEpoch: number) => {
    return new Promise<void>((resolve) => {
      const spec = parseMove(tok);
      if (!spec || epoch.current !== myEpoch) return resolve();
      const finish = () => {
        cubeRef.current = applySpec(cubeRef.current, spec);
        setCubeState(cubeRef.current);
        setAnim(null);
        resolve();
      };
      if (ms <= 0) return finish();
      const total = (Math.PI / 2) * spec.turns;
      const dur = ms * (Math.abs(spec.turns) === 2 ? 1.5 : 1);
      const t0 = performance.now();
      const frame = (now: number) => {
        if (epoch.current !== myEpoch) return resolve();
        const t = Math.min(1, (now - t0) / dur);
        if (t >= 1) return finish();
        setAnim({ spec, angle: total * ease(t) });
        raf.current = requestAnimationFrame(frame);
      };
      raf.current = requestAnimationFrame(frame);
    });
  }, []);

  // أضف حركات إلى الطابور، تُرجع وعداً يكتمل بعد تنفيذها
  const move = useCallback(
    (alg: string, ms = 260): Promise<void> => {
      const toks = parseAlg(alg);
      const myEpoch = epoch.current;
      pending.current += toks.length;
      setBusy(true);
      const p = chain.current.then(async () => {
        for (const t of toks) {
          if (epoch.current !== myEpoch) return;
          // إذا تراكمت حركات كثيرة (كتابة سريعة) نسرّع
          const speed = pending.current > 3 ? Math.min(ms, 90) : ms;
          await animateOne(t, speed, myEpoch);
          pending.current = Math.max(0, pending.current - 1);
        }
        if (epoch.current === myEpoch && pending.current === 0) setBusy(false);
      });
      chain.current = p;
      return p;
    },
    [animateOne],
  );

  return { cube, anim, busy, move, set, cubeRef };
}
