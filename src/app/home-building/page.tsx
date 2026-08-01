import type { Metadata } from "next";
import { HomeBuildingPageClient } from "./HomeBuildingPageClient";
import { getSiteUrl } from "@/lib/seo/site-url";

export const metadata: Metadata = {
  title: "รับสร้างบ้าน | Home Building | Planasia",
  description:
    "เชื่อมต่อบริการรับสร้างบ้านจากแบบพร้อมสร้างบน Planasia — ประเมินงบและเริ่มก่อสร้างได้",
  alternates: { canonical: `${getSiteUrl()}/home-building` },
};

export default function HomeBuildingPage() {
  return <HomeBuildingPageClient />;
}
