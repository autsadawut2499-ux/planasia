"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Banknote, RefreshCw } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import type { PayoutBatch, VendorPayoutDueRow } from "@/lib/commerce/earnings-types";

interface Payload {
  summary: {
    vendorsDue: number;
    availableTotalThb: number;
    missingBankDetails: number;
  };
  vendors: VendorPayoutDueRow[];
  batches: PayoutBatch[];
}

export default function PayoutsClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [onlyDue, setOnlyDue] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payouts", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "โหลดไม่สำเร็จ");
      setData(json as Payload);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    const list = data?.vendors ?? [];
    return onlyDue ? list.filter((v) => v.availableThb > 0) : list;
  }, [data, onlyDue]);

  const selectedTotal = useMemo(() => {
    return rows
      .filter((r) => selected.has(r.ownerKey))
      .reduce((s, r) => s + r.availableThb, 0);
  }, [rows, selected]);

  function toggle(ownerKey: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ownerKey)) next.delete(ownerKey);
      else next.add(ownerKey);
      return next;
    });
  }

  function toggleAllDue() {
    const dueKeys = rows.filter((r) => r.availableThb > 0).map((r) => r.ownerKey);
    const allSelected = dueKeys.every((k) => selected.has(k));
    setSelected(allSelected ? new Set() : new Set(dueKeys));
  }

  async function markPaid() {
    const ownerKeys = Array.from(selected);
    if (ownerKeys.length === 0) {
      setError("เลือกผู้ขายอย่างน้อย 1 คน");
      return;
    }
    const missingBank = rows.filter(
      (r) => selected.has(r.ownerKey) && r.availableThb > 0 && !r.hasBankDetails,
    );
    if (missingBank.length > 0) {
      const ok = confirm(
        `${missingBank.length} รายการยังไม่มีบัญชีธนาคารครบ — ยืนยันว่าโอนนอกระบบแล้วและจะมาร์กว่าโอนแล้ว?`,
      );
      if (!ok) return;
    } else if (
      !confirm(
        `ยืนยันบันทึกโอนให้ ${ownerKeys.length} ผู้ขาย รวม ฿${selectedTotal.toLocaleString("th-TH")} ?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/payouts/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerKeys, note: note.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "บันทึกไม่สำเร็จ");
      setSuccess(json.message ?? "บันทึกโอนแล้ว");
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="โอนเงินผู้ขาย (Payouts)"
        description="ดูยอดพร้อมโอน + บัญชีธนาคาร → ส่งออก CSV → โอนนอกระบบ → กดบันทึกโอนแล้ว (mark paid)"
      />

      {(error || success) && (
        <div className="mb-4 space-y-2">
          {error && <AdminStatusMessage type="error" message={error} />}
          {success && <AdminStatusMessage type="success" message={success} />}
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="ผู้ขายที่รอโอน"
          value={String(data?.summary.vendorsDue ?? "—")}
        />
        <SummaryCard
          label="ยอดพร้อมโอนรวม"
          value={
            data
              ? `฿${data.summary.availableTotalThb.toLocaleString("th-TH")}`
              : "—"
          }
        />
        <SummaryCard
          label="ขาดข้อมูลบัญชี"
          value={String(data?.summary.missingBankDetails ?? "—")}
          warn={Boolean(data && data.summary.missingBankDetails > 0)}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </button>
        <a
          href="/api/admin/payouts/export"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          ส่งออก CSV
        </a>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyDue}
            onChange={(e) => setOnlyDue(e.target.checked)}
          />
          แสดงเฉพาะที่มียอดรอโอน
        </label>
      </div>

      <AdminCard title="คิวโอนเงิน">
        {loading && !data ? (
          <p className="text-sm text-slate-500">กำลังโหลด…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-400">ไม่มีรายการในคิวโอน</p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  หมายเหตุรอบโอน (ถ้ามี)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น โอนรอบ 31 ก.ค. 68"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => void markPaid()}
                disabled={busy || selected.size === 0}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Banknote className="h-4 w-4" />
                {busy
                  ? "กำลังบันทึก…"
                  : `บันทึกโอนแล้ว (${selected.size}) · ฿${selectedTotal.toLocaleString("th-TH")}`}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-2 pr-2">
                      <input
                        type="checkbox"
                        aria-label="เลือกทั้งหมดที่รอโอน"
                        checked={
                          rows.filter((r) => r.availableThb > 0).length > 0 &&
                          rows
                            .filter((r) => r.availableThb > 0)
                            .every((r) => selected.has(r.ownerKey))
                        }
                        onChange={toggleAllDue}
                      />
                    </th>
                    <th className="pb-2 pr-3">ผู้ขาย</th>
                    <th className="pb-2 pr-3">พร้อมโอน</th>
                    <th className="pb-2 pr-3">โอนแล้วสะสม</th>
                    <th className="pb-2 pr-3">บัญชี</th>
                    <th className="pb-2">สถานะบัญชี</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((v) => (
                    <tr key={v.ownerKey} className="border-t border-slate-100">
                      <td className="py-2.5 pr-2 align-top">
                        <input
                          type="checkbox"
                          disabled={v.availableThb <= 0}
                          checked={selected.has(v.ownerKey)}
                          onChange={() => toggle(v.ownerKey)}
                        />
                      </td>
                      <td className="py-2.5 pr-3 align-top">
                        <p className="font-medium text-slate-900">
                          {v.displayName || "— ไม่มีชื่อโปรไฟล์ —"}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {v.ownerKey.slice(0, 20)}
                          {v.ownerKey.length > 20 ? "…" : ""}
                        </p>
                        {v.contactEmail && (
                          <p className="text-xs text-slate-500">{v.contactEmail}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 align-top font-semibold text-emerald-700">
                        ฿{v.availableThb.toLocaleString("th-TH")}
                        <p className="text-[11px] font-normal text-slate-400">
                          {v.availableLineCount} รายการ
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 align-top text-slate-600">
                        ฿{v.paidOutThb.toLocaleString("th-TH")}
                      </td>
                      <td className="py-2.5 pr-3 align-top text-xs text-slate-600">
                        {v.bankName ? <p>{v.bankName}</p> : <p className="text-slate-400">—</p>}
                        {v.accountName && <p>{v.accountName}</p>}
                        {v.accountNumber && (
                          <p className="font-mono">{v.accountNumber}</p>
                        )}
                      </td>
                      <td className="py-2.5 align-top">
                        {v.hasBankDetails ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            พร้อมโอน
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            ขาดบัญชี
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminCard>

      <div className="mt-6">
        <AdminCard title="ประวัติรอบโอน">
          {!data?.batches?.length ? (
            <p className="text-sm text-slate-400">ยังไม่มีรอบโอนที่บันทึก</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-2 pr-3">วันที่</th>
                    <th className="pb-2 pr-3">โดย</th>
                    <th className="pb-2 pr-3">จำนวนรายการ</th>
                    <th className="pb-2 pr-3">ยอดรวม</th>
                    <th className="pb-2">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.batches.map((b) => (
                    <tr key={b.id} className="border-t border-slate-100">
                      <td className="py-2 pr-3 text-slate-500">
                        {new Date(b.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="py-2 pr-3 text-xs">{b.createdBy}</td>
                      <td className="py-2 pr-3">{b.lineCount}</td>
                      <td className="py-2 pr-3 font-semibold text-emerald-700">
                        ฿{b.vendorTotalThb.toLocaleString("th-TH")}
                      </td>
                      <td className="py-2 text-slate-600">{b.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${warn ? "text-amber-700" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}
