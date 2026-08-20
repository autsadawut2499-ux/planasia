"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CmsSectionContent, CmsSectionKey, SiteHeroSettings } from "@/lib/admin/defaults";
import type { Locale } from "@/lib/geo/countries";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default function AdminContentPage() {
  const [locale] = useState<Locale>("th");
  const [hero, setHero] = useState<SiteHeroSettings>({
    badgeText: "",
    backgroundImageUrl: "",
  });
  const [heroCms, setHeroCms] = useState<CmsSectionContent>({});
  const [ctaCms, setCtaCms] = useState<CmsSectionContent>({});
  const [tipsCms, setTipsCms] = useState<CmsSectionContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch(`/api/admin/cms?section=hero&locale=${locale}`).then((r) => r.json()),
      fetch(`/api/admin/cms?section=cta_band&locale=${locale}`).then((r) => r.json()),
      fetch(`/api/admin/cms?section=construction_tips&locale=${locale}`).then((r) => r.json()),
    ])
      .then(([settingsData, heroData, ctaData, tipsData]) => {
        if (settingsData.settings?.hero) setHero(settingsData.settings.hero);
        if (heroData.content) setHeroCms(heroData.content);
        if (ctaData.content) setCtaCms(ctaData.content);
        if (tipsData.content) setTipsCms(tipsData.content);
      })
      .finally(() => setLoading(false));
  }, [locale]);

  async function saveHeroSettings() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hero", value: hero }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setStatus({ type: "success", message: "บันทึกภาพ Hero เรียบร้อยแล้ว" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  async function saveCms(
    section: Extract<CmsSectionKey, "hero" | "cta_band" | "construction_tips">,
    content: CmsSectionContent,
  ) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, locale, content }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setStatus({ type: "success", message: `บันทึกเนื้อหา ${section} สำหรับภาษา ${locale} เรียบร้อยแล้ว` });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดเนื้อหา…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="เนื้อหาและ UI"
        description="แก้ไขข้อความ Hero คำโปรย แบนเอนร์ CTA เคล็ดลับการก่อสร้าง และรูปภาพ (ภาษาไทย)"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="space-y-6">
        <AdminCard title="ส่วน Hero">
          <div className="space-y-4">
            <AdminField label="หัวข้อ">
              <AdminInput
                value={heroCms.title ?? ""}
                onChange={(e) => setHeroCms({ ...heroCms, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="คำบรรยาย / Tagline">
              <AdminTextarea
                rows={3}
                value={heroCms.subtitle ?? ""}
                onChange={(e) => setHeroCms({ ...heroCms, subtitle: e.target.value })}
              />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="ปุ่มหลัก">
                <AdminInput
                  value={heroCms.cta ?? ""}
                  onChange={(e) => setHeroCms({ ...heroCms, cta: e.target.value })}
                />
              </AdminField>
              <AdminField label="ปุ่มรอง">
                <AdminInput
                  value={heroCms.ctaSecondary ?? ""}
                  onChange={(e) => setHeroCms({ ...heroCms, ctaSecondary: e.target.value })}
                />
              </AdminField>
            </div>
            <AdminSaveButton saving={saving} onClick={() => saveCms("hero", heroCms)} />
          </div>
        </AdminCard>

        <AdminCard title="ภาพ Hero (ทุกภาษา)">
          <div className="space-y-4">
            <p className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
              สำหรับจัดการภาพปกขนาดใหญ่แบบเต็มจอ แนะนำใช้หน้า{" "}
              <Link href="/admin/hero-cover" className="font-semibold underline">
                ภาพปกหน้าแรก
              </Link>{" "}
              (อัปโหลด / เปลี่ยน / ลบ พร้อมตัวอย่าง)
            </p>
            <AdminField label="ข้อความป้าย">
              <AdminInput
                value={hero.badgeText}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
              />
            </AdminField>
            <ImageUploadField
              label="แบนเอนร์พื้นหลัง"
              value={hero.backgroundImageUrl}
              onChange={(url) => setHero({ ...hero, backgroundImageUrl: url ?? "" })}
              category="hero"
            />
            <AdminSaveButton saving={saving} onClick={saveHeroSettings} />
          </div>
        </AdminCard>

        <AdminCard title={`แถบ CTA — ${locale.toUpperCase()}`}>
          <div className="space-y-4">
            <AdminField label="หัวข้อ">
              <AdminInput
                value={ctaCms.title ?? ""}
                onChange={(e) => setCtaCms({ ...ctaCms, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="คำอธิบาย">
              <AdminTextarea
                rows={2}
                value={ctaCms.description ?? ""}
                onChange={(e) => setCtaCms({ ...ctaCms, description: e.target.value })}
              />
            </AdminField>
            <AdminField label="ข้อความปุ่ม">
              <AdminInput
                value={ctaCms.cta ?? ""}
                onChange={(e) => setCtaCms({ ...ctaCms, cta: e.target.value })}
              />
            </AdminField>
            <AdminSaveButton saving={saving} onClick={() => saveCms("cta_band", ctaCms)} />
          </div>
        </AdminCard>

        <AdminCard title={`เคล็ดลับการก่อสร้าง (หน้าแรก) — ${locale.toUpperCase()}`}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              ส่วนกลางหน้าแรก ระหว่างแถบบริการคอนเซปต์และแบบ Exclusive — แก้หัวข้อ คำอธิบาย
              ปุ่ม และลิงก์ปลายทาง
            </p>
            <AdminField label="หัวข้อ">
              <AdminInput
                value={tipsCms.title ?? ""}
                onChange={(e) => setTipsCms({ ...tipsCms, title: e.target.value })}
              />
            </AdminField>
            <AdminField label="คำอธิบาย">
              <AdminTextarea
                rows={3}
                value={tipsCms.description ?? ""}
                onChange={(e) => setTipsCms({ ...tipsCms, description: e.target.value })}
              />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="ข้อความปุ่ม">
                <AdminInput
                  value={tipsCms.cta ?? ""}
                  onChange={(e) => setTipsCms({ ...tipsCms, cta: e.target.value })}
                />
              </AdminField>
              <AdminField label="ลิงก์ปุ่ม (เช่น /articles)">
                <AdminInput
                  value={tipsCms.ctaHref ?? ""}
                  onChange={(e) => setTipsCms({ ...tipsCms, ctaHref: e.target.value })}
                  placeholder="/articles"
                />
              </AdminField>
            </div>
            <AdminSaveButton
              saving={saving}
              onClick={() => saveCms("construction_tips", tipsCms)}
            />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
