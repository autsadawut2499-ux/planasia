"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { useVendorDashboard } from "@/hooks/useVendorDashboard";
import { VendorProfileTab } from "@/components/vendor/VendorProfileTab";
import { VendorListingsTab } from "@/components/vendor/VendorListingsTab";
import { VendorPayoutTab } from "@/components/vendor/VendorPayoutTab";
import { VendorVerificationTab } from "@/components/vendor/VendorVerificationTab";
import { VendorSidebarNav } from "@/components/vendor/VendorSidebarNav";
import { EnablePushNotifications } from "@/components/vendor/EnablePushNotifications";
import { buildVendorWorkflow, type VendorStepId } from "@/lib/vendor/workflow";

export default function DashboardClient() {
  const { data: session, status: authStatus } = useSession();
  const dash = useVendorDashboard();
  const [step, setStep] = useState<VendorStepId>("profile");
  const steps = buildVendorWorkflow(dash.data);
  const activeStep = steps.find((s) => s.id === step);

  return (
    <div className="min-h-screen page-canvas">
      <LandingHeader />
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">แดชบอร์ดมืออาชีพ</h1>
            <p className="mt-1 text-sm text-text-muted">
              จัดการผลงาน โปรไฟล์ การรับเงิน และยืนยันตัวตน — พร้อมขายบน Planasia
            </p>
          </div>
          {dash.data && (
            <div className="flex flex-wrap gap-3">
              <Stat label="แบบบ้านทั้งหมด" value={dash.data.stats.total} />
              <Stat label="เผยแพร่แล้ว" value={dash.data.stats.published} />
              <Stat label="รอ AI / ไม่ผ่าน" value={dash.data.stats.pending} />
              <Stat label="ยอดขาย" value={dash.data.stats.salesCount ?? 0} />
              <Stat
                label="รายได้ของคุณ (70%)"
                value={`฿${(dash.data.stats.vendorEarnedThb ?? 0).toLocaleString()}`}
              />
            </div>
          )}
        </div>

        {authStatus === "loading" && (
          <div className="rounded-xl border border-border bg-white p-10 text-center text-sm text-text-muted">
            กำลังตรวจสอบการเข้าสู่ระบบ…
          </div>
        )}

        {authStatus === "unauthenticated" && (
          <div className="mx-auto max-w-lg rounded-2xl border border-[#1e40af]/20 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold text-[#1e3a5f]">เข้าสู่ระบบเพื่อจัดการแบบบ้าน</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              เพื่อความปลอดภัย แดชบอร์ดผู้ขายต้องเข้าสู่ระบบด้วย Google
              — ป้องกันการสวมรอยอัปโหลด / KYC / ข้อมูลบัญชีรับเงิน
            </p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard/draftsman" })}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1e40af] px-6 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
            >
              เข้าสู่ระบบด้วย Google
            </button>
            <p className="mt-4 text-xs text-text-muted">
              ถ้าเคยอัปโหลดก่อนล็อกอิน ระบบจะย้ายข้อมูลไปผูกกับบัญชี Google ของคุณอัตโนมัติ
            </p>
          </div>
        )}

        {authStatus === "authenticated" && (
          <>
            {session?.user?.email && (
              <p className="mb-4 text-xs text-text-muted">
                เข้าสู่ระบบแล้วในฐานะ{" "}
                <span className="font-medium text-text-secondary">{session.user.email}</span>
              </p>
            )}

            <div className="mb-5">
              <EnablePushNotifications />
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <VendorSidebarNav steps={steps} active={step} onSelect={setStep} />

              <section className="min-w-0 flex-1">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-[#1e3a5f]">
                    <span className="tabular-nums">{activeStep?.step}.</span> {activeStep?.label}
                  </h2>
                  <p className="mt-0.5 text-xs text-text-muted">{activeStep?.todo}</p>
                </div>

                {dash.error && !dash.data ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="font-medium text-red-700">{dash.error}</p>
                    <button
                      type="button"
                      onClick={() => void dash.refresh()}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      ลองใหม่
                    </button>
                  </div>
                ) : !dash.ready || dash.loading ? (
                  <div className="space-y-4">
                    <div className="h-24 animate-pulse rounded-xl bg-white" />
                    <div className="h-64 animate-pulse rounded-xl bg-white" />
                    <p className="text-center text-sm text-text-muted">กำลังโหลดแดชบอร์ด…</p>
                  </div>
                ) : (
                  <div key={step} className="panel-enter">
                    {dash.data && !dash.data.kycApproved && step !== "verification" && (
                      <KycBanner
                        status={dash.data.verificationStatus}
                        onGo={() => setStep("verification")}
                      />
                    )}
                    {step === "profile" && (
                      <VendorProfileTab
                        key={dash.data?.profile?.updatedAt ?? "profile"}
                        dash={dash}
                      />
                    )}
                    {step === "listings" && <VendorListingsTab dash={dash} />}
                    {step === "payout" && <VendorPayoutTab dash={dash} />}
                    {step === "verification" && (
                      <VendorVerificationTab dash={dash} onGoToStep={setStep} />
                    )}
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-text-muted">
          ต้องการดูหน้าร้านสาธารณะ?{" "}
          <Link href="/draftsmen" className="text-[#1e40af] hover:underline">
            ไดเรกทอรีสถาปนิกและนักออกแบบ
          </Link>
          {dash.data?.ownerKey ? (
            <>
              {" · "}
              <Link
                href={`/draftsmen/${encodeURIComponent(dash.data.ownerKey)}`}
                className="text-[#1e40af] hover:underline"
              >
                โปรไฟล์ของฉัน
              </Link>
            </>
          ) : null}
        </p>
      </main>
    </div>
  );
}

function KycBanner({
  status,
  onGo,
}: {
  status: "unverified" | "pending" | "approved" | "rejected";
  onGo: () => void;
}) {
  const copy: Record<string, { msg: string; cls: string; cta: string }> = {
    unverified: {
      msg: "ขั้นตอนสุดท้ายคือยืนยันตัวตน (Digital KYC) — เตรียมโปรไฟล์ ผลงาน และบัญชีรับเงินให้ครบก่อน แล้วผลงานทั้งหมดจะเผยแพร่อัตโนมัติเมื่อผ่าน",
      cls: "border-amber-300 bg-amber-50 text-amber-800",
      cta: "ไปขั้นตอนสุดท้าย",
    },
    pending: {
      msg: "ระบบกำลังตรวจ KYC อัตโนมัติ…",
      cls: "border-amber-300 bg-amber-50 text-amber-800",
      cta: "ดูสถานะ",
    },
    rejected: {
      msg: "การยืนยันตัวตนอัตโนมัติไม่ผ่าน กรุณาแก้ไขข้อมูลและส่งใหม่",
      cls: "border-red-300 bg-red-50 text-red-700",
      cta: "แก้ไข KYC",
    },
    approved: { msg: "", cls: "", cta: "" },
  };
  const c = copy[status];
  if (!c?.msg) return null;
  return (
    <div className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${c.cls}`}>
      <p className="text-sm font-medium">{c.msg}</p>
      <button
        type="button"
        onClick={onGo}
        className="rounded-lg bg-[#1e40af] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
      >
        {c.cta}
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-2 text-center shadow-sm">
      <p className="text-xl font-bold text-[#1e40af]">{value}</p>
      <p className="text-[11px] text-text-muted">{label}</p>
    </div>
  );
}
