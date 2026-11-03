export type ThemeId = "classic" | "cyber" | "pro";

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  desc: string;
  swatch: [string, string, string];
  meta: string; // لون شريط المتصفح
}

export const THEMES: ThemeInfo[] = [
  {
    id: "classic",
    name: "كلاسيكي",
    desc: "ألوان هادئة مستوحاة من ألوان المكعب الحقيقية",
    swatch: ["#f5f1e8", "#0051ba", "#009b48"],
    meta: "#f5f1e8",
  },
  {
    id: "cyber",
    name: "ليلي سايبربانك",
    desc: "مظلم ومريح للعين لجلسات التدريب الطويلة ليلاً",
    swatch: ["#07040f", "#00f0ff", "#ff2bd6"],
    meta: "#07040f",
  },
  {
    id: "pro",
    name: "البطولات الاحترافي",
    desc: "تصميم رسمي نظيف بلا مشتّتات يركّز على السرعة",
    swatch: ["#0d0f12", "#4c8dff", "#f3f5f8"],
    meta: "#0d0f12",
  },
];

export const DEFAULT_THEME: ThemeId = "classic";
export const THEME_KEY = "cubemaster-theme";

// يُحقن في <head> لتطبيق الثيم قبل أول رسم (يمنع وميض الثيم الخاطئ)
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="classic"&&t!=="cyber"&&t!=="pro"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"cyber":"${DEFAULT_THEME}"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME}")}})();`;
