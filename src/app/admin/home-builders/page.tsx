"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Eye, EyeOff, Trash2, X } from "lucide-react";
import {
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import type { HomeBuilder } from "@/lib/home-building/types";

export default function AdminHomeBuildersPage() {
  const [builders, setBuilders] = useState<HomeBuilder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/home-builders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
      setBuilders(data.builders ?? []);
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>, okMsg: string) {
    setBusyId(id);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/home-builders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปเดตไม่สำเร็จ");
      setBuilders((prev) => prev.map((b) => (b.id === id ? data.builder : b)));
      setStatus({ type: "success", message: okMsg });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("ลบใบสมัครนี้ถาวร?")) return;
    setBusyId(id);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/home-builders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบไม่สำเร็จ");
      setBuilders((prev) => prev.filter((b) => b.id !== id));
      setStatus({ type: "success", message: "ลบใบสมัครแล้ว" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "ลบไม่สำเร็จ",
      });
    } finally {
      setBusyId(null);
    }
  }

  const pending = builders.filter((b) => b.status === "pending");
  const others = builders.filter((b) => b.status !== "pending");

  return (
    <div>
      <AdminPageHeader
        title="รับสร้างบ้าน — ใบสมัครผู้รับสร้าง"
        description="ตรวจสอบเอกสาร อนุมัติ และเผยแพร่โปรไฟล์ผู้รับสร้างไปยังหน้า /home-building"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">กำลังโหลดใบสมัคร…</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-700">
              รอตรวจสอบ ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                ยังไม่มีใบสมัครรอตรวจสอบ
              </p>
            ) : (
              <ul className="space-y-4">
                {pending.map((b) => (
                  <BuilderAdminCard
                    key={b.id}
                    builder={b}
                    busy={busyId === b.id}
                    onApprove={() =>
                      void patch(b.id, { status: "approved", isPublished: true }, "อนุมัติและเผยแพร่แล้ว")
                    }
                    onReject={() => void patch(b.id, { status: "rejected" }, "ปฏิเสธใบสมัครแล้ว")}
                    onDelete={() => void remove(b.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              ทั้งหมดที่เหลือ ({others.length})
            </h2>
            {others.length === 0 ? (
              <p className="text-sm text-slate-500">ยังไม่มีรายการที่อนุมัติหรือปฏิเสธ</p>
            ) : (
              <ul className="space-y-4">
                {others.map((b) => (
                  <BuilderAdminCard
                    key={b.id}
                    builder={b}
                    busy={busyId === b.id}
                    onApprove={() =>
                      void patch(b.id, { status: "approved", isPublished: true }, "เผยแพร่แล้ว")
                    }
                    onUnpublish={() =>
                      void patch(b.id, { isPublished: false }, "ยกเลิกการเผยแพร่แล้ว")
                    }
                    onReject={() => void patch(b.id, { status: "rejected" }, "ปฏิเสธแล้ว")}
                    onDelete={() => void remove(b.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function BuilderAdminCard({
  builder,
  busy,
  onApprove,
  onReject,
  onUnpublish,
  onDelete,
}: {
  builder: HomeBuilder;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onUnpublish?: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">{builder.companyName}</p>
          <p className="mt-0.5 text-sm text-slate-600">
            {builder.contactPerson} · {builder.phone} · {builder.email}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            พื้นที่: {builder.serviceAreas || "—"} · ประสบการณ์ {builder.yearsExperience} ปี
            {builder.lineId ? ` · LINE ${builder.lineId}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              label={builder.status}
              tone={
                builder.status === "approved"
                  ? "green"
                  : builder.status === "rejected"
                    ? "red"
                    : "amber"
              }
            />
            <Badge
              label={builder.isPublished ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
              tone={builder.isPublished ? "blue" : "slate"}
            />
            <Badge label={`ผลงาน ${builder.portfolioUrls.length} รูป`} tone="slate" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(builder.status !== "approved" || !builder.isPublished) && (
            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              อนุมัติ / เผยแพร่
            </button>
          )}
          {builder.isPublished && onUnpublish && (
            <button
              type="button"
              disabled={busy}
              onClick={onUnpublish}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <EyeOff className="h-3.5 w-3.5" />
              ยกเลิกเผยแพร่
            </button>
          )}
          {builder.status !== "rejected" && (
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              ปฏิเสธ
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ลบ
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {builder.companyCertificateUrl && (
          <a
            href={builder.companyCertificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
          >
            <Eye className="h-3.5 w-3.5" />
            หนังสือรับรองบริษัท
          </a>
        )}
        {builder.verificationDocumentUrl && (
          <a
            href={builder.verificationDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
          >
            <Eye className="h-3.5 w-3.5" />
            เอกสารยืนยันตัวตน
          </a>
        )}
        {builder.portfolioUrls.slice(0, 4).map((url) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-12 w-16 rounded object-cover ring-1 ring-slate-200" />
          </a>
        ))}
      </div>
    </li>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "red" | "amber" | "blue" | "slate";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "red"
        ? "bg-red-50 text-red-700"
        : tone === "amber"
          ? "bg-amber-50 text-amber-800"
          : tone === "blue"
            ? "bg-indigo-50 text-indigo-700"
            : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
  );
}
