"use client";

import Link from "next/link";
import { ClipboardList, FileText, Landmark, Wallet } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";

export function PlanInfoBand() {
  const L = useBilingual();

  const items: {
    icon: typeof FileText;
    title: string;
    desc: string;
    href?: string;
  }[] = [
    {
      icon: FileText,
      title: L("What the Plan Includes", "แบบประกอบด้วยอะไรบ้าง"),
      desc: L("See exactly what each plan includes.", "ดูว่าแบบบ้านประกอบด้วยอะไรบ้าง"),
      href: "/whats-included",
    },
    {
      icon: ClipboardList,
      title: L("Plan options", "ตัวเลือกแบบ"),
      desc: L("Each plan has a variety of package options.", "แต่ละแบบมีแพ็กเกจให้เลือกหลากหลาย"),
      href: "/store",
    },
    {
      icon: Wallet,
      title: L("Estimating costs", "ประเมินค่าก่อสร้าง"),
      desc: L("Our report gives you an idea of the cost to build.", "รายงานช่วยให้คุณประเมินงบก่อสร้างได้"),
      href: "/about/construction-budget",
    },
    {
      icon: Landmark,
      title: L("Local building codes", "กฎหมายอาคารท้องถิ่น"),
      desc: L("Get help with local codes to make sure you comply.", "ช่วยเรื่องข้อกำหนดท้องถิ่นให้ถูกต้อง"),
      href: "/about/special-sites",
    },
  ];

  return (
    <section className="bg-[#1e3a5f] py-20 text-white md:py-24">
      <div className="section-inner">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
          <div>
            <h2 className="text-2xl font-semibold leading-snug md:text-4xl">
              {L("What you need to know about our plans", "สิ่งที่คุณควรรู้เกี่ยวกับแบบบ้านของเรา")}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="rounded-md border border-white/60 px-6 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white hover:text-[#1e3a5f]"
              >
                {L("Learn More", "เรียนรู้เพิ่มเติม")}
              </Link>
              <Link
                href="/about/international-communication"
                className="rounded-md border border-white/60 px-6 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white hover:text-[#1e3a5f]"
              >
                {L("Connect With Us", "ติดต่อเรา")}
              </Link>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/80 md:text-[15px]">
            {L(
              "If you have questions, we've got answers. Deciding to build a new home is a huge undertaking, and we've done our best to ensure the house plan browsing, buying, and building process is as transparent as possible.",
              "หากคุณมีคำถาม เรามีคำตอบ การตัดสินใจสร้างบ้านใหม่เป็นเรื่องใหญ่ เราจึงพยายามอย่างเต็มที่ให้ขั้นตอนการเลือกชม ซื้อ และก่อสร้างแบบบ้านโปร่งใสที่สุด",
            )}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-white/15 pt-12 md:grid-cols-4 md:gap-10">
          {items.map(({ icon: Icon, title, desc, href }) => {
            const inner = (
              <>
                <Icon className="mx-auto h-8 w-8 text-white/90" strokeWidth={1.5} />
                <h3 className="mt-3 text-sm font-bold uppercase tracking-wide">{title}</h3>
                <p className="mt-1.5 text-xs text-white/70">{desc}</p>
              </>
            );
            return href ? (
              <Link
                key={title}
                href={href}
                className="block text-center transition-opacity hover:opacity-90"
              >
                {inner}
              </Link>
            ) : (
              <div key={title} className="text-center">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
