import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "3. ข้อกำหนดการให้บริการ | Terms of Service",
  description:
    "ข้อกำหนดการให้บริการ Planasia — ลิขสิทธิ์ Single-Use License ความรับผิดชอบทางวิศวกรรม และการจำกัดความรับผิดของตลาดกลางแบบบ้าน PDF",
};

export default function TermsPage() {
  return <TermsPageClient />;
}
