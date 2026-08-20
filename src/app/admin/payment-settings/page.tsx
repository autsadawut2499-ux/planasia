"use client";

import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminCheckbox,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface FormState {
  bankName: string;
  accountName: string;
  accountNumber: string;
  promptPayId: string;
  qrCodeImageUrl: string;
  transferNote: string;
  slipmateConfigured: boolean;
  smsConfigured: boolean;
  notifyBuyerSms: boolean;
  notifyAdminLine: boolean;
  adminLineUserId: string;
  lineChannelAccessToken: string;
  hasLineToken: boolean;
  lineTokenSource: string;
  adminLineUserIdValid: boolean;
  adminLineUserIdLooksLikeUrl: boolean;
}

const EMPTY: FormState = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  promptPayId: "",
  qrCodeImageUrl: "",
  transferNote: "",
  slipmateConfigured: false,
  smsConfigured: false,
  notifyBuyerSms: true,
  notifyAdminLine: true,
  adminLineUserId: "",
  lineChannelAccessToken: "",
  hasLineToken: false,
  lineTokenSource: "none",
  adminLineUserIdValid: false,
  adminLineUserIdLooksLikeUrl: false,
};

export default function AdminPaymentSettingsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/payment-settings", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
        return data;
      })
      .then((data) => {
        const s = data.settings;
        const n = s.orderNotify ?? {};
        setForm({
          bankName: s.bank?.bankName ?? "",
          accountName: s.bank?.accountName ?? "",
          accountNumber: s.bank?.accountNumber ?? "",
          promptPayId: s.bank?.promptPayId ?? "",
          qrCodeImageUrl: s.bank?.qrCodeImageUrl ?? "",
          transferNote: s.bank?.transferNote ?? "",
          slipmateConfigured: Boolean(s.slipmateConfigured),
          smsConfigured: Boolean(s.smsConfigured),
          notifyBuyerSms: n.notifyBuyerSms !== false,
          notifyAdminLine: n.notifyAdminLine !== false,
          adminLineUserId: n.adminLineUserId ?? "",
          lineChannelAccessToken: "",
          hasLineToken: Boolean(n.hasLineToken),
          lineTokenSource: n.lineTokenSource ?? "none",
          adminLineUserIdValid: Boolean(n.adminLineUserIdValid),
          adminLineUserIdLooksLikeUrl: Boolean(n.adminLineUserIdLooksLikeUrl),
        });
      })
      .catch((err) =>
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            bank: {
              bankName: form.bankName,
              accountName: form.accountName,
              accountNumber: form.accountNumber,
              promptPayId: form.promptPayId,
              qrCodeImageUrl: form.qrCodeImageUrl,
              transferNote: form.transferNote,
            },
          },
          orderNotify: {
            notifyBuyerSms: form.notifyBuyerSms,
            notifyAdminLine: form.notifyAdminLine,
            adminLineUserId: form.adminLineUserId,
            ...(form.lineChannelAccessToken.trim()
              ? { lineChannelAccessToken: form.lineChannelAccessToken.trim() }
              : {}),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      const s = data.settings;
      const n = s.orderNotify ?? {};
      setForm((prev) => ({
        ...prev,
        bankName: s.bank?.bankName ?? prev.bankName,
        accountName: s.bank?.accountName ?? prev.accountName,
        accountNumber: s.bank?.accountNumber ?? prev.accountNumber,
        promptPayId: s.bank?.promptPayId ?? prev.promptPayId,
        qrCodeImageUrl: s.bank?.qrCodeImageUrl ?? prev.qrCodeImageUrl,
        transferNote: s.bank?.transferNote ?? prev.transferNote,
        slipmateConfigured: Boolean(s.slipmateConfigured),
        smsConfigured: Boolean(s.smsConfigured),
        notifyBuyerSms: n.notifyBuyerSms !== false,
        notifyAdminLine: n.notifyAdminLine !== false,
        adminLineUserId: n.adminLineUserId ?? "",
        lineChannelAccessToken: "",
        hasLineToken: Boolean(n.hasLineToken),
        lineTokenSource: n.lineTokenSource ?? "none",
        adminLineUserIdValid: Boolean(n.adminLineUserIdValid),
        adminLineUserIdLooksLikeUrl: Boolean(n.adminLineUserIdLooksLikeUrl),
      }));
      setStatus({ type: "success", message: "บันทึกการตั้งค่าการชำระเงินแล้ว" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดการตั้งค่าการชำระเงิน…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="การตั้งค่าการชำระเงิน"
        description="บัญชีธนาคาร · SlipMate · แจ้งเตือนหลังชำระเงิน (SMS ลูกค้า + LINE แอดมิน)"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="space-y-6">
        <AdminCard title="จัดการบัญชีธนาคาร (Bank Account Management)">
          <p className="mb-4 text-sm text-slate-500">
            ข้อมูลนี้จะแสดงบนหน้า Checkout ให้ลูกค้าโอนเงิน
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="ชื่อธนาคาร (Bank Name)">
              <AdminInput
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="เช่น กสิกรไทย / SCB / กรุงไทย"
              />
            </AdminField>
            <AdminField label="ชื่อบัญชี (Account Name)">
              <AdminInput
                value={form.accountName}
                onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                placeholder="ชื่อบัญชีรับโอน"
              />
            </AdminField>
            <AdminField label="เลขบัญชี (Account Number)">
              <AdminInput
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                placeholder="xxx-x-xxxxx-x"
              />
            </AdminField>
            <AdminField label="พร้อมเพย์ (ถ้ามี)" hint="เบอร์โทร / เลขบัตร / e-wallet">
              <AdminInput
                value={form.promptPayId}
                onChange={(e) => setForm((f) => ({ ...f, promptPayId: e.target.value }))}
              />
            </AdminField>
            <div className="sm:col-span-2">
              <ImageUploadField
                label="QR Code Image (อัปโหลดรูป QR Code ของเรา)"
                hint="แสดงบนหน้าชำระเงินให้ลูกค้าสแกนโอน — JPG / PNG / WEBP (สูงสุด 10MB)"
                value={form.qrCodeImageUrl || null}
                onChange={(url) =>
                  setForm((f) => ({ ...f, qrCodeImageUrl: url ?? "" }))
                }
                category="payment-qr"
                previewClassName="h-40 w-40"
                deleteFromStorageOnClear={false}
              />
            </div>
            <div className="sm:col-span-2">
              <AdminField label="หมายเหตุการโอน">
                <AdminTextarea
                  value={form.transferNote}
                  onChange={(e) => setForm((f) => ({ ...f, transferNote: e.target.value }))}
                  rows={2}
                />
              </AdminField>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="ตรวจสลิปอัตโนมัติ (SlipMate)">
          <p className="text-sm text-slate-600">
            API Key ถูกตั้งค่าใน environment variable{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">SLIPMATE_API_KEY</code>{" "}
            บน Vercel (Settings → Environment Variables → Production) แล้ว Redeploy —
            ไม่แสดงและไม่แก้ไขจากแอดมิน
          </p>
          <p
            className={`mt-3 text-sm font-medium ${
              form.slipmateConfigured ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {form.slipmateConfigured
              ? "สถานะ: SlipMate พร้อมใช้งาน"
              : "สถานะ: ยังไม่พบ SLIPMATE_API_KEY — สลิปที่อัปโหลดจะเข้าคิวรอตรวจสอบด้วยมือ"}
          </p>
        </AdminCard>

        <AdminCard title="แจ้งเตือนหลังชำระเงินสำเร็จ">
          <p className="mb-4 text-sm text-slate-600">
            เมื่อ SlipMate ยืนยันสลิปแล้ว ระบบจะส่ง SMS ไปยังเบอร์ลูกค้า และส่งข้อความเข้า
            LINE ของแอดมินผ่าน Messaging API
          </p>

          <div className="space-y-4">
            <AdminCheckbox
              label="ส่ง SMS หาลูกค้า (ใช้เบอร์ที่กรอกตอน checkout)"
              checked={form.notifyBuyerSms}
              onChange={(checked) =>
                setForm((f) => ({ ...f, notifyBuyerSms: checked }))
              }
            />
            <p
              className={`text-sm ${
                form.smsConfigured ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {form.smsConfigured
                ? "สถานะ SMS: พร้อม (ThaiBulkSMS / Twilio)"
                : "สถานะ SMS: ยังไม่พร้อม — ตั้ง THAIBULKSMS_API_KEY + SECRET ใน environment"}
            </p>

            <AdminCheckbox
              label="ส่งแจ้งเตือนเข้า LINE ของแอดมิน (Messaging API)"
              checked={form.notifyAdminLine}
              onChange={(checked) =>
                setForm((f) => ({ ...f, notifyAdminLine: checked }))
              }
            />

            <AdminField
              label="Admin LINE User ID"
              hint="ต้องเป็นรหัสที่ขึ้นต้นด้วย U (เช่น Ua1b2c3…) — ห้ามใส่ลิงก์ lin.ee / line.me เพราะ LINE API ส่งเข้าลิงก์แชทโดยตรงไม่ได้"
            >
              <AdminInput
                value={form.adminLineUserId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminLineUserId: e.target.value }))
                }
                placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={
                  form.adminLineUserIdLooksLikeUrl ||
                  (form.adminLineUserId && !form.adminLineUserIdValid)
                    ? "border-amber-400"
                    : ""
                }
              />
            </AdminField>

            {form.adminLineUserIdLooksLikeUrl ? (
              <p className="text-sm font-medium text-amber-800">
                ค่าที่ใส่ตอนนี้ดูเป็นลิงก์แชท (lin.ee / line.me) — ลิงก์นี้ใช้เปิดแชทจากปุ่มติดต่อได้
                แต่<strong> ส่งแจ้งเตือนอัตโนมัติไม่ได้</strong> กรุณาใส่ LINE User ID (U…) ของบัญชีที่แอด
                OA bot เป็นเพื่อนแล้ว
              </p>
            ) : null}

            <AdminField
              label="LINE Channel Access Token (ถ้าต้องการแยกจากหน้าสินเชื่อ)"
              hint={
                form.hasLineToken
                  ? `มี token อยู่แล้ว (ที่มา: ${form.lineTokenSource}) — เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน`
                  : "ยังไม่มี token — ใส่ Channel access token จาก LINE Developers หรือตั้งที่หน้าปรึกษาสินเชื่อบ้าน"
              }
            >
              <AdminInput
                type="password"
                value={form.lineChannelAccessToken}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lineChannelAccessToken: e.target.value,
                  }))
                }
                placeholder={form.hasLineToken ? "•••••••• (มีอยู่แล้ว)" : "Channel access token"}
                autoComplete="off"
              />
            </AdminField>

            <p className="text-xs leading-relaxed text-slate-500">
              วิธีได้ User ID: เปิด Messaging API ของ LINE OA → ให้บัญชีแอดมินแอดบอทเป็นเพื่อน →
              ดู userId จาก webhook event หรือเครื่องมือใน LINE Developers แล้ววางรหัส U… ที่นี่
              (ลิงก์เช่น https://lin.ee/… ที่ตั้งในส่วนท้ายเว็บใช้เป็นปุ่มเปิดแชทเท่านั้น)
            </p>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <span className="font-semibold">Webhook URL ใน LINE Developers:</span>{" "}
              <code className="rounded bg-white px-1.5 py-0.5">
                https://www.planasia.net/api/webhooks/line
              </code>
              <br />
              ต้อง deploy ขึ้น production ก่อน แล้วกด Verify ในคอนโซล LINE · ตั้ง{" "}
              <code className="rounded bg-white px-1">LINE_CHANNEL_SECRET</code> ใน environment
            </p>
          </div>
        </AdminCard>

        <AdminSaveButton
          saving={saving}
          onClick={() => void save()}
          label="บันทึกการตั้งค่า"
        />
      </div>
    </div>
  );
}
