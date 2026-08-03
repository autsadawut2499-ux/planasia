import type { Metadata } from "next";
import ConstructionPageClient from "./ConstructionPageClient";

export const metadata: Metadata = {
  title: "ข้อกำหนดด้านการก่อสร้างและรหัสอาคาร | Construction Requirements",
  description:
    "ข้อกำหนดด้านการก่อสร้างและรหัสอาคารของ Plan Asia — ความรับผิดชอบของผู้ซื้อ ผู้รับเหมา และการปฏิบัติตามกฎหมายท้องถิ่น",
};

export default function ConstructionPage() {
  return <ConstructionPageClient />;
}
