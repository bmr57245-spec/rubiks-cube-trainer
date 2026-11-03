"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-line-2" aria-hidden>
      {colors.map((c, i) => (
        <span key={i} className="h-full flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn btn-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="تغيير الثيم"
        onClick={() => setOpen((o) => !o)}
      >
        <Swatch colors={current.swatch} />
        <span className="hidden sm:inline">{current.name}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="الثيمات"
          className="card absolute end-0 top-full z-50 mt-2 w-72 space-y-1 p-2"
        >
          {THEMES.map((t) => (
            <li key={t.id}>
              <button
                role="option"
                aria-selected={t.id === theme}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-start transition ${
                  t.id === theme ? "bg-accent/15 ring-1 ring-accent" : "hover:bg-tint/5"
                }`}
              >
                <Swatch colors={t.swatch} />
                <span className="min-w-0">
                  <span className="block font-bold">{t.name}</span>
                  <span className="block text-xs leading-5 text-muted">{t.desc}</span>
                </span>
                {t.id === theme && <span className="ms-auto text-accent">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
