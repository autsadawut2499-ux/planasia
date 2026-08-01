import type { Metadata } from "next";
import { PlanIncludesArticle } from "@/app/plan-includes/PlanIncludesArticle";
import { getSiteUrl } from "@/lib/seo/site-url";

export const metadata: Metadata = {
  title: "แบบประกอบด้วยอะไรบ้าง | Planasia",
  description:
    "ดูว่าแบบบ้านบน Planasia ประกอบด้วยอะไรบ้าง — แปลนพื้น รูปด้าน ภาพ 3D ตัวอย่าง BOQ และเอกสารวิศวกรรม พร้อมแกลเลอรีขยายภาพ",
  alternates: { canonical: `${getSiteUrl()}/whats-included` },
};

/** Dedicated public page for “แบบประกอบด้วยอะไรบ้าง”. */
export default function WhatsIncludedPage() {
  return <PlanIncludesArticle />;
}
