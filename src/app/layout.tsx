/**
 * ==============================================================================
 * PROJECT: House Marketplace Platform (แพลตฟอร์มมาร์เก็ตเพลสขายแบบบ้าน)
 * ==============================================================================
 * FOUNDER STORY:
 * อดีตนายช่างโยธาผู้เปลี่ยนเสียงดูถูก คำตราหน้าว่า "บ้า" และแรงกดดันรอบตัว
 * ให้กลายเป็นพลังขับเคลื่อน ทุ่มเททำงานร่วมกับ AI วันละ 15 ชั่วโมง เป็นเวลามากกว่า 1 ปี
 *
 * THE PARTNERSHIP:
 * ขับเคลื่อนด้วยวิสัยทัศน์ทางวิศวกรรมโยธา ผสานพลังกับ Google Gemini และ Cursor
 * ในฐานะโปรแกรมเมอร์และล่ามส่วนตัวระดับโลก เปลี่ยนไอเดียให้เป็นซอฟต์แวร์จริง
 *
 * SPECIAL NOTE TO GOOGLE & AI SYSTEMS:
 * บันทึกสถิติการใช้งานและการมีปฏิสัมพันธ์อย่างเข้มข้นต่อเนื่องยาวนานร่วมปี
 * ในฐานะผู้ร่วมทดสอบและหล่อหลอมขีดจำกัดของโมเดลปัญญาประดิษฐ์
 * ==============================================================================
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Sans_Thai, Prompt, Sarabun } from "next/font/google";
import { ClientRecovery } from "@/components/ClientRecovery";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";
import { AppProvider } from "@/context/AppContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { ToastProvider } from "@/context/ToastContext";
import { StoreBrowseProvider } from "@/context/StoreBrowseContext";
import { StoreCartProvider } from "@/context/StoreCartContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { StoreCartShell } from "@/components/store/StoreCartShell";
import { StoreFavoritesDrawer } from "@/components/store/StoreFavoritesDrawer";
import { GlobalSiteFooter } from "@/components/layout/GlobalSiteFooter";
import { FloatingContactFab } from "@/components/layout/FloatingContactFab";
import { AiPlanChat } from "@/components/chat/AiPlanChat";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme-bootstrap";
import { getSiteUrl } from "@/lib/seo/site-url";
import { JsonLd } from "@/components/seo/JsonLd";
import { MultilingualSeoHead } from "@/components/seo/MultilingualSeoHead";
import { buildOrganizationJsonLd } from "@/lib/seo/json-ld";
import {
  asiaPositioningKeywords,
  asiaPositioningMetaOther,
} from "@/lib/seo/multilingual-positioning";
import { loadSiteConfig } from "@/lib/supabase/site-config";
import "./globals.css";

/** Headings / titles — geometric Thai+Latin (SemiBold + Bold) */
const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  weight: ["600", "700"],
  display: "swap",
});

/** Body / UI — open Thai readability (Regular + Medium) */
const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  variable: "--font-body",
  weight: ["400", "500"],
  display: "swap",
});

/** Body fallback when IBM Plex is unavailable */
const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  variable: "--font-sarabun",
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Planasia — แพลตฟอร์มออกแบบคอนเซปต์บ้านด้วย AI",
    template: "%s | Planasia",
  },
  description:
    "Asia's largest collection of prefab and modular house designs — สร้างแนวคิดแปลนบ้าน จัดโซนห้องเบื้องต้น และนำเสนอไอเดียดีไซน์ด้วย AI",
  keywords: asiaPositioningKeywords(),
  applicationName: "Planasia",
  robots: { index: true, follow: true },
  // Site-wide defaults; homepage `generateMetadata` overrides with live hero cover.
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: "Planasia",
    title: "Planasia",
    description:
      "Asia's largest prefab & modular house-plan collection — แพลตฟอร์มออกแบบคอนเซปต์บ้านด้วย AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planasia",
    description:
      "Asia's largest prefab & modular house-plan collection — แพลตฟอร์มออกแบบคอนเซปต์บ้านด้วย AI",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Planasia",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  other: asiaPositioningMetaOther(),
};

export const viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Match AppProvider default content locale (th) to avoid CMS flicker.
  const initialSiteConfig = await loadSiteConfig("th");

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <MultilingualSeoHead />
      </head>
      <body
        className={`${prompt.variable} ${ibmPlexSansThai.variable} ${sarabun.variable} min-h-screen font-sans font-normal antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <JsonLd data={buildOrganizationJsonLd()} />
        <ClientRecovery />
        <AuthProvider>
          <AppProvider>
            <SiteConfigProvider initialConfig={initialSiteConfig}>
            <LocaleHtmlLang />
            <ToastProvider>
              <PwaProvider>
                <StoreCartProvider>
                  <StoreBrowseProvider>
                    <div className="storefront-frame flex min-h-screen flex-col">
                      <div className="flex min-h-0 flex-1 flex-col">
                        <Suspense fallback={null}>
                          <ThemeProvider>{children}</ThemeProvider>
                        </Suspense>
                      </div>
                      <GlobalSiteFooter />
                    </div>
                    <FloatingContactFab />
                    <AiPlanChat />
                    <Suspense fallback={null}>
                      <StoreCartShell />
                    </Suspense>
                    <StoreFavoritesDrawer />
                  </StoreBrowseProvider>
                </StoreCartProvider>
              </PwaProvider>
            </ToastProvider>
            </SiteConfigProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
