import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer, Nav } from "@/components/Nav";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "مُتقِن المكعب — تعلّم مكعب روبيك وتدرّب حتى الاحتراف",
  description:
    "منصة عربية تفاعلية لتعلّم مكعب روبيك خطوة بخطوة، ثم التدرّب بالمؤقّت وخوارزميات OLL وPLL والاستعداد للمسابقات.",
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="classic" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-7xl px-4 pt-6">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
