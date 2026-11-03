"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME, THEMES, THEME_KEY, type ThemeId } from "@/lib/theme";

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  // اقرأ الثيم الذي طبّقه سكربت <head> مسبقاً
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme") as ThemeId | null;
    if (t && THEMES.some((x) => x.id === t)) setThemeState(t);
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    const info = THEMES.find((x) => x.id === t);
    if (meta && info) meta.setAttribute("content", info.meta);
  }, []);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
