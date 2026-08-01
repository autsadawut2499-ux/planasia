"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { useToast } from "@/context/ToastContext";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

type PushStatus = "loading" | "unsupported" | "disabled" | "denied" | "subscribed" | "ready";

/**
 * Lets a draftsman opt into sale alerts on this device. The subscription is
 * stored against their owner_key so the payment webhook can wake the phone
 * the moment a plan sells — even at 2am.
 */
export function EnablePushNotifications() {
  const viewer = useStoreViewer();
  const toast = useToast();
  const [status, setStatus] = useState<PushStatus>("loading");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setStatus("subscribed");
        return;
      }
      const vapid = await fetch("/api/push/vapid").then((r) => r.json()).catch(() => null);
      setStatus(vapid?.configured ? "ready" : "disabled");
    } catch {
      setStatus("disabled");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function enable() {
    if (!viewer.ready) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        toast.error("คุณปฏิเสธการแจ้งเตือน — เปิดได้ในการตั้งค่าเบราว์เซอร์");
        return;
      }

      const vapidRes = await fetch("/api/push/vapid");
      const vapid = await vapidRes.json();
      if (!vapidRes.ok || !vapid.publicKey) {
        throw new Error("ระบบแจ้งเตือนยังไม่พร้อมตั้งค่า");
      }

      // Ensure SW is registered even in local/dev when testing push.
      const reg =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }));
      await reg.update().catch(() => undefined);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid.publicKey) as BufferSource,
      });
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...viewer.headers() },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "บันทึกการแจ้งเตือนไม่สำเร็จ");
      }

      setStatus("subscribed");
      toast.success("เปิดแจ้งเตือนแล้ว — เมื่อมีคนซื้อแบบ โทรศัพท์จะเด้งทันที");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เปิดแจ้งเตือนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...viewer.headers() },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("ready");
      toast.success("ปิดการแจ้งเตือนบนเครื่องนี้แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ปิดไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading" || status === "unsupported" || status === "disabled") {
    if (status === "unsupported") {
      return (
        <p className="text-xs text-text-muted">
          เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนแบบพุช — ลองใช้ Chrome / Edge บนมือถือหรือเดสก์ท็อป
        </p>
      );
    }
    if (status === "disabled") {
      return (
        <p className="text-xs text-text-muted">
          ระบบแจ้งเตือนกำลังรอตั้งค่า VAPID จากผู้ดูแลระบบ
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1e40af]/20 bg-blue-50/70 px-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f]">
          {status === "subscribed" ? (
            <BellRing className="h-4 w-4 text-[#1e40af]" />
          ) : (
            <Bell className="h-4 w-4 text-[#1e40af]" />
          )}
          แจ้งเตือนเมื่อมีคนซื้อแบบ
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {status === "subscribed"
            ? "เครื่องนี้พร้อมรับสัญญาณแล้ว — แม้คุณนอนหลับอยู่ ระบบจะเด้งแจ้งเมื่อเงินเข้า"
            : status === "denied"
              ? "เบราว์เซอร์บล็อกการแจ้งเตือนไว้ กรุณาอนุญาตในการตั้งค่าไซต์"
              : "กดเปิดเพื่อให้โทรศัพท์ดังทันทีเมื่อแบบบ้านของคุณถูกซื้อ (เช่น MOD-001)"}
        </p>
      </div>
      {status === "subscribed" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void disable()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-raised disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
          ปิดบนเครื่องนี้
        </button>
      ) : status !== "denied" ? (
        <button
          type="button"
          disabled={busy || !viewer.ready}
          onClick={() => void enable()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e40af] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3a8a] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
          เปิดแจ้งเตือน
        </button>
      ) : null}
    </div>
  );
}
