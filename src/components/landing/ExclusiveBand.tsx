"use client";

import Link from "next/link";
import { useBilingual } from "@/components/landing/useBilingual";

const DOCTRANSLATOR_LOGIN_URL = "https://dashboard.doctranslator.com/login";

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
            {L(
              "Dream homes where language is no barrier",
              "บ้านในฝันที่ภาษาไม่ใช่อุปสรรค",
            )}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-[15px]">
            {L(
              "No matter where in the world you are looking for a house, we have crafted an accessible web experience for everyone. With an instant translation system that you can choose yourself, discover exclusive house plans only on Planasia smoothly.",
              "ไม่ว่าจะมองหาแบบบ้านที่ไหนบนโลก เราได้สร้างสรรค์ประสบการณ์การชมเว็บไซต์ที่เข้าถึงได้สำหรับทุกคน ด้วยระบบแปลภาษาที่คุณเลือกเองได้ทันที ค้นพบแบบบ้าน Exclusive เฉพาะบน Planasia ได้อย่างราบรื่น",
            )}
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href={DOCTRANSLATOR_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[#1e40af] px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1d4ed8]"
            >
              {L("Translate plan documents", "แปลเอกสารแบบแปลน")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
