import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PUBLIC_SELLER_SELF_LISTING_ENABLED } from "@/lib/features/public-seller";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "แดชบอร์ดมืออาชีพ | Planasia",
  description: "จัดการผลงานแบบบ้าน อัปโหลดไฟล์ PDF ตั้งราคา ข้อมูลการรับเงิน และยืนยันตัวตน",
  robots: { index: false, follow: false },
};

export default function DraftsmanDashboardPage() {
  // Public self-listing closed — admin lists plans via /admin/listings.
  if (!PUBLIC_SELLER_SELF_LISTING_ENABLED) {
    redirect("/");
  }
  return <DashboardClient />;
}
