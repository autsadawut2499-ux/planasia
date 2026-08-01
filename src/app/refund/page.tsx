import type { Metadata } from "next";
import RefundPageClient from "./RefundPageClient";

export const metadata: Metadata = {
  title: "1. นโยบายการคืนเงินและการยกเลิก | Refund and Cancellation Policy",
  description:
    "นโยบายการคืนเงินและการยกเลิกสำหรับไฟล์แบบบ้าน PDF ดิจิทัลบน Planasia — Final Sale พร้อมข้อยกเว้นกรณีข้อผิดพลาดจากระบบ",
};

export default function RefundPage() {
  return <RefundPageClient />;
}
