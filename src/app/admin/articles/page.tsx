"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import type { Article } from "@/lib/content/articles";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
      setArticles(data.articles ?? []);
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

  async function remove(id: string, title: string) {
    if (!confirm(`ลบบทความ “${title}” ใช่หรือไม่?`)) return;
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบไม่สำเร็จ");
      setStatus({ type: "success", message: "ลบบทความแล้ว" });
      await load();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "ลบไม่สำเร็จ",
      });
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="จัดการบทความ"
        description="สร้าง แก้ไข และเผยแพร่บทความ — แสดงบนหน้า /articles ของเว็บไซต์ทันทีหลังบันทึก"
      />

      {status && (
        <div className="mb-4">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          สร้างบทความใหม่
        </Link>
      </div>

      <AdminCard title="รายการบทความทั้งหมด">
        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลด…</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-slate-400">ยังไม่มีบทความ — กดสร้างบทความใหม่เพื่อเริ่มต้น</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-2 pr-3">ภาพ</th>
                  <th className="pb-2 pr-3">ชื่อเรื่อง</th>
                  <th className="pb-2 pr-3">สถานะ</th>
                  <th className="pb-2 pr-3">อัปเดต</th>
                  <th className="pb-2">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a) => (
                  <tr key={a.id} className="align-middle">
                    <td className="py-3 pr-3">
                      {a.featuredImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.featuredImageUrl}
                          alt=""
                          className="h-12 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400">
                          ไม่มีรูป
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">/{a.slug}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          a.isPublished
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {a.isPublished ? "เผยแพร่" : "ฉบับร่าง"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-500">
                      {new Date(a.updatedAt).toLocaleString("th-TH")}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/articles/${encodeURIComponent(a.id)}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          แก้ไข
                        </Link>
                        <button
                          type="button"
                          onClick={() => void remove(a.id, a.title)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
