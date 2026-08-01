"use client";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { useApp } from "@/context/AppContext";
import { PRIVACY_CONTENT } from "@/lib/legal/content";

export default function PrivacyPageClient() {
  const { locale } = useApp();
  return <LegalPageLayout document={PRIVACY_CONTENT[locale]} />;
}
