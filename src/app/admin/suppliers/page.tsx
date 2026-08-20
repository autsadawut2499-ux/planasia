"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { PrimaryButton, TextInput } from "@/components/vendor/ui";
import type { SupplierKind } from "@/lib/store/supplier-platform";

interface SupplierRow {
  id: string;
  name: string;
  kind: SupplierKind;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  listingCount?: number;
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/suppliers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
      const list = (data.suppliers ?? []) as SupplierRow[];
      const withCounts = await Promise.all(
        list.map(async (s) => {
          try {
            const r = await fetch(`/api/admin/suppliers/${encodeURIComponent(s.id)}`, {
              cache: "no-store",
            });
            const d = await r.json();
            return { ...s, listingCount: r.ok ? Number(d.listingCount ?? 0) : undefined };
          } catch {
            return s;
          }
        }),
      );
      setSuppliers(withCounts);
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

  const platforms = useMemo(
    () => suppliers.filter((s) => s.kind === "platform"),
    [suppliers],
  );
  const customs = useMemo(
    () => suppliers.filter((s) => s.kind !== "platform"),
    [suppliers],
  );

  function openCreate() {
    setEditing(null);
    setName("");
    setModalOpen(true);
  }

  function openEdit(s: SupplierRow) {
    if (s.kind === "platform") return;
    setEditing(s);
    setName(s.name);
    setModalOpen(true);
  }

  async function saveModal() {
    const trimmed = name.trim();
    if (!trimmed) {
      setStatus({ type: "error", message: "กรุณากรอกชื่อซัพพลายเออร์" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/suppliers/${encodeURIComponent(editing.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "อัปเดตไม่สำเร็จ");
        setStatus({ type: "success", message: "แก้ไขชื่อซัพพลายเออร์แล้ว" });
      } else {
        const res = await fetch("/api/admin/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "สร้างไม่สำเร็จ");
        setStatus({ type: "success", message: "เพิ่มซัพพลายเออร์แล้ว" });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(s: SupplierRow) {
    if (s.kind === "platform") return;
    if (!window.confirm(`ลบซัพพลายเออร์ “${s.name}” ถาวร?`)) return;
    setBusyId(s.id);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/suppliers/${encodeURIComponent(s.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบไม่สำเร็จ");
      setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
      setStatus({ type: "success", message: "ลบซัพพลายเออร์แล้ว" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "ลบไม่สำเร็จ",
      });
    } finally {
      setBusyId(null);
    }
  }

  function renderTable(rows: SupplierRow[], title: string, fixed: boolean) {
    return (
      <AdminCard>
        <h3 className="mb-3 text-sm font-bold text-[#1e3a5f]">{title}</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">ยังไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-3 font-semibold">ชื่อ</th>
                  <th className="pb-3 pr-3 font-semibold">แบบบ้านที่ผูก</th>
                  <th className="pb-3 pr-3 font-semibold">อัปเดตล่าสุด</th>
                  <th className="pb-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 align-middle">
                    <td className="py-3 pr-3 font-medium text-slate-900">
                      {s.name}
                      {fixed ? (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Fixed
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {s.listingCount != null ? s.listingCount : "—"}
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-500">
                      {s.updatedAt ? new Date(s.updatedAt).toLocaleString("th-TH") : "—"}
                    </td>
                    <td className="py-3">
                      {fixed ? (
                        <span className="text-[11px] text-slate-400">แก้ไข/ลบไม่ได้</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            disabled={busyId === s.id}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(s)}
                            disabled={busyId === s.id}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            ลบ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="ซัพพลายเออร์"
        description="แพลตฟอร์มหลัก (Shopee/Lazada) คงที่ · ซัพพลายเออร์ทั่วไปเพิ่ม/แก้/ลบได้ — ใช้ผูกออเดอร์และแจ้ง LINE OA"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <PrimaryButton onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          เพิ่มซัพพลายเออร์ใหม่
        </PrimaryButton>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">กำลังโหลด…</p>
      ) : (
        <div className="space-y-5">
          {renderTable(platforms, "กลุ่มที่ 1 — แพลตฟอร์มหลัก (Fixed)", true)}
          {renderTable(customs, "กลุ่มที่ 2 — ซัพพลายเออร์ทั่วไป (Editable)", false)}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold text-[#1e3a5f]">
              {editing ? "แก้ไขซัพพลายเออร์" : "เพิ่มซัพพลายเออร์ใหม่"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              ชื่อนี้จะโผล่ใน Dropdown ของฟอร์มแบบบ้านทันทีหลังบันทึก
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                ชื่อซัพพลายเออร์ *
              </span>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 120))}
                placeholder="เช่น aphouse"
                maxLength={120}
                autoFocus
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <PrimaryButton onClick={() => void saveModal()} loading={saving}>
                บันทึก
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
