import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Prompt } from "next/font/google";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Planasia — AI Architectural Design Platform",
    template: "%s | Planasia",
  },
  description:
    "Next-generation AI platform for architectural design and permit-ready blueprints. Compliant with local building codes across Asia.",
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Planasia",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport = {
  themeColor: "#1e40af",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${prompt.variable} min-h-screen font-sans font-medium antialiased`}>
        <AuthProvider>
          <AppProvider>
            <LocaleHtmlLang />
            <ToastProvider>
              <PwaProvider>
                <Suspense fallback={null}>
                  <ThemeProvider>{children}</ThemeProvider>
                </Suspense>
              </PwaProvider>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
