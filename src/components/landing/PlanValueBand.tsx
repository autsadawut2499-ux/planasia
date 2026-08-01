"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Diamond, Gem, HousePlus } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfig } from "@/context/SiteConfigContext";
import type { StoreListing } from "@/lib/store/db";

export function PlanValueBand() {
  const L = useBilingual();
  const { settings } = useSiteConfig();
  const brandName = settings.brand.name || "Planasia";
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/store")
      .then((res) => res.json())
      .then((data: { listings?: StoreListing[] }) => {
        if (active) setCount((data.listings ?? []).length);
      })
      .catch(() => {
        /* count is optional */
      });
    return () => {
      active = false;
    };
  }, []);

  const planCount = count && count > 0 ? count.toLocaleString() : L("hundreds of", "หลายร้อย");

  const columns = [
    {
      icon: HousePlus,
      title: L("THE BEST PLANS", "แบบที่ดีที่สุด"),
      items: [
        L("Thousands of home plans", "แบบบ้านให้เลือกมากมาย"),
        L("Huge selection of styles", "หลากหลายสไตล์"),
        L("High-quality, buildable plans", "แบบคุณภาพสูง พร้อมสร้าง"),
      ],
    },
    {
      icon: Diamond,
      title: L("THE BEST SERVICE", "บริการที่ดีที่สุด"),
      items: [
        L("Trusted support team", "ทีมงานที่ไว้ใจได้"),
        L("Family-owned and operated", "ดำเนินงานแบบครอบครัว"),
        L("Years of industry experience", "ประสบการณ์ยาวนานในวงการ"),
      ],
    },
    {
      icon: Gem,
      title: L("THE BEST VALUE", "คุ้มค่าที่สุด"),
      items: [
        L("Instant PDF download", "ดาวน์โหลด PDF ได้ทันที"),
        L("Low-price guarantee", "รับประกันราคาดีที่สุด"),
        L("Affordable customizations", "ปรับแบบได้ในราคาคุ้มค่า"),
      ],
    },
  ];

  return (
    <section className="section-pad bg-transparent">
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <h2 className="text-2xl font-semibold text-[#2b3a4a] md:text-3xl">{brandName}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-[15px]">
          {L(
            `With over ${planCount} hand-picked home plans from leading designers and architects, we're sure you'll find your dream home on our site.`,
            `ด้วยแบบบ้านคัดสรรกว่า ${planCount} แบบจากนักออกแบบและสถาปนิกชั้นนำ เรามั่นใจว่าคุณจะพบบ้านในฝันบนเว็บไซต์ของเรา`,
          )}
        </p>

        <div className="mt-12 grid gap-10 text-left md:grid-cols-3 md:gap-8">
          {columns.map(({ icon: Icon, title, items }) => (
            <div key={title} className="md:border-r md:border-border md:px-6 md:last:border-r-0">
              <Icon className="h-7 w-7 text-[#1e40af]" strokeWidth={1.5} />
              <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-[#2b3a4a]">{title}</h3>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1e40af]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/store"
            className="rounded-md border border-[#1e40af]/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1e40af] transition-colors hover:bg-[#1e40af] hover:text-white"
          >
            {L("Browse Plans", "ดูแบบบ้าน")}
          </Link>
        </div>
      </div>
    </section>
  );
}
