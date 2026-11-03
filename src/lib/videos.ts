// فيديوهات قناة «أويس روبيك» (Owais Rubiks) على يوتيوب مربوطة بكل درس.
// لإضافة فيديو أو استبداله: ضع معرّف الفيديو (الجزء بعد watch?v=) في القائمة.

export const OWAIS_CHANNEL_URL = "https://www.youtube.com/@Rubiks0";

export interface LessonVideo {
  id: string; // YouTube video id
  title: string;
}

export const LESSON_VIDEOS: Record<string, LessonVideo[]> = {
  intro: [{ id: "LpQmxkZp_5Y", title: "طريقة المسكة الصحيحة لمكعب روبيك لأفضل تحكم وسرعة" }],
  notation: [
    { id: "65K7VsIbjVU", title: "أسهل طريقة لحل مكعب روبيك (الاتجاهات والحروف)" },
    { id: "hgLBirBk_Xw", title: "شرح حروف مكعب روبيك وحركة كل حرف" },
  ],
  "daisy-cross": [{ id: "99awITTl_oo", title: "أسهل طريقة لعمل الزائد الأبيض (الحلقة الأولى)" }],
  "first-corners": [{ id: "JiGgkHbDeXc", title: "تركيب الزوايا (الحلقة الثانية)" }],
  "second-layer": [{ id: "1_48k68VE0o", title: "تركيب القطع المجاورة بشكل صحيح (الحلقة الثالثة)" }],
  "yellow-cross": [
    { id: "kYeZi13zIRs", title: "الطريقة الصحيحة لعمل الزائد الأصفر (الحلقة الرابعة)" },
    { id: "iEdjkMrX_vE", title: "حل مشكلة عدم حل الطبقة الصفراء" },
  ],
  "yellow-corners": [{ id: "y22IxPtNVrs", title: "حل الطبقة الصفراء كاملة (الحلقة الخامسة)" }],
  "corner-perm": [{ id: "-2FM-dEep0g", title: "حل الطبقة الأخيرة ج1 (الحلقة السادسة)" }],
  "edge-perm": [{ id: "UczjJOYymrc", title: "حل الطبقة الأخيرة والمكعب كامل (الحلقة السابعة والأخيرة)" }],
  "cfop-intro": [{ id: "yKBYkHVDE1s", title: "طريقة حل مكعب روبيك في أقل من دقيقة" }],
  "efficient-cross": [{ id: "ZKfzDZmghFk", title: "حل الزائد الأبيض لمستوى المتقدمين والمحترفين" }],
  "f2l-basics": [
    { id: "SP7ILW8wzBk", title: "حل مكعب روبيك بخوارزميات الـ F2L للمبتدئين" },
    { id: "sb34-H3lI6I", title: "تسريع حل الـ F2L واختصارها بدون خوارزميات" },
  ],
  "f2l-advanced": [{ id: "rjc3hxMg2eo", title: "طريقة تسريع حل الـ F2L للمتقدمين" }],
  "two-look-oll": [{ id: "B1f3ZZ9jBqY", title: "تسريع حل الطبقة الصفراء OLL بخطوتين فقط" }],
  "two-look-pll": [{ id: "X-6DZE_sMgU", title: "تسريع حل الطبقة الأخيرة بخوارزميات PLL الأساسية" }],
  "finger-tricks": [{ id: "LpQmxkZp_5Y", title: "طريقة المسكة الصحيحة لأفضل تحكم وسرعة" }],
  "full-oll": [{ id: "CceC4qYXfQc", title: "تسريع حل الطبقة الصفراء بخوارزميات OLL للمتقدمين" }],
  "full-pll": [{ id: "X-6DZE_sMgU", title: "خوارزميات PLL للمتقدمين" }],
  lookahead: [{ id: "FoM7HY3-t80", title: "أفضل طريقة لتقليل وقت الحل: شرح الـ Look Ahead" }],
  "comp-prep": [{ id: "5F8UWcOFM7g", title: "تفاصيل مسابقة الروبيك (طريقة المسابقة)" }],
};
