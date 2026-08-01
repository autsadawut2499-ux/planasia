import type { Metadata } from "next";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata: Metadata = {
  title: "2. นโยบายความเป็นส่วนตัว | Privacy Policy",
  description:
    "นโยบายความเป็นส่วนตัวของ Planasia ตามมาตรฐานสากลและ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล — การเก็บ ใช้ ชำระเงินผ่าน Payment Gateway และการคุ้มครองข้อมูลลูกค้า",
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
