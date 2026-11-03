"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/learn", label: "تعلّم" },
  { href: "/lab", label: "المختبر" },
  { href: "/algs", label: "الخوارزميات" },
  { href: "/train", label: "المؤقّت" },
  { href: "/compete", label: "المسابقة" },
  { href: "/dashboard", label: "تقدّمي" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-black tracking-tight">
      <span className="grid h-9 w-9 grid-cols-3 gap-[2px] rounded-lg bg-black p-[3px]" aria-hidden>
        {["#ffd400", "#d71920", "#0057b8", "#00a651", "#f8fafc", "#ff6a13", "#0057b8", "#ffd400", "#d71920"].map(
          (c, i) => (
            <span key={i} className="rounded-[2px]" style={{ background: c }} />
          ),
        )}
      </span>
      <span className="text-lg">
        مُتقِن <span className="text-yellow-300">المكعب</span>
      </span>
    </span>
  );
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <header className="sticky top-0 z-50 border-b border-[#1f2a44] bg-[#070b16]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                active(l.href) ? "bg-yellow-300 text-black" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          className="btn btn-sm lg:hidden"
          aria-label="القائمة"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-[#1f2a44] px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-2 font-bold ${
                active(l.href) ? "bg-yellow-300 text-black" : "text-slate-200 hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#1f2a44] py-10 text-center text-sm text-slate-400">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-3 flex justify-center">
          <Logo />
        </div>
        منصة عربية لتعلّم مكعب روبيك والتدرّج من المبتدئ إلى مستوى المسابقات. تُحفظ نتائجك تلقائياً على هذا الجهاز.
      </div>
    </footer>
  );
}
