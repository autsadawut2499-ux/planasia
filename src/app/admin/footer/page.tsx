"use client";

import { useEffect, useState } from "react";
import type { SiteFooterSettings } from "@/lib/admin/defaults";
import type { Locale } from "@/lib/geo/countries";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { Plus, Trash2 } from "lucide-react";

export default function AdminFooterPage() {
  const [footer, setFooter] = useState<SiteFooterSettings>({
    contactEmail: "",
    contactPhone: "",
    contactLineUrl: "",
    organizationName: "",
    address: "",
    socialLinks: [],
    copyrightText: "",
  });
  const [adminLabel, setAdminLabel] = useState("ผู้ดูแลระบบ");
  const [locale, setLocale] = useState<Locale>("th");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch(`/api/admin/cms?section=footer&locale=${locale}`).then((r) => r.json()),
    ])
      .then(([settingsData, cmsData]) => {
        if (settingsData.settings?.footer) {
          const next = settingsData.settings.footer as SiteFooterSettings;
          const lineFromSocial =
            next.socialLinks?.find((l) => l.platform.toLowerCase() === "line")?.url?.trim() ||
            "";
          setFooter({
            ...next,
            contactLineUrl: next.contactLineUrl?.trim() || lineFromSocial || "",
          });
        }
        if (cmsData.content?.adminLabel) setAdminLabel(cmsData.content.adminLabel);
      })
      .finally(() => setLoading(false));
  }, [locale]);

  async function saveFooter() {
    setSaving(true);
    setStatus(null);
    try {
      // Keep social "line" entry in sync so footer + FAB share one source of truth.
      const lineUrl = footer.contactLineUrl.trim();
      const socialLinks = [...footer.socialLinks];
      const lineIdx = socialLinks.findIndex((l) => l.platform.toLowerCase() === "line");
      if (lineIdx >= 0) {
        socialLinks[lineIdx] = {
          ...socialLinks[lineIdx],
          url: lineUrl,
          label: socialLinks[lineIdx].label || "LINE",
        };
      } else if (lineUrl) {
        socialLinks.push({ platform: "line", url: lineUrl, label: "LINE" });
      }
      const payload: SiteFooterSettings = {
        ...footer,
        contactLineUrl: lineUrl,
        socialLinks,
      };

      const [settingsRes, cmsRes] = await Promise.all([
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "footer", value: payload }),
        }),
        fetch("/api/admin/cms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "footer",
            locale,
            content: { adminLabel },
          }),
        }),
      ]);
      if (!settingsRes.ok || !cmsRes.ok) throw new Error("บันทึกไม่สำเร็จ");
      setFooter(payload);
      setStatus({ type: "success", message: "บันทึกการตั้งค่าส่วนท้ายเว็บเรียบร้อยแล้ว" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  function updateSocial(index: number, field: "platform" | "url" | "label", value: string) {
    const links = [...footer.socialLinks];
    links[index] = { ...links[index], [field]: value };
    setFooter({ ...footer, socialLinks: links });
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดการตั้งค่าส่วนท้ายเว็บ…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="จัดการส่วนท้ายเว็บ"
        description="แก้ไขข้อมูลติดต่อ โซเชียลมีเดีย องค์กร และข้อความลิงก์ผู้ดูแลระบบ"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="space-y-6">
        <AdminCard title="ติดต่อและองค์กร">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="อีเมลติดต่อ">
              <AdminInput
                type="email"
                value={footer.contactEmail}
                onChange={(e) => setFooter({ ...footer, contactEmail: e.target.value })}
              />
            </AdminField>
            <AdminField
              label="เบอร์โทรติดต่อ"
              hint="แสดงในแถบหัวเว็บและปุ่มติดต่อลอย (FAB)"
            >
              <AdminInput
                value={footer.contactPhone}
                onChange={(e) => setFooter({ ...footer, contactPhone: e.target.value })}
                placeholder="061-691-1599"
              />
            </AdminField>
            <AdminField
              label="ลิงก์ LINE (ปุ่มติดต่อลอย)"
              hint="เช่น https://line.me/R/ti/p/@yourid — ใช้กับปุ่ม FAB มุมล่างขวา"
            >
              <AdminInput
                type="url"
                value={footer.contactLineUrl}
                onChange={(e) => setFooter({ ...footer, contactLineUrl: e.target.value })}
                placeholder="https://line.me/R/ti/p/@planasia"
                className="w-full"
              />
            </AdminField>
            <AdminField label="ชื่อองค์กร">
              <AdminInput
                value={footer.organizationName}
                onChange={(e) => setFooter({ ...footer, organizationName: e.target.value })}
              />
            </AdminField>
            <AdminField label="ที่อยู่">
              <AdminInput
                value={footer.address}
                onChange={(e) => setFooter({ ...footer, address: e.target.value })}
              />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="ลิงก์โซเชียลมีเดีย">
          <div className="space-y-3">
            {footer.socialLinks.map((link, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3">
                <AdminField label="แพลตฟอร์ม">
                  <AdminInput
                    value={link.platform}
                    onChange={(e) => updateSocial(i, "platform", e.target.value)}
                  />
                </AdminField>
                <AdminField label="ป้ายกำกับ">
                  <AdminInput
                    value={link.label ?? ""}
                    onChange={(e) => updateSocial(i, "label", e.target.value)}
                  />
                </AdminField>
                <AdminField label="URL">
                  <AdminInput
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocial(i, "url", e.target.value)}
                    className="min-w-[200px]"
                  />
                </AdminField>
                <button
                  type="button"
                  onClick={() =>
                    setFooter({
                      ...footer,
                      socialLinks: footer.socialLinks.filter((_, j) => j !== i),
                    })
                  }
                  className="mb-0.5 rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFooter({
                  ...footer,
                  socialLinks: [
                    ...footer.socialLinks,
                    { platform: "", url: "", label: "" },
                  ],
                })
              }
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" />
              เพิ่มลิงก์โซเชียล
            </button>
          </div>
        </AdminCard>

        <AdminCard title="ข้อความส่วนท้าย">
          <div className="space-y-4">
            <AdminField label="ลิขสิทธิ์" hint="ใช้ {year} สำหรับปีปัจจุบัน">
              <AdminInput
                value={footer.copyrightText}
                onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
              />
            </AdminField>
            <AdminField
              label="ข้อความลิงก์ผู้ดูแลระบบ"
              hint="แสดงในส่วนท้ายเว็บเป็นทางเข้าแผงผู้ดูแล (เช่น ผู้ดูแลระบบ)"
            >
              <AdminInput
                  value={adminLabel}
                  onChange={(e) => setAdminLabel(e.target.value)}
                  className="w-full"
                />
            </AdminField>
            <AdminSaveButton saving={saving} onClick={saveFooter} />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
