"use client";

import { useEffect, useState } from "react";
import type { SiteBrandSettings, SiteHeaderSettings } from "@/lib/admin/defaults";
import {
  AdminCard,
  AdminCheckbox,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default function AdminBrandPage() {
  const [brand, setBrand] = useState<SiteBrandSettings>({
    name: "Planasia",
    logoUrl: null,
    tagline: "",
  });
  const [header, setHeader] = useState<SiteHeaderSettings>({
    showStoreLink: true,
    showPricingLink: true,
    showHowItWorksLink: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.brand) setBrand(data.settings.brand);
        if (data.settings?.header) setHeader(data.settings.header);
      })
      .finally(() => setLoading(false));
  }, []);

  async function persistBrand(next: SiteBrandSettings, successMessage: string) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "brand", value: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setBrand(next);
      setStatus({ type: "success", message: successMessage });
      return true;
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveSection(
    section: "brand" | "header",
    value: SiteBrandSettings | SiteHeaderSettings,
  ) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setStatus({ type: "success", message: "บันทึกการตั้งค่าเรียบร้อยแล้ว" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  async function commitLogo(logoUrl: string | null, previousUrl: string | null) {
    const next = { ...brand, logoUrl };
    const ok = await persistBrand(
      next,
      logoUrl
        ? "อัปโหลดและบันทึกโลโก้เรียบร้อยแล้ว — รีเฟรชหน้าเว็บเพื่อดูผล"
        : "ลบโลโก้แล้ว — กลับไปใช้ไอคอนเริ่มต้น",
    );
    if (ok && previousUrl && previousUrl !== logoUrl) {
      void fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl: previousUrl }),
      }).catch(() => undefined);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดการตั้งค่า…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="แบรนด์และส่วนหัว"
        description="จัดการชื่อเว็บไซต์ โลโก้ คำโปรย และการแสดงเมนูนำทาง — อัปโหลดโลโก้แล้วระบบบันทึกให้อัตโนมัติ และแสดงบนทั้งเว็บหลังรีเฟรช"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="space-y-6">
        <AdminCard title="ข้อมูลแบรนด์">
          <div className="space-y-4">
            <AdminField label="ชื่อเว็บไซต์">
              <AdminInput
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              />
            </AdminField>
            <AdminField label="คำโปรย" hint="แสดงในป้าย Hero และ metadata">
              <AdminInput
                value={brand.tagline}
                onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
              />
            </AdminField>
            <ImageUploadField
              label="โลโก้เว็บไซต์"
              hint="อัปโหลดแล้วระบบบันทึกให้อัตโนมัติ — แทนที่ไอคอน+ข้อความในส่วนหัวทุกหน้า แนะนำ PNG/SVG พื้นหลังโปร่งใส สูงอย่างน้อย 128px (ถ้าวาง URL ให้กดบันทึกด้านล่าง)"
              value={brand.logoUrl}
              onChange={(logoUrl) => setBrand({ ...brand, logoUrl })}
              onUploaded={(logoUrl) => void commitLogo(logoUrl, brand.logoUrl)}
              onCleared={(previousUrl) => void commitLogo(null, previousUrl)}
              category="logo"
              deleteFromStorageOnClear={false}
              previewClassName="h-28 w-40"
            />
            {brand.logoUrl && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                  ตัวอย่างในส่วนหัว
                </p>
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-8 w-auto max-w-[200px] object-contain"
                  />
                </div>
              </div>
            )}
            <AdminSaveButton
              saving={saving}
              label="บันทึกชื่อ คำโปรย และ URL โลโก้"
              onClick={() => void saveSection("brand", brand)}
            />
          </div>
        </AdminCard>

        <AdminCard title="เมนูนำทางส่วนหัว">
          <div className="space-y-4">
            <AdminCheckbox
              label="แสดงลิงก์ร้านแบบบ้าน"
              checked={header.showStoreLink}
              onChange={(v) => setHeader({ ...header, showStoreLink: v })}
            />
            <AdminCheckbox
              label="แสดงลิงก์แพ็กเกจ"
              checked={header.showPricingLink}
              onChange={(v) => setHeader({ ...header, showPricingLink: v })}
            />
            <AdminCheckbox
              label="แสดงลิงก์ขั้นตอนการใช้งาน"
              checked={header.showHowItWorksLink}
              onChange={(v) => setHeader({ ...header, showHowItWorksLink: v })}
            />
            <AdminSaveButton saving={saving} onClick={() => void saveSection("header", header)} />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
