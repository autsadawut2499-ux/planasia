"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AdminCard,
  AdminCheckbox,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Article } from "@/lib/content/articles";

export default function AdminArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = String(params?.id ?? "");
  const isNew = rawId === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (isNew) return;
    let active = true;
    fetch(`/api/admin/articles?id=${encodeURIComponent(rawId)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
        return data.article as Article;
      })
      .then((article) => {
        if (!active || !article) return;
        setTitle(article.title);
        setContent(article.content);
        setFeaturedImageUrl(article.featuredImageUrl ?? null);
        setIsPublished(article.isPublished);
      })
      .catch((err) =>
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
        }),
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isNew, rawId]);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        id: isNew ? undefined : rawId,
        title,
        content,
        featuredImageUrl,
        isPublished,
      };
      const res = await fetch("/api/admin/articles", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setStatus({ type: "success", message: "บันทึกเรียบร้อยแล้ว — แสดงบนหน้าบทความทันที" });
      if (isNew && data.article?.id) {
        router.replace(`/admin/articles/${encodeURIComponent(data.article.id)}`);
      }
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
    return <p className="text-slate-500">กำลังโหลด…</p>;
  }

  return (
    <div>
      <Link
        href="/admin/articles"
        className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
      >
        ← กลับรายการบทความ
      </Link>
      <AdminPageHeader
        title={isNew ? "สร้างบทความใหม่" : "แก้ไขบทความ"}
        description="กรอกชื่อเรื่อง เนื้อหา และภาพปก — ติ๊กเผยแพร่เพื่อแสดงบน /articles"
      />

      {status && (
        <div className="mb-4">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <AdminCard title="รายละเอียดบทความ">
        <div className="space-y-5">
          <AdminField label="ชื่อเรื่อง (Title) *">
            <AdminInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น วิธีเลือกแบบบ้านให้เหมาะกับที่ดิน"
              maxLength={200}
            />
          </AdminField>

          <ImageUploadField
            label="ภาพปก (Featured Image)"
            hint="แนะนำอัตราส่วนกว้าง เช่น 1200×630 — อัปโหลดผ่านระบบแอดมิน"
            value={featuredImageUrl}
            onChange={setFeaturedImageUrl}
            category="articles"
            previewClassName="h-40 w-full max-w-md object-cover"
          />

          <AdminField label="เนื้อหา (Content)">
            <AdminRichTextEditor
              value={content}
              onChange={setContent}
              placeholder="เขียนเนื้อหาบทความ…"
              minHeightClass="min-h-[280px]"
            />
          </AdminField>

          <AdminCheckbox
            label="เผยแพร่บนหน้าเว็บสาธารณะ (/articles)"
            checked={isPublished}
            onChange={setIsPublished}
          />

          <AdminSaveButton
            saving={saving}
            onClick={() => void save()}
            label={isNew ? "สร้างบทความ" : "บันทึกการเปลี่ยนแปลง"}
          />
        </div>
      </AdminCard>
    </div>
  );
}
