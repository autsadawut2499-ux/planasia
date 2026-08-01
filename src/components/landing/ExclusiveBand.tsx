"use client";

import Link from "next/link";
import { useBilingual } from "@/components/landing/useBilingual";

const MOD_IMAGE =
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80";

export function ExclusiveBand() {
  const L = useBilingual();

  return (
    <>
      {/* Modification services band */}
      <section className="relative overflow-hidden bg-[#1e3a5f]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOD_IMAGE} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#1e3a5f]/80" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center text-white md:px-6 md:py-20">
          <h2 className="text-2xl font-semibold leading-snug md:text-3xl">
            {L(
              "Concept floor-plan support — reviewed for clear design communication",
              "บริการเขียนแผนผังระดับคอนเซปต์ — ตรวจทานเพื่อสื่อสารดีไซน์ได้ชัดเจน",
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/85 md:text-[15px]">
            {L(
              "Planasia helps you refine concept layouts with design and engineering specialists. Files are for design coordination and cost planning — not a substitute for locally stamped construction or permit documents.",
              "Planasia ช่วยปรับแผนผังระดับคอนเซปต์ร่วมกับผู้เชี่ยวชาญด้านการออกแบบ ไฟล์ใช้สื่อสารดีไซน์และประเมินงบประมาณ — ไม่ใช่ชุดแบบก่อสร้างหรือเอกสารยื่นขออนุญาตที่ต้องมีตราประทับท้องถิ่น",
            )}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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

      {/* Exclusive designs intro */}
      <section className="section-pad bg-transparent text-center">
        <div className="section-inner max-w-3xl">
          <h2 className="text-2xl font-semibold text-[#2b3a4a] md:text-3xl">
            {L("One-of-a-kind exclusive home designs", "แบบบ้าน Exclusive หนึ่งเดียว")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-[15px]">
            {L(
              "If you're looking for a home like no other, browse our collection of home designs found exclusively on Planasia. We work with world-class designers and architects to create floor plans you won't find anywhere else.",
              "หากคุณกำลังมองหาบ้านที่ไม่เหมือนใคร เลือกชมคอลเลกชันแบบบ้านที่มีเฉพาะบน Planasia เท่านั้น เราร่วมงานกับนักออกแบบและสถาปนิกระดับโลกเพื่อสร้างแบบแปลนที่หาที่อื่นไม่ได้",
            )}
          </p>
        </div>
      </section>
    </>
  );
}
