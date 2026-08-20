"use client";

import { LoanConsultationForm } from "@/components/loan-consultation/LoanConsultationForm";
import { useBilingual } from "@/components/landing/useBilingual";

export function LoanConsultationPageClient({
  expertLineOaUrl = "",
}: {
  expertLineOaUrl?: string;
}) {
  const L = useBilingual();

  return (
    <main className="min-h-screen bg-[var(--color-surface)] pb-16 pt-8 font-sans text-text-primary md:pt-12">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e40af]">
            {L("Home loan", "สินเชื่อบ้าน")}
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#1A2744] sm:text-3xl">
            {L(
              "Complete home loan consultation with professionals",
              "ปรึกษาสินเชื่อบ้านครบวงจร กับผู้เชี่ยวชาญมืออาชีพ",
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-[15px]">
            {L(
              "We are ready to advise and support you closely so you can apply for a home construction loan with confidence. Our specialists guide you, help prepare documents, and care for you end-to-end — from start to finish — to improve your chance of a smooth loan approval.",
              "เราพร้อมให้คำปรึกษาและดูแลคุณอย่างใกล้ชิด เพื่อให้คุณมั่นใจในการยื่นกู้ซื้อบ้านและปลูกสร้างบ้านกับธนาคาร เรามีทีมผู้เชี่ยวชาญคอยให้คำแนะนำ ช่วยเตรียมเอกสาร และดูแลคุณแบบครบวงจร ตั้งแต่ต้นน้ำยันปลายน้ำ เพื่อเพิ่มโอกาสในการอนุมัติวงเงินกู้ผ่านได้อย่างราบรื่น",
            )}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
          <LoanConsultationForm expertLineOaUrl={expertLineOaUrl} />
        </section>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-text-muted">
          {L(
            "This is a consultation request only — not a loan approval. Final decisions belong to your bank.",
            "นี่เป็นเพียงคำขอปรึกษา ไม่ใช่การอนุมัติสินเชื่อ การตัดสินใจสุดท้ายขึ้นอยู่กับธนาคารของท่าน",
          )}
        </p>
      </div>
    </main>
  );
}
