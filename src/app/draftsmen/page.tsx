import type { Metadata } from "next";
import DraftsmenPageClient from "./DraftsmenPageClient";
import { getSiteUrl } from "@/lib/seo/site-url";

/** Directory changes infrequently — ISR keeps TTFB low for crawlers. */
export const revalidate = 1800;

const canonical = `${getSiteUrl()}/draftsmen`;

export const metadata: Metadata = {
  title: "หาสถาปนิกและนักออกแบบ | Architects & Designers | Planasia",
  description:
    "ค้นหาสถาปนิกและนักออกแบบมืออาชีพ ดูผลงานแบบบ้าน และติดต่อจ้างงานได้โดยตรงบน Planasia",
  alternates: {
    canonical,
    languages: {
      "th-TH": canonical,
      "en-US": `${canonical}?lang=en`,
      "x-default": canonical,
    },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: canonical,
    siteName: "Planasia",
    title: "หาสถาปนิกและนักออกแบบ | Planasia",
    description:
      "ค้นหาสถาปนิกและนักออกแบบมืออาชีพ ดูผลงานแบบบ้าน และติดต่อจ้างงานได้โดยตรงบน Planasia",
  },
};

export default function DraftsmenPage() {
  return <DraftsmenPageClient />;
}
