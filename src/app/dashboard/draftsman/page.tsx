import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "แดชบอร์ดมืออาชีพ | Planasia",
  description: "จัดการผลงานแบบบ้าน อัปโหลดไฟล์ PDF ตั้งราคา ข้อมูลการรับเงิน และยืนยันตัวตน",
  robots: { index: false, follow: false },
};

export default function DraftsmanDashboardPage() {
  return <DashboardClient />;
}
