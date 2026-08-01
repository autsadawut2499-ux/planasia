"use client";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { useApp } from "@/context/AppContext";
import { REFUND_CONTENT } from "@/lib/legal/content";

export default function RefundPageClient() {
  const { locale } = useApp();
  return <LegalPageLayout document={REFUND_CONTENT[locale]} />;
}
