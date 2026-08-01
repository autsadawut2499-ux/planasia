"use client";

import { useEffect, useState } from "react";
import { Heart, Eye, ShoppingBag, Pin, RefreshCw } from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminField,
  AdminInput,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import type { RankingConfig } from "@/lib/ranking/config";
import type { StoreListing } from "@/lib/store/db";

export default function RankingClient() {
  const [config, setConfig] = useState<RankingConfig | null>(null);
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/ranking", { cache: "no-store" });
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setConfig(data.config);
      setListings(data.listings ?? []);
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ผิดพลาด" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const setCfg = <K extends keyof RankingConfig>(k: K, v: RankingConfig[K]) =>
    setConfig((c) => (c ? { ...c, [k]: v } : c));

  async function saveConfig() {
    if (!config) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/ranking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "บันทึกไม่สำเร็จ");
      setStatus({ type: "success", message: "บันทึกและคำนวณคะแนนใหม่แล้ว" });
      await load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ผิดพลาด" });
    } finally {
      setSaving(false);
    }
  }

  async function recompute() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/ranking", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "คำนวณไม่สำเร็จ");
      setStatus({ type: "success", message: `คำนวณคะแนนใหม่แล้ว (${data.updated} รายการ)` });
      await load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ผิดพลาด" });
    } finally {
      setBusy(false);
    }
  }

  async function togglePin(listing: StoreListing) {
    const pinned = !listing.pinned;
    setListings((ls) => ls.map((l) => (l.id === listing.id ? { ...l, pinned } : l)));
    try {
      const res = await fetch("/api/admin/ranking/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, pinned }),
      });
      if (!res.ok) throw new Error("ปักหมุดไม่สำเร็จ");
    } catch {
      setListings((ls) => ls.map((l) => (l.id === listing.id ? { ...l, pinned: !pinned } : l)));
      setStatus({ type: "error", message: "ปักหมุดไม่สำเร็จ" });
    }
  }

  if (loading || !config) {
    return (
      <div>
        <AdminPageHeader title="Smart Ranking" />
        <p className="text-slate-500">กำลังโหลด…</p>
      </div>
    );
  }

  const sorted = [...listings].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.rankingScore ?? 0) - (a.rankingScore ?? 0);
  });

  return (
    <div>
      <AdminPageHeader
        title="Smart Ranking"
        description="ปรับน้ำหนักคะแนน ค่าความสดใหม่ และปักหมุดแบบบ้านที่ต้องการให้ขึ้นหน้าแรก"
      />

      {status && (
        <div className="mb-4">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <AdminCard title="น้ำหนักคะแนน (Weights)">
          <div className="grid grid-cols-3 gap-4">
            <AdminField label="Like ×">
              <AdminInput type="number" step="0.1" value={config.likeWeight} onChange={(e) => setCfg("likeWeight", Number(e.target.value))} />
            </AdminField>
            <AdminField label="View ×">
              <AdminInput type="number" step="0.01" value={config.viewWeight} onChange={(e) => setCfg("viewWeight", Number(e.target.value))} />
            </AdminField>
            <AdminField label="Sales ×">
              <AdminInput type="number" step="0.1" value={config.salesWeight} onChange={(e) => setCfg("salesWeight", Number(e.target.value))} />
            </AdminField>
          </div>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
            score = (likes×{config.likeWeight} + views×{config.viewWeight} + sales×{config.salesWeight} + 1) ÷ (อายุ(ชม.)+2)^{config.gravity}
          </p>
        </AdminCard>

        <AdminCard title="ความสดใหม่และการแสดงผล">
          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Time Decay (gravity)" hint="ยิ่งสูง งานเก่ายิ่งตกเร็ว">
              <AdminInput type="number" step="0.1" value={config.gravity} onChange={(e) => setCfg("gravity", Number(e.target.value))} />
            </AdminField>
            <AdminField label="รอบคำนวณ (นาที)">
              <AdminInput type="number" value={config.refreshMinutes} onChange={(e) => setCfg("refreshMinutes", Number(e.target.value))} />
            </AdminField>
            <AdminField label="จำนวนบนหน้าแรก">
              <AdminInput type="number" value={config.homeLimit} onChange={(e) => setCfg("homeLimit", Number(e.target.value))} />
            </AdminField>
            <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={config.randomize}
                onChange={(e) => setCfg("randomize", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              สุ่มกลุ่มคะแนนใกล้เคียง
            </label>
          </div>
        </AdminCard>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <AdminSaveButton saving={saving} onClick={saveConfig} label="บันทึกและคำนวณใหม่" />
        <button
          type="button"
          onClick={recompute}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          คำนวณคะแนนใหม่ทันที
        </button>
      </div>

      <AdminCard title={`อันดับแบบบ้าน (${sorted.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">แบบบ้าน</th>
                <th className="py-2 px-2 text-center"><Heart className="mx-auto h-4 w-4" /></th>
                <th className="py-2 px-2 text-center"><Eye className="mx-auto h-4 w-4" /></th>
                <th className="py-2 px-2 text-center"><ShoppingBag className="mx-auto h-4 w-4" /></th>
                <th className="py-2 px-2 text-right">คะแนน</th>
                <th className="py-2 pl-2 text-center">ปักหมุด</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((l, i) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.image} alt="" className="h-9 w-12 rounded object-cover" />
                      <span className="line-clamp-1 font-medium text-slate-800">{l.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600">{l.likesCount ?? 0}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{l.viewsCount ?? 0}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{l.salesCount ?? 0}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-700">{(l.rankingScore ?? 0).toFixed(2)}</td>
                  <td className="py-2 pl-2 text-center">
                    <button
                      type="button"
                      onClick={() => togglePin(l)}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                        l.pinned ? "bg-indigo-600 text-white" : "border border-slate-300 text-slate-400 hover:text-indigo-600"
                      }`}
                      aria-label={l.pinned ? "ยกเลิกปักหมุด" : "ปักหมุด"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
