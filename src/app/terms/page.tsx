import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "ข้อกำหนดการให้บริการ | Terms of Service | Plan Asia",
  description:
    "ข้อกำหนดการให้บริการ Plan Asia — Construction License ข้อมูลลิขสิทธิ์ ข้อกำหนดด้านการก่อสร้าง และการจำกัดความรับผิด",
};

export default function TermsPage() {
  return <TermsPageClient />;
}
