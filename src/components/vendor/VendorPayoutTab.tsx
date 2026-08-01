"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Card, Field, PrimaryButton, Select, TextInput } from "@/components/vendor/ui";
import type { useVendorDashboard } from "@/hooks/useVendorDashboard";
import type { VendorEarning } from "@/lib/commerce/earnings-types";

type Dashboard = ReturnType<typeof useVendorDashboard>;

const THAI_BANKS = [
  "ธนาคารกสิกรไทย (Kasikornbank - KBank)",
  "ธนาคารไทยพาณิชย์ (Siam Commercial Bank - SCB)",
  "ธนาคารกรุงเทพ (Bangkok Bank - BBL)",
  "ธนาคารกรุงไทย (Krungthai Bank - KTB)",
  "ธนาคารกรุงศรีอยุธยา (Bank of Ayudhya - Krungsri)",
  "ธนาคารทหารไทยธนชาต (TMBThanachart Bank - ttb)",
  "ธนาคารยูโอบี (United Overseas Bank - UOB)",
  "ธนาคารซีไอเอ็มบี ไทย (CIMB Thai Bank)",
  "ธนาคารเกียรตินาคินภัทร (Kiatnakin Phatra Bank - KKP)",
  "ธนาคารออมสิน (Government Savings Bank - GSB)",
  "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)",
  "ธนาคารอาคารสงเคราะห์ (Government Housing Bank - GHB)",
] as const;

type HistoryFilter = "all" | "available" | "paid_out";

export function VendorPayoutTab({ dash }: { dash: Dashboard }) {
  const { data, savePayout } = dash;
  const toast = useToast();
  const p = data?.payout ?? {};
  const [bankName, setBankName] = useState(p.bankName ?? "");
  const [accountName, setAccountName] = useState(p.accountName ?? "");
  const [accountNumber, setAccountNumber] = useState(p.accountNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const bankOptions =
    bankName && !(THAI_BANKS as readonly string[]).includes(bankName)
      ? [bankName, ...THAI_BANKS]
      : [...THAI_BANKS];

  async function handleSave() {
    if (!bankName.trim()) return toast.error("กรุณาเลือกธนาคาร");
    if (!accountName.trim()) return toast.error("กรุณาระบุชื่อบัญชี");
    if (!accountNumber.trim()) return toast.error("กรุณาระบุเลขที่บัญชี");

    setSaving(true);
    try {
      await savePayout({
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
      });
      toast.success("บันทึกข้อมูลการรับเงินแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  const earnings = data?.commission?.earnings;
  const vendorPct = Math.round((data?.commission?.vendorShare ?? 0.7) * 100);
  const platformPct = Math.round((data?.commission?.platformShare ?? 0.3) * 100);
  const recent = earnings?.recent ?? [];

  const filtered = useMemo(() => {
    if (filter === "all") return recent;
    return recent.filter((e) => e.status === filter);
  }, [recent, filter]);

  return (
    <div className="max-w-2xl space-y-5">
      <Card
        title="ส่วนแบ่งรายได้"
        desc={`คุณตั้งราคาขายเองได้ · ระบบหักอัตโนมัติ ผู้เขียนแบบ ${vendorPct}% / แพลตฟอร์ม ${platformPct}% · ทีมงานโอนตามบัญชีด้านล่าง`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <EarnStat label="ยอดขาย (ครั้ง)" value={String(earnings?.salesCount ?? 0)} />
          <EarnStat
            label="ยอดรวมที่ขายได้"
            value={`฿${(earnings?.grossThb ?? 0).toLocaleString()}`}
          />
          <EarnStat
            label="พร้อมโอน"
            value={`฿${(earnings?.availableThb ?? 0).toLocaleString()}`}
            highlight
          />
          <EarnStat
            label="โอนแล้ว"
            value={`฿${(earnings?.paidOutThb ?? 0).toLocaleString()}`}
          />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          ส่วนของคุณทั้งหมด ({vendorPct}%): ฿
          {(earnings?.vendorEarnedThb ?? 0).toLocaleString()}
        </p>

        {recent.length > 0 ? (
          <>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "ทั้งหมด"],
                  ["available", "พร้อมโอน"],
                  ["paid_out", "โอนแล้ว"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    filter === id
                      ? "bg-[#1e40af] text-white"
                      : "bg-surface-raised text-text-muted hover:text-[#1e40af]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-raised text-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-semibold">วันที่</th>
                    <th className="px-3 py-2 font-semibold">ยอดขาย</th>
                    <th className="px-3 py-2 font-semibold">คุณได้</th>
                    <th className="px-3 py-2 font-semibold">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-text-muted">
                        ไม่มีรายการในหมวดนี้
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => <HistoryRow key={e.id} earning={e} />)
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-surface-raised px-4 py-6 text-center text-sm text-text-muted">
            ยังไม่มียอดขาย — เมื่อลูกค้าซื้อแบบบ้านของคุณ ส่วนแบ่ง {vendorPct}% จะแสดงที่นี่
            และทีมงานจะโอนตามบัญชีที่บันทึกไว้
          </p>
        )}
      </Card>

      <Card
        title="บัญชีรับเงินส่วนแบ่งยอดขาย"
        desc="บันทึกบัญชีธนาคารเพื่อรับส่วนแบ่งรายได้ — ข้อมูลนี้ไม่แสดงบนโปรไฟล์สาธารณะ"
      >
        <div className="space-y-4">
          <Field label="ธนาคาร *">
            <Select value={bankName} onChange={(e) => setBankName(e.target.value)} required>
              <option value="">— เลือกธนาคาร —</option>
              {bankOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ชื่อบัญชี *">
            <TextInput
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="ชื่อ-นามสกุล ตามหน้าสมุดบัญชี"
            />
          </Field>
          <Field label="เลขที่บัญชี *">
            <TextInput
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="xxx-x-xxxxx-x"
              inputMode="numeric"
            />
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-[#1e40af]">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          ข้อมูลบัญชีถูกจัดเก็บแยกจากข้อมูลสาธารณะ และไม่แสดงบนหน้าโปรไฟล์
        </div>
        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={handleSave} loading={saving}>
            บันทึกข้อมูลการรับเงิน
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function HistoryRow({ earning: e }: { earning: VendorEarning }) {
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2 text-text-secondary">
        {new Date(e.createdAt).toLocaleDateString("th-TH")}
        {e.paidOutAt && (
          <p className="text-[10px] text-text-muted">
            โอน {new Date(e.paidOutAt).toLocaleDateString("th-TH")}
          </p>
        )}
      </td>
      <td className="px-3 py-2">฿{e.grossThb.toLocaleString()}</td>
      <td className="px-3 py-2 font-semibold text-[#1e40af]">
        ฿{e.vendorAmountThb.toLocaleString()}
      </td>
      <td className="px-3 py-2">
        <span
          className={
            e.status === "paid_out"
              ? "font-medium text-emerald-700"
              : e.status === "available"
                ? "font-medium text-[#1e40af]"
                : "text-text-muted"
          }
        >
          {e.status === "available"
            ? "พร้อมโอน"
            : e.status === "paid_out"
              ? "โอนแล้ว"
              : "รอดำเนินการ"}
        </span>
      </td>
    </tr>
  );
}

function EarnStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2.5">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${highlight ? "text-[#1e40af]" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
