import type { Metadata } from "next";
import { Trainer } from "@/components/Trainer";

export const metadata: Metadata = { title: "مؤقّت التدريب — مُتقِن المكعب" };

export default function TrainPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black md:text-4xl">⏱ مؤقّت التدريب</h1>
        <p className="mt-2 max-w-2xl text-fg-2">
          خلطات رسمية بطول 20 حركة، مؤقّت بتقنية المسافة كما في المسابقات، وإحصاءات (Ao5 / Ao12) ومخطط تقدّم يُحفظ تلقائياً.
        </p>
      </div>
      <Trainer mode="free" />
    </div>
  );
}
