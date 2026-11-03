import type { Metadata } from "next";
import { LearnList } from "@/components/LearnList";

export const metadata: Metadata = { title: "تعلّم — مُتقِن المكعب" };

export default function LearnPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black md:text-4xl">دروس تعلّم المكعب</h1>
        <p className="mt-2 max-w-2xl text-fg-2">
          ثلاثة مسارات متدرّجة: ابدأ من الصفر، ثم انتقل إلى طريقة المحترفين CFOP، ثم أتقن الخوارزميات الكاملة واستعدّ للمسابقات.
          كل درس فيه مكعب تفاعلي يشرح لك الحركات بالتفصيل.
        </p>
      </div>
      <LearnList />
    </div>
  );
}
