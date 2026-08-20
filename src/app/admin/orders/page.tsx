"use client";

import { useEffect, useState } from "react";
import { FileText, MapPinned, RefreshCw, Truck } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";

type OrderLine = {
  housePlanId: string;
  supplierName: string;
  planName?: string;
};

type SitePlanInfoView = {
  provinceId?: string;
  provinceName: string;
  districtId?: string;
  districtName: string;
  landTitleDeedNumber: string;
};

type ShippingAddressView = {
  fullName: string;
  phone: string;
  line1: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  notes: string | null;
};

type OrderRow = {
  id: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  total: number;
  addons?: string[];
  hasSitePlanAddon?: boolean;
  hasHardcopyAddon?: boolean;
  lines: OrderLine[];
  housePlanIds: string[];
  supplierNames: string[];
  shippingAddress: ShippingAddressView | null;
  sitePlanInfo: SitePlanInfoView | null;
  pdfUrl: string | null;
  orderSummaryPdfPath: string | null;
  slipVerifiedAt?: string | null;
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
      setOrders((data.orders ?? []) as OrderRow[]);
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="คำสั่งซื้อที่ชำระแล้ว"
        description="จัดการออเดอร์หลังยืนยันสลิป — ที่อยู่จัดส่ง (ตำบล · อำเภอ) และข้อมูลแผนผังบริเวณสำหรับเขียนแบบ"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </button>
      </div>

      <AdminCard title="รายการคำสั่งซื้อ (Paid)">
        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลด…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-500">ยังไม่มีคำสั่งซื้อที่ชำระแล้ว</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const showSitePlan =
                o.hasSitePlanAddon || Boolean(o.sitePlanInfo);
              const showShipping =
                o.hasHardcopyAddon || Boolean(o.shippingAddress);
              return (
                <li
                  key={o.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {o.customerName || "—"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {o.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        ชำระเมื่อ {formatWhen(o.slipVerifiedAt || o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">
                        ฿{Math.round(o.total).toLocaleString("th-TH")}
                      </p>
                      {o.pdfUrl ? (
                        <a
                          href={o.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          เปิด PDF สรุปออเดอร์
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">ยังไม่มีไฟล์ PDF</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        ติดต่อลูกค้า
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        โทร: {o.customerPhone || "—"}
                      </p>
                      {o.customerEmail ? (
                        <p className="text-sm text-slate-600">{o.customerEmail}</p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        รหัสแบบบ้าน
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {o.housePlanIds.map((id) => (
                          <li key={id} className="font-mono text-sm text-slate-800">
                            {id}
                          </li>
                        ))}
                      </ul>
                      {o.lines.some((l) => l.planName) ? (
                        <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
                          {o.lines.map((l) =>
                            l.planName ? (
                              <li key={`${l.housePlanId}-${l.planName}`}>
                                {l.planName}
                              </li>
                            ) : null,
                          )}
                        </ul>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        ซัพพลายเออร์
                      </p>
                      <ul className="mt-1 space-y-0.5 text-sm text-slate-800">
                        {o.supplierNames.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {showShipping ? (
                    <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/70 p-3.5">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-sky-700" />
                        <h3 className="text-sm font-bold text-sky-950">
                          ที่อยู่จัดส่ง
                        </h3>
                        {o.hasHardcopyAddon ? (
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                            เอกสารรูปเล่ม
                          </span>
                        ) : null}
                      </div>

                      {o.shippingAddress ? (
                        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="sm:col-span-2 lg:col-span-3">
                            <dt className="text-xs font-medium text-sky-800/80">
                              ที่อยู่
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                              {o.shippingAddress.line1 || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-sky-800/80">
                              แขวง / ตำบล
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                              {o.shippingAddress.subDistrict || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-sky-800/80">
                              อำเภอ / เขต
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                              {o.shippingAddress.district || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-sky-800/80">
                              จังหวัด
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                              {o.shippingAddress.province || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-sky-800/80">
                              รหัสไปรษณีย์
                            </dt>
                            <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                              {o.shippingAddress.postalCode || "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-sky-800/80">
                              ผู้รับ
                            </dt>
                            <dd className="mt-0.5 text-sm text-slate-900">
                              {o.shippingAddress.fullName || "—"}
                              {o.shippingAddress.phone
                                ? ` · ${o.shippingAddress.phone}`
                                : ""}
                            </dd>
                          </div>
                          {o.shippingAddress.notes ? (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <dt className="text-xs font-medium text-sky-800/80">
                                หมายเหตุ
                              </dt>
                              <dd className="mt-0.5 text-sm text-slate-700">
                                {o.shippingAddress.notes}
                              </dd>
                            </div>
                          ) : null}
                        </dl>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-amber-800">
                          มีแอดออนเอกสารรูปเล่ม แต่ยังไม่มีที่อยู่จัดส่งในระบบ
                        </p>
                      )}
                    </div>
                  ) : null}

                  {showSitePlan ? (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5">
                      <div className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4 text-emerald-700" />
                        <h3 className="text-sm font-bold text-emerald-950">
                          ข้อมูลแผนผังบริเวณ
                        </h3>
                        {o.hasSitePlanAddon ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            แพ็กเกจมีแผนผังบริเวณ
                          </span>
                        ) : null}
                      </div>

                      {o.sitePlanInfo ? (
                        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <dt className="text-xs font-medium text-emerald-800/80">
                              จังหวัด
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                              {o.sitePlanInfo.provinceName}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-emerald-800/80">
                              อำเภอ / เขต
                            </dt>
                            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
                              {o.sitePlanInfo.districtName}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-emerald-800/80">
                              เลขโฉนดที่ดิน
                            </dt>
                            <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                              {o.sitePlanInfo.landTitleDeedNumber}
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-amber-800">
                          ออเดอร์นี้มีแอดออนแผนผังบริเวณ แต่ยังไม่มีข้อมูลจังหวัด /
                          อำเภอ / เลขโฉนดในระบบ — ติดต่อลูกค้าเพื่อขอข้อมูล
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
