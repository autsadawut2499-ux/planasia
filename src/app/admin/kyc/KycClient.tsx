"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Clock, XCircle, ShieldAlert } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminStatusMessage } from "@/components/admin/AdminForm";
import { displayAssetUrl } from "@/lib/assets/display-url";
import { asiaCountryLabel } from "@/lib/geo/asia-countries";
import type { VendorKycSubmission, VerificationStatus, KycDocType } from "@/lib/supabase/vendors";

const DOC_TYPE_LABEL: Record<KycDocType, string> = {
  national_id: "บัตรประชาชน",
  passport: "หนังสือเดินทาง",
  driver_license: "ใบขับขี่",
  professional_license: "ใบประกอบวิชาชีพ",
};

const STATUS_UI: Record<VerificationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  unverified: { label: "ยังไม่ยืนยัน", cls: "bg-slate-100 text-slate-600", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  pending: { label: "ค้าง (legacy)", cls: "bg-amber-100 text-amber-700", icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: "AI อนุมัติแล้ว", cls: "bg-green-100 text-green-700", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
  rejected: { label: "AI ไม่ผ่าน", cls: "bg-red-100 text-red-700", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const TABS: Array<[VerificationStatus | "all", string]> = [
  ["approved", "AI อนุมัติ"],
  ["rejected", "AI ไม่ผ่าน"],
  ["pending", "ค้าง (legacy)"],
  ["all", "ทั้งหมด"],
];

export default function KycClient() {
  const [tab, setTab] = useState<VerificationStatus | "all">("approved");
  const [items, setItems] = useState<VendorKycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = tab === "all" ? "" : `?status=${tab}`;
      const res = await fetch(`/api/admin/kyc${q}`, { cache: "no-store" });
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setItems(data.submissions ?? []);
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ผิดพลาด" });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(ownerKey: string, decision: "approved" | "rejected") {
    let reason: string | undefined;
    if (decision === "rejected") {
      reason = window.prompt("ระบุเหตุผลที่ไม่ผ่านการตรวจสอบ") ?? undefined;
      if (!reason || !reason.trim()) return;
    }
    setBusy(ownerKey);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerKey, decision, reason }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "ทำรายการไม่สำเร็จ");
      setStatus({ type: "success", message: decision === "approved" ? "อนุมัติ KYC แล้ว" : "ปฏิเสธ KYC แล้ว" });
      await load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ผิดพลาด" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="KYC Audit (Digital Auto)"
        description="KYC ตรวจอัตโนมัติด้วยระบบดิจิทัล/AI แล้ว — หน้านี้ใช้สำหรับ audit และ override เท่านั้น ไม่ใช่คิวอนุมัติด้วยมือ"
      />

      {status && (
        <div className="mb-4">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === value ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">กำลังโหลด…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
          ไม่มีรายการในสถานะนี้
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((s) => {
            const ui = STATUS_UI[s.status];
            return (
              <AdminCard key={s.ownerKey}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {s.kyc?.legalName || s.displayName || "(ไม่ระบุชื่อ)"}
                      </h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ui.cls}`}>
                        {ui.icon}
                        {ui.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {s.displayName ? `ร้าน: ${s.displayName} · ` : ""}
                      {s.contactEmail ?? s.ownerKey}
                    </p>
                  </div>
                  {s.status !== "approved" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy === s.ownerKey}
                        onClick={() => review(s.ownerKey, "approved")}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Override อนุมัติ
                      </button>
                      {s.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={busy === s.ownerKey}
                          onClick={() => review(s.ownerKey, "rejected")}
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          Override ปฏิเสธ
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === s.ownerKey}
                      onClick={() => review(s.ownerKey, "rejected")}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Revoke
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <dl className="space-y-1.5 text-sm">
                    <Row label="ประเทศที่ออกเอกสาร" value={asiaCountryLabel(s.countryCode)} />
                    <Row label="ประเภทเอกสาร" value={s.kyc ? DOC_TYPE_LABEL[s.kyc.docType] : "—"} />
                    <Row label="เลขที่เอกสาร" value={s.kyc?.docNumber ?? "—"} />
                    {s.kyc?.dateOfBirth && <Row label="วันเกิด" value={s.kyc.dateOfBirth} />}
                    {s.kyc?.address && <Row label="ที่อยู่" value={s.kyc.address} />}
                    {s.note && <Row label="หมายเหตุ" value={s.note} />}
                    {s.submittedAt && (
                      <Row label="ส่งเมื่อ" value={new Date(s.submittedAt).toLocaleString("th-TH")} />
                    )}
                    {s.reviewedAt && (
                      <Row label="ตรวจโดย" value={`${s.reviewedBy ?? ""} · ${new Date(s.reviewedAt).toLocaleString("th-TH")}`} />
                    )}
                    {s.rejectReason && <Row label="เหตุผลที่ไม่ผ่าน" value={s.rejectReason} />}
                  </dl>

                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-slate-500">เอกสารแนบ ({s.documents.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {s.documents.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-24 w-20 overflow-hidden rounded-lg border border-slate-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displayAssetUrl(url)}
                            alt={`doc ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ))}
                      {s.documents.length === 0 && <span className="text-xs text-slate-400">— ไม่มีเอกสาร —</span>}
                    </div>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-slate-400">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
