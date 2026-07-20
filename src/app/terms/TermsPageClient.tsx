"use client";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { useApp } from "@/context/AppContext";
import { TERMS_CONTENT } from "@/lib/legal/content";

export default function TermsPageClient() {
  const { locale } = useApp();
  return <LegalPageLayout document={TERMS_CONTENT[locale]} />;
}
