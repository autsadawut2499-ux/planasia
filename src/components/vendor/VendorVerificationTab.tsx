"use client";

import { useState } from "react";
import { BadgeCheck, Clock, ShieldAlert, XCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { FileUpload } from "@/components/vendor/FileUpload";
import { ThaiDateOfBirthField } from "@/components/vendor/ThaiDateOfBirthField";
import { Card, Field, PrimaryButton, Select, TextArea, TextInput } from "@/components/vendor/ui";
import { buildVendorWorkflow, unmetPrerequisites, type VendorStepId } from "@/lib/vendor/workflow";
import type { useVendorDashboard } from "@/hooks/useVendorDashboard";
import type { KycDocType, VerificationStatus } from "@/lib/supabase/vendors";

type Dashboard = ReturnType<typeof useVendorDashboard>;

/** Platform KYC is for Thai draftsmen / designers only. */
const THAI_COUNTRY_CODE = "TH";

const STATUS_UI: Record<VerificationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  unverified: {
    label: "ยังไม่ยืนยันตัวตน",
    cls: "bg-surface-raised text-text-secondary",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  pending: {
    label: "กำลังตรวจสอบอัตโนมัติ",
    cls: "bg-amber-100 text-amber-700",
    icon: <Clock className="h-4 w-4" />,
  },
  approved: {
    label: "ยืนยันตัวตนแล้ว",
    cls: "bg-green-100 text-green-700",
    icon: <BadgeCheck className="h-4 w-4" />,
  },
  rejected: {
    label: "ไม่ผ่านการตรวจสอบ",
    cls: "bg-red-100 text-red-700",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const DOC_TYPES: Array<[KycDocType, string]> = [
  ["national_id", "บัตรประจำตัวประชาชน"],
  ["passport", "หนังสือเดินทาง"],
  ["driver_license", "ใบขับขี่"],
  ["professional_license", "ใบประกอบวิชาชีพ (กว. / สถ.)"],
];

function docNumberLabel(docType: KycDocType): string {
  switch (docType) {
    case "passport":
      return "เลขหนังสือเดินทาง *";
    case "driver_license":
      return "เลขใบขับขี่ *";
    case "professional_license":
      return "เลขใบประกอบวิชาชีพ *";
    default:
      return "เลขประจำตัวประชาชน *";
  }
}

function docNumberPlaceholder(docType: KycDocType): string {
  switch (docType) {
    case "passport":
      return "เลขที่หนังสือเดินทาง";
    case "driver_license":
      return "เลขที่ใบขับขี่";
    case "professional_license":
      return "เลขที่ใบประกอบวิชาชีพ";
    default:
      return "เลขประจำตัวประชาชน 13 หลัก";
  }
}

export function VendorVerificationTab({
  dash,
  onGoToStep,
}: {
  dash: Dashboard;
  onGoToStep?: (id: VendorStepId) => void;
}) {
  const { data, uploadFile, submitKyc } = dash;
  const toast = useToast();
  const status = data?.verificationStatus ?? "unverified";
  const ui = STATUS_UI[status];
  const pending = unmetPrerequisites(buildVendorWorkflow(data));
  const locked = status !== "approved" && pending.length > 0;

  const [legalName, setLegalName] = useState(data?.kyc?.legalName ?? "");
  const [docType, setDocType] = useState<KycDocType>(data?.kyc?.docType ?? "national_id");
  const [docNumber, setDocNumber] = useState(data?.kyc?.docNumber ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(data?.kyc?.dateOfBirth ?? "");
  const [address, setAddress] = useState(data?.kyc?.address ?? "");
  const [note, setNote] = useState(data?.verification?.note ?? "");

  const existing = data?.verification?.documents ?? [];
  const [docFront, setDocFront] = useState(existing[0] ?? "");
  const [docBack, setDocBack] = useState(existing[1] ?? "");
  const [selfie, setSelfie] = useState(existing[2] ?? "");

  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (locked) return toast.error("กรุณาทำขั้นตอนที่ 1–3 ให้ครบก่อนยืนยันตัวตน");
    if (!legalName.trim()) return toast.error("กรุณากรอกชื่อ-นามสกุลตามเอกสาร");
    if (!docNumber.trim()) {
      return toast.error(
        docType === "national_id"
          ? "กรุณากรอกเลขประจำตัวประชาชน"
          : `กรุณากรอก${docNumberLabel(docType).replace(" *", "")}`,
      );
    }
    if (!docFront) return toast.error("กรุณาอัปโหลดรูปหน้าเอกสาร");
    if (!selfie) return toast.error("กรุณาอัปโหลดรูปเซลฟีถือเอกสาร");

    const documents = [docFront, docBack, selfie].filter(Boolean);
    setSaving(true);
    try {
      const result = await submitKyc({
        kyc: {
          legalName: legalName.trim(),
          docType,
          docNumber: docNumber.trim(),
          countryCode: THAI_COUNTRY_CODE,
          dateOfBirth: dateOfBirth || undefined,
          address: address.trim() || undefined,
        },
        documents,
        note: note.trim() || undefined,
      });
      if (result.verificationStatus === "approved") {
        toast.success("ยืนยันตัวตนสำเร็จ — บัญชีผู้ขายพร้อมใช้งานแล้ว");
      } else if (result.verificationStatus === "pending") {
        toast.success("รับข้อมูลแล้ว ระบบกำลังตรวจสอบอัตโนมัติ…");
      } else {
        toast.error(
          result.reasons[0]
            ? `ไม่ผ่าน: ${result.reasons[0]}`
            : "การยืนยันตัวตนไม่ผ่าน — กรุณาแก้ไขข้อมูลแล้วส่งใหม่",
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <Card
        title="ขั้นตอนที่ 4 · ยืนยันตัวตน"
        desc="สำหรับนักเขียนแบบ / นักออกแบบสถาปัตย์ในประเทศไทยเท่านั้น — ระบบตรวจอัตโนมัติทันทีหลังส่ง และจะเผยแพร่ผลงานที่เตรียมไว้ขึ้นร้านให้เอง"
      >
        <div
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ui.cls}`}
        >
          {ui.icon}
          {ui.label}
        </div>

        <p className="mb-4 rounded-lg border border-[#1e40af]/15 bg-blue-50/70 px-3 py-2.5 text-xs leading-relaxed text-[#1e3a5f]">
          แพลตฟอร์มนี้เปิดรับเฉพาะผู้เขียนแบบและนักออกแบบในประเทศไทย
          กรุณากรอกข้อมูลตามเอกสารราชการไทย (บัตรประชาชน / หนังสือเดินทาง / ใบขับขี่ / ใบประกอบวิชาชีพ)
        </p>

        {locked && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              เหลืออีก {pending.length} ขั้นตอนก่อนยืนยันตัวตน
            </p>
            <ul className="mt-2 space-y-1.5">
              {pending.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 text-sm text-amber-800"
                >
                  <span>
                    <span className="font-semibold">ขั้นตอน {s.step}:</span> {s.todo}
                  </span>
                  {onGoToStep && (
                    <button
                      type="button"
                      onClick={() => onGoToStep(s.id)}
                      className="shrink-0 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    >
                      ไปทำ
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "rejected" && data?.verificationRejectReason && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            เหตุผลที่ไม่ผ่าน: {data.verificationRejectReason} — กรุณาแก้ไขและส่งใหม่อีกครั้ง
          </div>
        )}

        {status === "approved" ? (
          <p className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            บัญชีของคุณผ่านการยืนยันตัวตนแล้ว สามารถลงขายแบบบ้านได้ทันที
            และจะมีตรา “ยืนยันแล้ว” บนหน้าโปรไฟล์
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อ-นามสกุล (ตามเอกสาร) *">
                <TextInput
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="ชื่อ-นามสกุลตามบัตรประชาชน หรือเอกสารที่ใช้"
                />
              </Field>
              <Field label="ประเทศ *" hint="แพลตฟอร์มนี้รองรับเฉพาะประเทศไทย">
                <TextInput value="ประเทศไทย" readOnly disabled className="bg-slate-50 text-text-secondary" />
              </Field>
              <Field label="ประเภทเอกสาร *">
                <Select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as KycDocType)}
                >
                  {DOC_TYPES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={docNumberLabel(docType)}>
                <TextInput
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={docNumberPlaceholder(docType)}
                  inputMode={docType === "national_id" ? "numeric" : "text"}
                />
              </Field>
              <div className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">
                  วันเกิด
                </span>
                <ThaiDateOfBirthField value={dateOfBirth} onChange={setDateOfBirth} />
              </div>
              <Field label="ที่อยู่ (ตามเอกสาร)">
                <TextInput
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="เช่น บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด"
                />
              </Field>
            </div>

            <p className="mb-2 mt-6 text-xs font-semibold text-text-secondary">
              รูปเอกสารยืนยันตัวตน{" "}
              <span className="text-text-muted">
                (อัปโหลดเป็นรูปภาพ — หน้าเอกสาร + เซลฟีถือเอกสาร จำเป็น · ไม่รับไฟล์ PDF)
              </span>
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <FileUpload
                  kind="kyc"
                  variant="image"
                  value={docFront}
                  label="หน้าเอกสาร *"
                  hint="ลากรูปมาวาง หรือคลิกเพื่อเลือก (JPG, PNG, WEBP)"
                  onUpload={uploadFile}
                  onUploaded={setDocFront}
                  onError={(m) => toast.error(m)}
                  onClear={() => setDocFront("")}
                />
              </div>
              <div>
                <FileUpload
                  kind="kyc"
                  variant="image"
                  value={docBack}
                  label="หลังเอกสาร"
                  hint="ลากรูปมาวาง หรือคลิกเพื่อเลือก (JPG, PNG, WEBP)"
                  onUpload={uploadFile}
                  onUploaded={setDocBack}
                  onError={(m) => toast.error(m)}
                  onClear={() => setDocBack("")}
                />
              </div>
              <div>
                <FileUpload
                  kind="kyc"
                  variant="image"
                  value={selfie}
                  label="เซลฟีถือเอกสาร *"
                  hint="ลากรูปมาวาง หรือคลิกเพื่อเลือก (JPG, PNG, WEBP)"
                  onUpload={uploadFile}
                  onUploaded={setSelfie}
                  onError={(m) => toast.error(m)}
                  onClear={() => setSelfie("")}
                />
              </div>
            </div>

            <div className="mt-4">
              <Field label="หมายเหตุถึงทีมงาน (ถ้ามี)">
                <TextArea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ข้อมูลเพิ่มเติม เช่น เลขใบประกอบวิชาชีพ หรือรายละเอียดอื่น"
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              {locked && (
                <p className="text-xs text-amber-700">ปลดล็อกเมื่อทำขั้นตอน 1–3 ครบแล้ว</p>
              )}
              <PrimaryButton onClick={handleSubmit} loading={saving} disabled={locked}>
                ส่งข้อมูลยืนยันตัวตน
              </PrimaryButton>
            </div>
          </>
        )}
      </Card>

      <p className="px-1 text-xs text-text-muted">
        ข้อมูลยืนยันตัวตนถูกจัดเก็บแยกอย่างปลอดภัย และไม่แสดงบนหน้าเว็บสาธารณะ —
        ทีมงานสามารถตรวจสอบหรือแก้ไขสถานะได้หากจำเป็น
      </p>
    </div>
  );
}
