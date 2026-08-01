import type { Metadata } from "next";
import ShippingPageClient from "./ShippingPageClient";

export const metadata: Metadata = {
  title: "4. นโยบายการจัดส่งสินค้า | Delivery Policy",
  description:
    "นโยบายการจัดส่ง Planasia — ไฟล์ PDF ดิจิทัลทันทีหลังชำระเงิน และเงื่อนไขชุดเอกสารเสริม 3 ชุด",
};

export default function ShippingPage() {
  return <ShippingPageClient />;
}
