import Link from "next/link";
import { HeroCube } from "@/components/HeroCube";
import { LEVELS } from "@/lib/stats";
import { LESSONS } from "@/lib/lessons";
import { ALL_ALGS } from "@/lib/algs";

const STEPS = [
  {
    n: "١",
    title: "تعلّم",
    color: "#00a651",
    href: "/learn",
    text: "دروس عربية مصوّرة بمكعب تفاعلي. من أول لمسة حتى طريقة المحترفين CFOP، مع اختبارات قصيرة وتتبّع لتقدّمك.",
    cta: "ابدأ الدروس",
  },
  {
    n: "٢",
    title: "تدرّب",
    color: "#0057b8",
    href: "/train",
    text: "مؤقّت بتقنية المسافة، خلطات رسمية، إحصاءات Ao5/Ao12 ومخطط يُظهر لك كيف تتحسّن يوماً بعد يوم.",
    cta: "افتح المؤقّت",
  },
  {
    n: "٣",
    title: "نافس",
    color: "#d71920",
    href: "/compete",
    text: "جولات مسابقة كاملة بقواعد WCA: فحص 15 ثانية، 5 محاولات، حذف الأفضل والأسوأ، لتدخل المسابقة وأنت جاهز.",
    cta: "ابدأ جولة",
  },
];

const FEATURES = [
  { icon: "🧊", t: "مكعب ثلاثي الأبعاد حقيقي", d: "حرّك أي طبقة وشاهد الحركة بتحريك سلس واسحب لتدويره من كل الاتجاهات." },
  { icon: "🧠", t: "تكرار متباعد للخوارزميات", d: "يختار لك النظام حالات OLL/PLL التي تنساها أكثر ويتتبّع إتقانك لكل واحدة." },
  { icon: "📈", t: "مستويات تقودك للقمة", d: "تسعة مستويات من «مستكشف» إلى «عالمي» مع نصيحة محددة لكل مرحلة." },
  { icon: "🏆", t: "محاكاة المسابقات", d: "فحص إلزامي وعقوبات +2 وDNF وحساب المتوسط الرسمي كما في المسابقات." },
  { icon: "🧪", t: "مختبر حر", d: "اخلط وحلّ بنفسك، جرّب أي خوارزمية، أو اعرض حلّ الخلطة بعكس الحركات." },
  { icon: "💾", t: "حفظ تلقائي", d: "كل نتائجك ودروسك المكتملة تُحفظ تلقائياً دون الحاجة لتسجيل حساب." },
];

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="grid items-center gap-8 pt-6 lg:grid-cols-2">
        <div>
          <span className="chip mb-4 border-accent/40 text-accent-soft">✨ منصة عربية متكاملة</span>
          <h1 className="text-4xl font-black leading-[1.35] md:text-6xl">
            من أول لمسة للمكعب
            <br />
            إلى <span className="bg-gradient-to-l from-accent to-accent-2 bg-clip-text text-transparent">منصّات التتويج</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-9 text-fg-2">
            تعلّم حلّ مكعب روبيك خطوة بخطوة بشرح تفاعلي، ثم تدرّب بنظام ذكي يرفع مستواك تدريجياً حتى تصل إلى سرعات المحترفين وتستعد للمسابقات.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/learn/intro" className="btn btn-primary !px-7 !py-3 text-lg">
              🚀 ابدأ التعلّم الآن
            </Link>
            <Link href="/dashboard" className="btn !px-6 !py-3 text-lg">
              📊 مستواي وتقدّمي
            </Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
            {[
              [LESSONS.length, "درساً"],
              [ALL_ALGS.length, "خوارزمية"],
              [LEVELS.length, "مستويات"],
            ].map(([n, l]) => (
              <div key={l as string} className="card p-3">
                <div className="text-3xl font-black text-accent">{n}</div>
                <div className="text-sm text-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <HeroCube size={290} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-center text-3xl font-black">رحلتك في ثلاث خطوات</h2>
        <p className="mb-8 text-center text-muted">طريق واضح، لا تحتاج أن تتساءل ماذا بعد</p>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <Link key={s.title} href={s.href} className="card group relative overflow-hidden p-6 transition hover:-translate-y-1">
              <div className="absolute -start-8 -top-8 h-32 w-32 rounded-full opacity-25 blur-2xl" style={{ background: s.color }} />
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl text-2xl font-black text-white" style={{ background: s.color }}>
                {s.n}
              </div>
              <h3 className="text-2xl font-black">{s.title}</h3>
              <p className="mt-2 leading-8 text-fg-2">{s.text}</p>
              <span className="mt-4 inline-block font-bold text-accent group-hover:underline">{s.cta} ←</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-center text-3xl font-black">كل ما تحتاجه لتتقن المكعب</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="card p-5">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="text-lg font-extrabold">{f.t}</h3>
              <p className="mt-1 leading-8 text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-center text-3xl font-black">سلّم المستويات</h2>
        <p className="mb-8 text-center text-muted">يُحدَّد مستواك تلقائياً من متوسط أزمنتك في المؤقّت</p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {LEVELS.map((l) => (
            <div key={l.id} className="card p-4 text-center">
              <div className="text-sm text-faint">المستوى {l.id}</div>
              <div className="text-xl font-black text-accent">{l.name}</div>
              <div className="mt-1 text-sm text-muted">{l.goal}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/learn" className="btn btn-primary !px-8 !py-3 text-lg">
            ابدأ رحلتك الآن
          </Link>
        </div>
      </section>
    </div>
  );
}
