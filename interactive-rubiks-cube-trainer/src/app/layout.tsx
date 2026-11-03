import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer, Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "مُتقِن المكعب — تعلّم مكعب روبيك وتدرّب حتى الاحتراف",
  description:
    "منصة عربية تفاعلية لتعلّم مكعب روبيك خطوة بخطوة، ثم التدرّب بالمؤقّت وخوارزميات OLL وPLL والاستعداد للمسابقات.",
};

export const viewport: Viewport = {
  themeColor: "#070b16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 pt-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
