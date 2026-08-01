"use client";

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { useApp } from "@/context/AppContext";
import { SHIPPING_CONTENT } from "@/lib/legal/content";

export default function ShippingPageClient() {
  const { locale } = useApp();
  return <LegalPageLayout document={SHIPPING_CONTENT[locale]} />;
}
