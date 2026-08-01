"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader, AdminCard, AdminStatusMessage } from "@/components/admin/AdminForm";
import type { VendorEarning } from "@/lib/commerce/earnings-types";

interface Payload {
  commission: { vendorShare: number; platformShare: number };
  summary: {
    salesCount: number;
    vendorTotalThb: number;
    platformTotalThb: number;
    grossThb: number;
  };
  earnings: VendorEarning[];
}

export default function CommissionsClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/commissions", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
        setData(await res.json());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "ผิดพลาด"));
  }, []);

  const vendorPct = Math.round((data?.commission.vendorShare ?? 0.7) * 100);
  const platformPct = Math.round((data?.commission.platformShare ?? 0.3) * 100);

  return (
    <div>
      <AdminPageHeader
        title="ส่วนแบ่งรายได้ (Commission)"
        description={`ผู้เขียนแบบตั้งราคาเอง · แบ่งอัตโนมัติ ${vendorPct}% ผู้เขียนแบบ / ${platformPct}% แพลตฟอร์ม · โอนเงินที่ /admin/payouts`}
      />
      <p className="mb-4 text-sm">
        <a href="/admin/payouts" className="font-semibold text-[#1e40af] hover:underline">
          → ไปหน้าโอนเงินผู้ขาย (Payouts)
        </a>
      </p>

      {error && (
        <div className="mb-4">
          <AdminStatusMessage type="error" message={error} />
        </div>
      )}

      {data && (
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <SummaryCard label="ยอดขายทั้งหมด" value={String(data.summary.salesCount)} />
          <SummaryCard label="ยอดรวม (THB)" value={`฿${data.summary.grossThb.toLocaleString()}`} />
          <SummaryCard
            label={`ผู้เขียนแบบ (${vendorPct}%)`}
            value={`฿${data.summary.vendorTotalThb.toLocaleString()}`}
          />
          <SummaryCard
            label={`แพลตฟอร์ม (${platformPct}%)`}
            value={`฿${data.summary.platformTotalThb.toLocaleString()}`}
          />
        </div>
      )}

      <AdminCard title="รายการล่าสุด">
        {!data ? (
          <p className="text-sm text-slate-500">กำลังโหลด…</p>
        ) : data.earnings.length === 0 ? (
          <p className="text-sm text-slate-400">ยังไม่มียอดขายที่บันทึกส่วนแบ่ง</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-2 pr-3">วันที่</th>
                  <th className="pb-2 pr-3">Vendor</th>
                  <th className="pb-2 pr-3">Order</th>
                  <th className="pb-2 pr-3">ยอดขาย</th>
                  <th className="pb-2 pr-3">Vendor 70%</th>
                  <th className="pb-2 pr-3">Platform 30%</th>
                  <th className="pb-2">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.earnings.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3 text-slate-500">
                      {new Date(e.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{e.ownerKey.slice(0, 12)}…</td>
                    <td className="py-2 pr-3 font-mono text-xs">{e.cartOrderId.slice(0, 16)}…</td>
                    <td className="py-2 pr-3">฿{e.grossThb.toLocaleString()}</td>
                    <td className="py-2 pr-3 font-semibold text-emerald-700">
                      ฿{e.vendorAmountThb.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      ฿{e.platformAmountThb.toLocaleString()}
                    </td>
                    <td className="py-2 text-xs">
                      {e.status === "paid_out"
                        ? "โอนแล้ว"
                        : e.status === "available"
                          ? "พร้อมโอน"
                          : "รอดำเนินการ"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
