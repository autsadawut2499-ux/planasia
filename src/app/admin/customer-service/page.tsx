"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { AdminPageHeader, AdminStatusMessage } from "@/components/admin/AdminForm";
import {
  customerServiceTopicCatalog,
  type CustomerServiceArticlesMap,
  type CustomerServiceTopicCatalogItem,
} from "@/lib/content/customer-service";

/**
 * Index of all 9 Customer Service dropdown topics —
 * each opens a dedicated text-only editor (no image uploads).
 */
export default function AdminCustomerServiceIndexPage() {
  const [topics, setTopics] = useState<CustomerServiceTopicCatalogItem[]>(() =>
    customerServiceTopicCatalog(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/customer-service", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { articles?: CustomerServiceArticlesMap; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setTopics(customerServiceTopicCatalog(data.articles));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "โหลดรายการไม่สำเร็จ");
        setTopics(customerServiceTopicCatalog());
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="บริการลูกค้า — จัดการข้อความทั้ง 9 หัวข้อ"
        description="แก้ไขเนื้อหาข้อความล้วนๆ ของทุกหัวข้อในเมนูบริการลูกค้าแยกอิสระ — ไม่มีช่องอัปโหลดรูป แต่ละหัวข้อบันทึกในฐานข้อมูลและแสดงที่ /about/[slug]"
      />

      {error && (
        <div className="mb-6">
          <AdminStatusMessage type="error" message={error} />
        </div>
      )}

      <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900">
        <p className="font-semibold">ระบบจัดการข้อความครบทุกหัวข้อในเมนู</p>
        <p className="mt-1 text-indigo-800/90">
          การรับประกัน · พื้นที่พิเศษ · งบประมาณ · ภาษาถิ่น · ภาษาต่างประเทศ · สื่อสารสากล ·
          เงื่อนไข · สถาปัตยกรรมไร้พรมแดน · หน่วยวัด — คลิกหัวข้อเพื่อเปิดตัวแก้ไขข้อความ
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500">กำลังโหลดรายการบทความ…</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {topics.map((topic, i) => (
            <li key={topic.slug}>
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={topic.adminHref}
                  className="flex min-w-0 flex-1 items-center gap-4 transition hover:opacity-90"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {i + 1}. {topic.titleTh}
                    </p>
                    <p className="truncate text-xs text-slate-500">{topic.titleEn}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">{topic.href}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs font-medium text-indigo-600 sm:inline">
                    แก้ไขข้อความ →
                  </span>
                </Link>
                <Link
                  href={topic.href}
                  target="_blank"
                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-700 sm:self-center"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  ดูหน้าเว็บ
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
