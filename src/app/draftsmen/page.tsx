import type { Metadata } from "next";
import DraftsmenPageClient from "./DraftsmenPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "หาสถาปนิกและนักออกแบบ | Architects & Designers | Planasia",
  description:
    "ค้นหาสถาปนิกและนักออกแบบมืออาชีพ ดูผลงานแบบบ้าน และติดต่อจ้างงานได้โดยตรงบน Planasia",
};

export default function DraftsmenPage() {
  return <DraftsmenPageClient />;
}
