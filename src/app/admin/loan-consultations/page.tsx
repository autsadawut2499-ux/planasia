"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import {
  LOAN_BUDGET_PRESETS,
  LOAN_OCCUPATION_OPTIONS,
  type LoanConsultation,
} from "@/lib/loan-consultation/types";

interface SettingsForm {
  expertLineOaUrl: string;
  expertLineUserId: string;
  lineChannelAccessToken: string;
  hasLineChannelAccessToken: boolean;
  hasEnvLineToken: boolean;
}

function money(n: number | null | undefined): string {
  if (n == null) return "—";
  return `฿${Math.round(n).toLocaleString("th-TH")}`;
}

function occupationTh(id: string | undefined): string {
  if (!id) return "—";
  return LOAN_OCCUPATION_OPTIONS.find((o) => o.id === id)?.th ?? id;
}

function budgetTh(n: number | null | undefined): string {
  if (n == null) return "—";
  const preset = LOAN_BUDGET_PRESETS.find((p) => p.value === n);
  return preset ? preset.th : money(n);
}

export default function AdminLoanConsultationsPage() {
  const [items, setItems] = useState<LoanConsultation[]>([]);
  const [settings, setSettings] = useState<SettingsForm>({
    expertLineOaUrl: "",
    expertLineUserId: "",
    lineChannelAccessToken: "",
    hasLineChannelAccessToken: false,
    hasEnvLineToken: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/loan-consultations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
      setItems(data.items ?? []);
      setSettings((prev) => ({
        ...prev,
        expertLineOaUrl: data.settings?.expertLineOaUrl ?? "",
        expertLineUserId: data.settings?.expertLineUserId ?? "",
        lineChannelAccessToken: "",
        hasLineChannelAccessToken: Boolean(data.settings?.hasLineChannelAccessToken),
        hasEnvLineToken: Boolean(data.settings?.hasEnvLineToken),
      }));
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    setSavingSettings(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/loan-consultations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            expertLineOaUrl: settings.expertLineOaUrl,
            expertLineUserId: settings.expertLineUserId,
            lineChannelAccessToken: settings.lineChannelAccessToken,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setSettings((prev) => ({
        ...prev,
        expertLineOaUrl: data.settings?.expertLineOaUrl ?? prev.expertLineOaUrl,
        expertLineUserId: data.settings?.expertLineUserId ?? prev.expertLineUserId,
        lineChannelAccessToken: "",
        hasLineChannelAccessToken: Boolean(data.settings?.hasLineChannelAccessToken),
        hasEnvLineToken: Boolean(data.settings?.hasEnvLineToken),
      }));
      setStatus({ type: "success", message: "บันทึกการตั้งค่า LINE OA แล้ว" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSavingSettings(false);
    }
  }

  async function setItemStatus(id: string, next: LoanConsultation["status"]) {
    setBusyId(id);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/loan-consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปเดตไม่สำเร็จ");
      setItems((prev) => prev.map((it) => (it.id === id ? data.item : it)));
      setStatus({ type: "success", message: "อัปเดตสถานะแล้ว" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ",
      });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดคำขอปรึกษาสินเชื่อ…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="ปรึกษาสินเชื่อบ้าน"
        description="ดูคำขอจากฟอร์มสาธารณะ · ดาวน์โหลด PDF · ตั้งค่า LINE OA ของผู้เชี่ยวชาญสำหรับรับไฟล์อัตโนมัติ"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-8">
      <AdminCard title="LINE OA ของผู้เชี่ยวชาญ">
        <p className="mb-4 text-sm text-slate-500">
          เมื่อมีคนส่งฟอร์ม ระบบจะสร้าง PDF แล้วส่งลิงก์ดาวน์โหลดไปยัง LINE ของผู้เชี่ยวชาญผ่าน
          Messaging API (LINE ไม่รองรับการแนบ PDF โดยตรง)
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField
            label="LINE OA Link"
            hint="เช่น https://line.me/R/ti/p/@yourid — ใช้ปุ่มติดต่อบนหน้าฟอร์ม"
          >
            <AdminInput
              value={settings.expertLineOaUrl}
              onChange={(e) =>
                setSettings((s) => ({ ...s, expertLineOaUrl: e.target.value }))
              }
              placeholder="https://line.me/R/ti/p/@…"
            />
          </AdminField>
          <AdminField
            label="Expert LINE User ID"
            hint="User ID ของผู้เชี่ยวชาญที่แอดบอท Messaging API เป็นเพื่อนแล้ว (ขึ้นต้นด้วย U) — ห้ามใส่ลิงก์ lin.ee"
          >
            <AdminInput
              value={settings.expertLineUserId}
              onChange={(e) =>
                setSettings((s) => ({ ...s, expertLineUserId: e.target.value }))
              }
              placeholder="U4af4980629…"
            />
          </AdminField>
          <AdminField
            label="LINE Channel Access Token"
            hint={
              settings.hasLineChannelAccessToken || settings.hasEnvLineToken
                ? `มีโทเค็นแล้ว${settings.hasEnvLineToken ? " (env)" : ""}${settings.hasLineChannelAccessToken ? " (บันทึกในแอดมิน)" : ""} — ใส่ใหม่เฉพาะเมื่อต้องการเปลี่ยน`
                : "จาก LINE Developers → Messaging API → Channel access token"
            }
          >
            <AdminInput
              type="password"
              autoComplete="off"
              value={settings.lineChannelAccessToken}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  lineChannelAccessToken: e.target.value,
                }))
              }
              placeholder={
                settings.hasLineChannelAccessToken || settings.hasEnvLineToken
                  ? "•••••••• (เว้นว่างไว้ถ้าไม่เปลี่ยน)"
                  : "Channel access token"
              }
            />
          </AdminField>
        </div>

        <div className="mt-5">
          <AdminSaveButton
            saving={savingSettings}
            onClick={() => void saveSettings()}
            label="บันทึกการตั้งค่า LINE"
          />
        </div>
      </AdminCard>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        คำขอล่าสุด ({items.length})
      </h2>

      {items.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-slate-500">ยังไม่มีคำขอปรึกษา</p>
        </AdminCard>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">วันที่</th>
                <th className="px-4 py-3 font-semibold">รหัสแบบ</th>
                <th className="px-4 py-3 font-semibold">ชื่อ / โทร</th>
                <th className="px-4 py-3 font-semibold">อาชีพ / รายได้ / งบ</th>
                <th className="px-4 py-3 font-semibold">หมายเหตุ</th>
                <th className="px-4 py-3 font-semibold">LINE / PDF</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => (
                <tr key={it.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {new Date(it.createdAt).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {it.planCode || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{it.fullName}</div>
                    <div className="text-slate-500">{it.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{occupationTh(it.occupation || undefined)}</div>
                    <div>{money(it.monthlyIncomeThb)}</div>
                    <div>{budgetTh(it.constructionBudgetThb)}</div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-slate-600">
                    <p className="line-clamp-3 whitespace-pre-wrap">{it.notes || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {it.pdfStoragePath ? (
                      <a
                        href={`/api/admin/loan-consultations/pdf?id=${encodeURIComponent(it.id)}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    ) : (
                      <span className="text-slate-400">ไม่มี PDF</span>
                    )}
                    <div className="mt-1 text-[11px] text-slate-500">
                      {it.lineNotifiedAt
                        ? `LINE ส่งแล้ว ${new Date(it.lineNotifiedAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}`
                        : it.lineNotifyError
                          ? `LINE: ${it.lineNotifyError}`
                          : "LINE ยังไม่ส่ง"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                      value={it.status}
                      disabled={busyId === it.id}
                      onChange={(e) =>
                        void setItemStatus(
                          it.id,
                          e.target.value as LoanConsultation["status"],
                        )
                      }
                    >
                      <option value="new">ใหม่</option>
                      <option value="contacted">ติดต่อแล้ว</option>
                      <option value="closed">ปิดแล้ว</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
