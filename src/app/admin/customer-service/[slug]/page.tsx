"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import {
  CUSTOMER_SERVICE_SLUGS,
  DEFAULT_CUSTOMER_SERVICE_ARTICLES,
  type CustomerServiceArticle,
} from "@/lib/content/customer-service";

/**
 * Text-only editor for one Customer Service topic (no image uploads).
 */
export default function AdminCustomerServiceEditPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const valid = CUSTOMER_SERVICE_SLUGS.includes(slug);

  const [article, setArticle] = useState<CustomerServiceArticle | null>(
    valid ? DEFAULT_CUSTOMER_SERVICE_ARTICLES[slug] ?? null : null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (!valid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/customer-service?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { article?: CustomerServiceArticle }) => {
        if (data.article) setArticle(data.article);
      })
      .catch(() => setStatus({ type: "error", message: "โหลดบทความไม่สำเร็จ" }))
      .finally(() => setLoading(false));
  }, [slug, valid]);

  function setLocaleField(
    field: "title" | "summary" | "body",
    locale: "th" | "en",
    value: string,
  ) {
    setArticle((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: { ...prev[field], [locale]: value } };
    });
  }

  async function save() {
    if (!article) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/customer-service", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, article }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setArticle(data.article);
      setStatus({
        type: "success",
        message: "บันทึกบทความแล้ว — รีเฟรชหน้าเว็บสาธารณะเพื่อดูผล",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!valid) {
    return (
      <div>
        <p className="text-slate-600">ไม่พบหัวข้อนี้</p>
        <Link href="/admin/customer-service" className="mt-4 inline-block text-indigo-600">
          ← กลับรายการ
        </Link>
      </div>
    );
  }

  if (loading || !article) {
    return <p className="text-slate-500">กำลังโหลดบทความ…</p>;
  }

  return (
    <div>
      <Link
        href="/admin/customer-service"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับรายการบริการลูกค้า
      </Link>

      <AdminPageHeader
        title={article.title.th || article.title.en}
        description="ตัวแก้ไขข้อความล้วนๆ (ไม่มีช่องอัปโหลดรูป) — บันทึกลงฐานข้อมูล site_settings แล้วแสดงบนหน้าเว็บสาธารณะ"
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <span className="font-medium text-slate-600">เส้นทางหน้าเว็บ:</span>
        <code className="rounded bg-white px-2 py-0.5 font-mono text-xs text-indigo-700 ring-1 ring-slate-200">
          /about/{slug}
        </code>
        <Link
          href={`/about/${slug}`}
          target="_blank"
          className="ml-auto text-xs font-semibold text-indigo-600 hover:underline"
        >
          เปิดดูหน้านี้ ↗
        </Link>
      </div>

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="space-y-6">
        <AdminCard title="ชื่อและคำโปรย (ภาษาไทย)">
          <div className="space-y-4">
            <AdminField label="หัวข้อ">
              <AdminInput
                value={article.title.th}
                onChange={(e) => setLocaleField("title", "th", e.target.value)}
              />
            </AdminField>
            <AdminField label="คำโปรย / สรุปสั้น">
              <AdminTextarea
                rows={2}
                value={article.summary.th}
                onChange={(e) => setLocaleField("summary", "th", e.target.value)}
              />
            </AdminField>
            <AdminField
              label="เนื้อหาบทความ"
              hint="ใช้แถบเครื่องมือจัดรูปแบบ: ตัวหนา · ตัวเอียง · หัวข้อ · รายการ · ลิงก์"
            >
              <AdminRichTextEditor
                key={`${slug}-body-th`}
                value={article.body.th}
                onChange={(html) => setLocaleField("body", "th", html)}
                placeholder="เขียนเนื้อหาบทความภาษาไทย…"
                minHeightClass="min-h-[320px]"
              />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="English (optional)">
          <div className="space-y-4">
            <AdminField label="Title">
              <AdminInput
                value={article.title.en}
                onChange={(e) => setLocaleField("title", "en", e.target.value)}
              />
            </AdminField>
            <AdminField label="Summary">
              <AdminTextarea
                rows={2}
                value={article.summary.en}
                onChange={(e) => setLocaleField("summary", "en", e.target.value)}
              />
            </AdminField>
            <AdminField label="Article body" hint="Bold, italic, headings, lists, and links">
              <AdminRichTextEditor
                key={`${slug}-body-en`}
                value={article.body.en}
                onChange={(html) => setLocaleField("body", "en", html)}
                placeholder="Write the English article body…"
                minHeightClass="min-h-[260px]"
              />
            </AdminField>
          </div>
        </AdminCard>

        <div className="flex flex-wrap items-center gap-3">
          <AdminSaveButton saving={saving} onClick={() => void save()} />
          <Link
            href={`/about/${slug}`}
            target="_blank"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            เปิดดูหน้าเว็บสาธารณะ ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
