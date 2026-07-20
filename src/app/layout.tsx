import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Planasia — AI Architectural Design Platform",
    template: "%s | Planasia",
  },
  description:
    "Design and buy permit-ready house plans with AI. Compliant with local building codes across Asia.",
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
      <body className={`${inter.variable} min-h-screen`}>
        <AuthProvider>
          <AppProvider>
            <LocaleHtmlLang />
            <ToastProvider>
              <PwaProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </PwaProvider>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
