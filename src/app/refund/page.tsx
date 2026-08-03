import type { Metadata } from "next";
import RefundPageClient from "./RefundPageClient";

export const metadata: Metadata = {
  title: "นโยบายการคืนสินค้า | Return Policy | Plan Asia",
  description:
    "นโยบายการคืนสินค้าของ Plan Asia — แบบแปลนไม่สามารถส่งคืนเพื่อขอเครดิตหรือคืนเงินได้หลังจากคำสั่งซื้อได้รับการดำเนินการแล้ว",
};

export default function RefundPage() {
  return <RefundPageClient />;
}
