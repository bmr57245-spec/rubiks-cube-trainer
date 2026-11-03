import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = { title: "لوحة تقدّمي — مُتقِن المكعب" };

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black md:text-4xl">📊 لوحة التقدّم</h1>
        <p className="mt-2 max-w-2xl text-fg-2">
          مستواك الحالي، ما تحتاجه للوصول للمستوى التالي، وتوصية بخطوتك القادمة بناءً على أدائك الفعلي.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
