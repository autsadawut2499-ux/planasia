"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader, AdminCard, AdminStatusMessage } from "@/components/admin/AdminForm";
import type { VendorEarning } from "@/lib/commerce/earnings-types";

interface Payload {
  summary: {
    salesCount: number;
    grossThb: number;
    costThb: number;
    profitThb: number;
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

  return (
    <div>
      <AdminPageHeader
        title="ต้นทุน / กำไร"
        description="เมื่อขายแบบได้ ระบบบันทึกยอดขาย ต้นทุนซัพพลายเออร์ และกำไรอัตโนมัติจากราคาในแคตตาล็อก"
      />

      {error && (
        <div className="mb-4">
          <AdminStatusMessage type="error" message={error} />
        </div>
      )}

      {data && (
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <SummaryCard label="จำนวนออเดอร์ที่ขาย" value={String(data.summary.salesCount)} />
          <SummaryCard
            label="ยอดขายรวม"
            value={`฿${data.summary.grossThb.toLocaleString("th-TH")}`}
          />
          <SummaryCard
            label="ต้นทุนรวม"
            value={`฿${data.summary.costThb.toLocaleString("th-TH")}`}
          />
          <SummaryCard
            label="กำไรรวม"
            value={`฿${data.summary.profitThb.toLocaleString("th-TH")}`}
            highlight={data.summary.profitThb >= 0}
          />
        </div>
      )}

      <AdminCard title="รายการขายล่าสุด">
        {!data ? (
          <p className="text-sm text-slate-500">กำลังโหลด…</p>
        ) : data.earnings.length === 0 ? (
          <p className="text-sm text-slate-400">ยังไม่มียอดขายที่บันทึกต้นทุน/กำไร</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-2 pr-3">วันที่</th>
                  <th className="pb-2 pr-3">รหัส / ชื่อแบบ</th>
                  <th className="pb-2 pr-3">ซัพพลายเออร์</th>
                  <th className="pb-2 pr-3">ยอดขาย</th>
                  <th className="pb-2 pr-3">ต้นทุน</th>
                  <th className="pb-2 pr-3">กำไร</th>
                  <th className="pb-2">Order</th>
                </tr>
              </thead>
              <tbody>
                {data.earnings.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3 text-slate-500">
                      {new Date(e.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pr-3">
                      <p className="font-mono text-xs text-slate-500">
                        #{e.planCode || e.listingId.slice(0, 8)}
                      </p>
                      <p className="font-medium text-slate-900">{e.listingName || "—"}</p>
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{e.supplierName || "—"}</td>
                    <td className="py-2 pr-3">฿{e.grossThb.toLocaleString("th-TH")}</td>
                    <td className="py-2 pr-3 text-slate-700">
                      ฿{e.costThb.toLocaleString("th-TH")}
                    </td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        e.profitThb >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      ฿{e.profitThb.toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 font-mono text-xs text-slate-500">
                      {e.cartOrderId.slice(0, 16)}…
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

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          highlight === undefined
            ? "text-slate-900"
            : highlight
              ? "text-emerald-700"
              : "text-red-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
