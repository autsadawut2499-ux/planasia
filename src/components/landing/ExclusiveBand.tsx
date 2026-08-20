"use client";

import Link from "next/link";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfig } from "@/context/SiteConfigContext";

const MOD_IMAGE =
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80";

export function ExclusiveBand() {
  const L = useBilingual();
  const { cmsText } = useSiteConfig();

  // Construction tips band is Thai-first marketing copy for all UI locales.
  const tipsTitle = cmsText("construction_tips", "title", "เคล็ดลับการก่อสร้าง");
  const tipsDescription = cmsText(
    "construction_tips",
    "description",
    "ยกระดับความรู้ในการสร้างบ้านด้วยเคล็ดลับมาตรฐาน ค้นหาข้อมูลเชิงลึกและแนวทางการควบคุมงานก่อสร้างให้มีคุณภาพสูงสุดกับ Planasia",
  );
  const tipsCta = cmsText("construction_tips", "cta", "เคล็ดลับการก่อสร้าง");
  const tipsHref = cmsText("construction_tips", "ctaHref", "/articles") || "/articles";

  return (
    <>
      {/* Modification services band */}
      <section className="relative overflow-hidden bg-[#1e3a5f]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOD_IMAGE} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#1e3a5f]/80" />
        </div>
        <div className="relative mx-auto max-w-2xl px-5 py-16 text-center text-white md:max-w-3xl md:px-8 md:py-20">
          <h2 className="mx-auto max-w-[22rem] text-balance text-2xl font-semibold leading-[1.35] md:max-w-xl md:text-3xl md:leading-[1.3]">
            <span className="block">
              {L(
                "Concept floor-plan support",
                "บริการเขียนแผนผังระดับคอนเซปต์",
              )}
            </span>
            <span className="mt-2.5 block text-[1.05rem] font-medium leading-snug text-white/90 md:mt-3 md:text-xl">
              {L(
                "Reviewed for clear design communication",
                "ตรวจทานเพื่อสื่อสารดีไซน์ได้ชัดเจน",
              )}
            </span>
          </h2>
          <div className="mx-auto mt-6 max-w-md space-y-3 text-pretty text-sm leading-[1.75] text-white/85 md:mt-7 md:max-w-xl md:text-[15px] md:leading-[1.7]">
            <p>
              {L(
                "Planasia helps you refine concept layouts with design and engineering specialists.",
                "Planasia ช่วยปรับแผนผังระดับคอนเซปต์ร่วมกับผู้เชี่ยวชาญด้านการออกแบบ",
              )}
            </p>
            <p>
              {L(
                "Files are for design coordination and cost planning — not a substitute for locally stamped construction or permit documents.",
                "ไฟล์ใช้สื่อสารดีไซน์และประเมินงบประมาณ — ไม่ใช่ชุดแบบก่อสร้างหรือเอกสารยื่นขออนุญาตที่ต้องมีตราประทับท้องถิ่น",
              )}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/whats-included"
              className="inline-block rounded-md bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1e3a5f] transition-colors hover:bg-white/90"
            >
              {L("Learn More", "เรียนรู้เพิ่มเติม")}
            </Link>
            <Link
              href="/about/warranty"
              className="inline-block rounded-md border border-white/70 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-[#1e3a5f]"
            >
              {L("View service details", "ดูรายละเอียดบริการ")}
            </Link>
          </div>
        </div>
      </section>

      {/* Construction tips intro */}
      <section className="section-pad bg-transparent text-center">
        <div className="section-inner max-w-3xl">
          <h2 className="text-2xl font-semibold text-[#2b3a4a] md:text-3xl">{tipsTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-[15px]">
            {tipsDescription}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={tipsHref}
              className="inline-flex items-center justify-center rounded-md bg-[#1e40af] px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1d4ed8]"
            >
              {tipsCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
