"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cube3D } from "./Cube3D";
import { useCube } from "@/hooks/useCube";
import { generateScramble, invertMove, isSolved, moveLabelAr, parseAlg, solvedCube } from "@/lib/cube";

const GROUPS: { title: string; moves: string[] }[] = [
  { title: "الأوجه", moves: ["U", "D", "R", "L", "F", "B"] },
  { title: "الوسط", moves: ["M", "E", "S"] },
  { title: "تدوير المكعب", moves: ["x", "y", "z"] },
  { title: "أوجه عريضة", moves: ["r", "l", "u", "d", "f", "b"] },
];

export function Lab() {
  const { cube, anim, busy, move, set } = useCube();
  const [history, setHistory] = useState<string[]>([]);
  const [scramble, setScramble] = useState("");
  const [hover, setHover] = useState<string>("");
  const [custom, setCustom] = useState("");
  const [fast, setFast] = useState(false);
  const everMoved = useRef(false);

  const play = useCallback(
    (tok: string) => {
      everMoved.current = true;
      setHistory((h) => [...h, tok]);
      move(tok, fast ? 120 : 240);
    },
    [move, fast],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (!"urfdlbmesxyz".includes(k) || k.length !== 1) return;
      e.preventDefault();
      const base = "xyz".includes(k) ? k : k.toUpperCase();
      play(base + (e.shiftKey ? "'" : ""));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play]);

  const doScramble = () => {
    const s = generateScramble(20);
    setScramble(s);
    set(solvedCube());
    setHistory(parseAlg(s));
    everMoved.current = true;
    move(s, 70);
  };

  const reset = () => {
    set(solvedCube());
    setHistory([]);
    setScramble("");
    everMoved.current = false;
  };

  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    move(invertMove(last), 200);
  };

  const solveBack = () => {
    if (!history.length) return;
    const inv = [...history].reverse().map(invertMove).join(" ");
    setHistory([]);
    setScramble("");
    move(inv, 110);
  };

  const runCustom = () => {
    const toks = parseAlg(custom);
    if (!toks.length) return;
    toks.forEach((t) => setHistory((h) => [...h, t]));
    everMoved.current = true;
    move(toks.join(" "), fast ? 120 : 240);
  };

  const solved = isSolved(cube) && !busy;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
      <div className="card relative flex flex-col items-center p-4">
        <div className="mb-1 flex w-full items-center justify-between">
          <span className="chip">عدد الحركات: {history.length}</span>
          {solved && everMoved.current ? (
            <span className="chip border-ok text-ok">🎉 المكعب محلول!</span>
          ) : (
            <span className="chip">{busy ? "…جارٍ التنفيذ" : "اسحب لتدوير العرض"}</span>
          )}
        </div>
        <Cube3D cube={cube} anim={anim} size={320} />
        <div className="mt-2 flex h-6 items-center text-sm text-muted">{hover}</div>
        {scramble && (
          <div className="mt-2 w-full rounded-xl bg-sunk/30 p-3 text-center">
            <div className="mb-1 text-xs text-muted">الخلطة</div>
            <div className="alg text-lg font-bold" dir="ltr">
              {scramble}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={doScramble}>
              🎲 اخلط المكعب
            </button>
            <button className="btn" onClick={undo} disabled={!history.length}>
              ↶ تراجع
            </button>
            <button className="btn btn-green" onClick={solveBack} disabled={!history.length}>
              ✨ حلّ بعكس الحركات
            </button>
            <button className="btn" onClick={reset}>
              ↺ إعادة
            </button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-2">
            <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} />
            حركة سريعة
          </label>
        </div>

        <div className="card space-y-4 p-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-2 text-sm font-bold text-muted">{g.title}</div>
              <div className="grid grid-cols-6 gap-2">
                {g.moves.map((m) => (
                  <div key={m} className="flex flex-col gap-1">
                    {[m, m + "'", m + "2"].map((tok) => (
                      <button
                        key={tok}
                        className="btn alg !px-0 !py-1.5 text-sm"
                        onMouseEnter={() => setHover(`${tok} — ${moveLabelAr(tok)}`)}
                        onMouseLeave={() => setHover("")}
                        onClick={() => play(tok)}
                      >
                        {tok}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs leading-6 text-faint">
            ⌨️ لوحة المفاتيح: اضغط حرف الحركة (U R F D L B M E S X Y Z). اضغط Shift معه لعكس الاتجاه.
          </p>
        </div>

        <div className="card p-4">
          <div className="mb-2 text-sm font-bold text-muted">نفّذ خوارزمية مكتوبة</div>
          <div className="flex gap-2">
            <input
              dir="ltr"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runCustom()}
              placeholder="R U R' U'"
              className="alg min-w-0 flex-1 rounded-xl border border-line-2 bg-sunk/30 px-3 py-2 outline-none focus:border-accent"
            />
            <button className="btn btn-primary" onClick={runCustom}>
              تنفيذ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
