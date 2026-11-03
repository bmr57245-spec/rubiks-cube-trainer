import type { Metadata } from "next";
import { Trainer } from "@/components/Trainer";

export const metadata: Metadata = { title: "جولة المسابقة — مُتقِن المكعب" };

export default function CompetePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black md:text-4xl">🏆 محاكاة المسابقة</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          جولة كاملة بقواعد WCA: 5 محاولات، فحص إلزامي 15 ثانية (تجاوزه يعني +2 أو DNF)، والنتيجة هي متوسط الثلاثة الوسطى بعد حذف الأفضل والأسوأ.
          تدرّب على هذا الأسلوب أسبوعياً حتى تعتاد أجواء المسابقة.
        </p>
      </div>
      <Trainer mode="comp" />
    </div>
  );
}
