"use client";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { useApp } from "@/context/AppContext";
import { CONSTRUCTION_CONTENT } from "@/lib/legal/content";

export default function ConstructionPageClient() {
  const { locale } = useApp();
  return <LegalPageLayout document={CONSTRUCTION_CONTENT[locale]} />;
}
