"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ChevronRight, HardHat, X } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ContractorProfileCard } from "@/components/home-building/ContractorProfileCard";
import { ContractorRegistrationForm } from "@/components/home-building/ContractorRegistrationForm";
import { useBilingual } from "@/components/landing/useBilingual";
import type { HomeBuilder } from "@/lib/home-building/types";

/**
 * Public /home-building page — approved contractors only.
 * Registration opens in a modal and saves as pending.
 */
export function HomeBuildingPageClient() {
  const L = useBilingual();
  const [builders, setBuilders] = useState<HomeBuilder[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/home-builders", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { builders?: HomeBuilder[] }) => {
        if (!active) return;
        // API already returns approved + published only (demo only when DB empty).
        setBuilders(Array.isArray(data.builders) ? data.builders : []);
      })
      .catch(() => {
        if (active) setBuilders([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!registerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRegisterOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [registerOpen]);

  function openRegister() {
    setSuccessMsg(null);
    setRegisterOpen(true);
  }

  function handleRegistrationSuccess(message: string) {
    setRegisterOpen(false);
    setSuccessMsg(
      message ||
        "ส่งใบสมัครเรียบร้อยแล้ว ทีมงานจะตรวจสอบเอกสารก่อนเผยแพร่ — สถานะรออนุมัติจากผู้ดูแลระบบ",
    );
  }

  return (
    <div className="page-canvas">
      <LandingHeader />
      <main>
        <section className="border-b border-border/70 bg-gradient-to-b from-[#eef2f7] to-transparent">
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
            <nav className="mb-6 flex items-center gap-1.5 text-xs text-text-muted">
              <Link href="/" className="hover:text-[#1e40af]">
                {L("Home", "หน้าแรก")}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-text-secondary">{L("Home Building", "รับสร้างบ้าน")}</span>
            </nav>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e40af]/10 text-[#1e40af]">
              <HardHat className="h-6 w-6" strokeWidth={1.75} />
            </div>

            <h1 className="text-3xl font-bold text-[#1e3a5f] md:text-4xl">
              {L("Home Building", "รับสร้างบ้าน")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
              {L(
                "Browse trusted construction partners and contact them directly by phone or LINE.",
                "เลือกชมผู้รับสร้างที่ได้รับการอนุมัติ และติดต่อได้โดยตรงผ่านโทรศัพท์หรือ LINE",
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contractors"
                className="inline-flex rounded-md bg-[#1e40af] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
              >
                {L("Browse contractors", "ดูผู้รับสร้าง")}
              </a>
              <button
                type="button"
                onClick={openRegister}
                className="inline-flex rounded-md border border-border px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] hover:border-[#1e40af]/40 hover:text-[#1e40af]"
              >
                {L("Register as a builder", "สมัครเป็นผู้รับสร้างบ้าน")}
              </button>
            </div>

            {successMsg && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              >
                <p className="font-semibold">ส่งใบสมัครสำเร็จ</p>
                <p className="mt-0.5">{successMsg}</p>
                <button
                  type="button"
                  onClick={() => setSuccessMsg(null)}
                  className="mt-2 text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline"
                >
                  ปิดข้อความ
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="contractors" className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2b3a4a]">
              {L("Approved contractors", "ผู้รับสร้างที่ได้รับการอนุมัติ")}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {L(
                "Only verified partners appear here. Contact them directly by phone or LINE.",
                "แสดงเฉพาะผู้รับสร้างที่ผ่านการตรวจสอบแล้ว — ติดต่อได้โดยตรงผ่านโทรศัพท์หรือ LINE",
              )}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="h-[420px] animate-pulse rounded-2xl bg-surface-raised" />
              <div className="hidden h-[420px] animate-pulse rounded-2xl bg-surface-raised md:block" />
            </div>
          ) : builders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
              <p className="text-sm text-text-muted">
                {L(
                  "No approved contractors yet. Check back soon.",
                  "ยังไม่มีผู้รับสร้างที่เผยแพร่ในขณะนี้ กรุณากลับมาอีกครั้ง",
                )}
              </p>
              <button
                type="button"
                onClick={openRegister}
                className="mt-5 inline-flex rounded-md bg-[#1e40af] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
              >
                {L("Register as a builder", "สมัครเป็นผู้รับสร้างบ้าน")}
              </button>
            </div>
          ) : (
            <div className="mx-auto grid max-w-xl gap-8 md:mx-0 md:max-w-none md:grid-cols-2">
              {builders.map((builder) => (
                <ContractorProfileCard key={builder.id} builder={builder} />
              ))}
            </div>
          )}
        </section>
      </main>

      {registerOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            aria-label={L("Close", "ปิด")}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setRegisterOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[81] flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:mx-4 sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 id={titleId} className="text-lg font-bold text-[#1e3a5f]">
                {L("Builder registration", "สมัครเป็นผู้รับสร้างบ้าน")}
              </h2>
              <button
                type="button"
                onClick={() => setRegisterOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label={L("Close", "ปิด")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <ContractorRegistrationForm
                embedInModal
                onSubmitted={handleRegistrationSuccess}
                onCancel={() => setRegisterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
