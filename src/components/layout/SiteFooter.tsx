"use client";

import Link from "next/link";
import {
  Clock,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useSiteConfig } from "@/context/SiteConfigContext";

interface SiteFooterProps {
  variant?: "light" | "dark";
}

const POLICY_LINKS = [
  {
    href: "/refund",
    label: "นโยบายการคืนสินค้า",
    hint: "ไม่รับคืนหลังดำเนินการคำสั่งซื้อ",
  },
  {
    href: "/privacy",
    label: "นโยบายความเป็นส่วนตัว",
    hint: "คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
  },
  {
    href: "/terms",
    label: "เงื่อนไขและข้อตกลงการใช้บริการ",
    hint: "ลิขสิทธิ์และ Construction License",
  },
  {
    href: "/construction",
    label: "ข้อกำหนดด้านการก่อสร้าง",
    hint: "รหัสอาคารและความรับผิดชอบท้องถิ่น",
  },
  {
    href: "/shipping",
    label: "นโยบายการจัดส่งสินค้า",
    hint: "การส่งมอบไฟล์ดิจิทัลทันที",
  },
] as const;

/**
 * World-class storefront footer — Thai copy, trust/payment zones,
 * policies, contact, and copyright. Dark premium surface for conversion.
 */
export function SiteFooter({ variant: _variant = "light" }: SiteFooterProps) {
  const { settings, cmsText } = useSiteConfig();
  const { brand, footer } = settings;
  const year = new Date().getFullYear();
  const storeName = footer.organizationName?.trim() || brand.name;
  const adminLabel = cmsText("footer", "adminLabel", "ผู้ดูแลระบบ");
  const businessHours =
    cmsText("footer", "businessHours", "") || "จันทร์ – ศุกร์ 09:00 – 18:00 น.";

  const copyright =
    footer.copyrightText?.includes("{year}")
      ? footer.copyrightText.replace("{year}", String(year))
      : `© ${year} ${storeName}. All Rights Reserved.`;

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0b1220] text-slate-300">
      {/* Soft depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(30,64,175,0.22),transparent)]"
        aria-hidden
      />

      {/* ── Zone 1: Payment & Security ── */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:py-7">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="mr-1 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:inline">
              ช่องทางชำระเงิน
            </span>
            <PaymentBadge label="Visa">
              <VisaMark />
            </PaymentBadge>
            <PaymentBadge label="Mastercard">
              <MastercardMark />
            </PaymentBadge>
            <PaymentBadge label="JCB">
              <JcbMark />
            </PaymentBadge>
            <PaymentBadge label="PromptPay">
              <PromptPayMark />
            </PaymentBadge>
          </div>

          <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-emerald-300">
            <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
            <p className="text-xs font-medium tracking-wide sm:text-[13px]">
              ระบบชำระเงินปลอดภัยด้วย SSL 256-bit
            </p>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          </div>
        </div>
      </div>

      {/* ── Zones 2–3: Policies + Contact ── */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 md:gap-12 lg:grid-cols-12 lg:py-14">
        {/* Brand blurb — official PLANASIA wordmark (wide tracking + apex chevron) */}
        <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left">
          <BrandLogo variant="dark" centered className="w-full lg:w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            ตลาดกลางแบบบ้านและแปลนพิมพ์เขียวดิจิทัล
            — ดาวน์โหลดไฟล์ได้ทันทีหลังชำระเงิน
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
            <Link
              href="/store"
              className="inline-flex items-center rounded-md bg-[#1e40af] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              เลือกชมแบบบ้าน
            </Link>
            <Link
              href="/admin"
              title={adminLabel}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#3b82f6]/45 bg-[#1e40af]/25 px-4 py-2 text-xs font-semibold text-[#93c5fd] transition hover:border-[#60a5fa] hover:bg-[#1e40af]/45 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              {adminLabel}
            </Link>
          </div>
        </div>

        {/* Zone 2: Policy links */}
        <div className="lg:col-span-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            นโยบายและข้อกำหนด
          </h2>
          <ul className="mt-5 space-y-3.5">
            {POLICY_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group block rounded-lg outline-none transition hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
                >
                  <span className="text-sm font-medium text-slate-200 transition group-hover:text-white">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500 group-hover:text-slate-400">
                    {item.hint}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Zone 3: Contact & business */}
        <div className="lg:col-span-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            ติดต่อและข้อมูลธุรกิจ
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500">ชื่อบริษัท / ชื่อร้านค้า</dt>
              <dd className="mt-1 font-medium text-white">{storeName}</dd>
            </div>

            {footer.contactEmail && (
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#60a5fa]" aria-hidden />
                <div>
                  <dt className="text-xs text-slate-500">อีเมลฝ่ายสนับสนุน</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`mailto:${footer.contactEmail}`}
                      className="font-medium text-slate-200 underline-offset-2 transition hover:text-white hover:underline"
                    >
                      {footer.contactEmail}
                    </a>
                  </dd>
                </div>
              </div>
            )}

            {footer.contactPhone?.trim() && (
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#60a5fa]" aria-hidden />
                <div>
                  <dt className="text-xs text-slate-500">เบอร์โทรศัพท์</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`tel:${footer.contactPhone.replace(/\s/g, "")}`}
                      className="font-medium text-slate-200 underline-offset-2 transition hover:text-white hover:underline"
                    >
                      {footer.contactPhone}
                    </a>
                  </dd>
                </div>
              </div>
            )}

            {footer.address?.trim() && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#60a5fa]" aria-hidden />
                <div>
                  <dt className="text-xs text-slate-500">ที่อยู่สำนักงาน</dt>
                  <dd className="mt-0.5 leading-relaxed text-slate-200">{footer.address}</dd>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#60a5fa]" aria-hidden />
              <div>
                <dt className="text-xs text-slate-500">เวลาทำการ</dt>
                <dd className="mt-0.5 font-medium text-slate-200">{businessHours}</dd>
              </div>
            </div>
          </dl>

          {footer.socialLinks.some((s) => s.url) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {footer.socialLinks
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
                  >
                    {s.label ?? s.platform}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Zone 4: Copyright & trust ── */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-6 sm:px-8 md:flex-row md:py-7">
          <p className="text-center text-xs text-slate-500 md:text-left">
            {copyright.includes("All Rights Reserved")
              ? copyright
              : `© ${year} ${storeName}. All Rights Reserved.`}
            <span className="mt-1 block text-[11px] text-slate-600 md:mt-0 md:ml-2 md:inline">
              สงวนลิขสิทธิ์ — แบบบ้านและไฟล์ดิจิทัลทั้งหมด
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
            <Link
              href="/privacy"
              className="text-[11px] text-slate-500 transition hover:text-slate-300"
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PaymentBadge({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex h-9 min-w-[52px] items-center justify-center rounded-md border border-white/10 bg-white px-2.5 shadow-sm transition hover:border-white/25 hover:shadow"
      title={label}
      aria-label={label}
    >
      {children}
    </span>
  );
}

function VisaMark() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-11" aria-hidden>
      <text
        x="0"
        y="13"
        fill="#1a1f71"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg viewBox="0 0 38 24" className="h-5 w-8" aria-hidden>
      <circle cx="14" cy="12" r="8" fill="#eb001b" />
      <circle cx="24" cy="12" r="8" fill="#f79e1b" />
      <path
        d="M19 6.2a8 8 0 0 1 0 11.6 8 8 0 0 1 0-11.6z"
        fill="#ff5f00"
      />
    </svg>
  );
}

function JcbMark() {
  return (
    <svg viewBox="0 0 40 16" className="h-4 w-10" aria-hidden>
      <rect x="0" y="1" width="12" height="14" rx="2" fill="#0e4c96" />
      <rect x="14" y="1" width="12" height="14" rx="2" fill="#e11b22" />
      <rect x="28" y="1" width="12" height="14" rx="2" fill="#1f9a4a" />
      <text x="2.2" y="11.2" fill="#fff" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif">
        J
      </text>
      <text x="16.5" y="11.2" fill="#fff" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif">
        C
      </text>
      <text x="30.8" y="11.2" fill="#fff" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif">
        B
      </text>
    </svg>
  );
}

function PromptPayMark() {
  return (
    <svg viewBox="0 0 72 20" className="h-4 w-14" aria-hidden>
      <rect x="0" y="2" width="16" height="16" rx="2" fill="#1e40af" />
      <path
        d="M4 6h8v2H6v2h5v2H6v2h6v2H4V6z"
        fill="#fff"
        opacity="0.95"
      />
      <text
        x="20"
        y="14"
        fill="#0f172a"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        fontWeight="700"
      >
        PromptPay
      </text>
    </svg>
  );
}
