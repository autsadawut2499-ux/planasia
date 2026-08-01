import type { Metadata } from "next";
import DraftsmenPageClient from "./DraftsmenPageClient";

export const metadata: Metadata = {
  title: "หาช่างเขียนแบบ | Find a Draftsman | Planasia",
  description:
    "ค้นหาสถาปนิกและช่างเขียนแบบมืออาชีพ ดูผลงานแบบบ้าน และติดต่อจ้างงานได้โดยตรงบน Planasia",
};

export default function DraftsmenPage() {
  return <DraftsmenPageClient />;
}
