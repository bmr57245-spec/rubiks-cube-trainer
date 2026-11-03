import type { Metadata } from "next";
import { AlgsView } from "@/components/AlgsView";

export const metadata: Metadata = { title: "خوارزميات OLL و PLL — مُتقِن المكعب" };

export default function AlgsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black md:text-4xl">📚 الخوارزميات والتدريب عليها</h1>
        <p className="mt-2 max-w-3xl text-fg-2">
          كل حالات OLL (57) وPLL (21) مع صورة الحالة وتحريك الحل. في وضع التدريب يختارك النظام الحالات التي تحتاج مراجعتها أكثر ويتتبّع إتقانك لكل واحدة.
        </p>
      </div>
      <AlgsView />
    </div>
  );
}
