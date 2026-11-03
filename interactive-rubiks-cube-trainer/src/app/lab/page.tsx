import type { Metadata } from "next";
import { Lab } from "@/components/Lab";

export const metadata: Metadata = { title: "مختبر المكعب — مُتقِن المكعب" };

export default function LabPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black md:text-4xl">🧪 مختبر المكعب</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          مكعب افتراضي كامل: حرّك الأوجه بالأزرار أو لوحة المفاتيح، اخلطه ثم حاول حلّه بنفسك، أو جرّب أي خوارزمية تقرؤها.
        </p>
      </div>
      <Lab />
    </div>
  );
}
