"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Shield, KeyRound } from "lucide-react";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const error = searchParams.get("error");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handlePinLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const cleanPin = pin.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setLoading(false);
      setFormError("กรุณาใส่รหัส PIN ให้ครบ 6 หลัก");
      return;
    }

    try {
      // Drop any buyer/Google session first so the JWT is stamped cleanly as admin.
      await signOut({ redirect: false });

      const result = await signIn("admin-pin", {
        pin: cleanPin,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setFormError(
          "รหัส PIN ไม่ถูกต้อง หรือเซิร์ฟเวอร์ยังไม่ได้ตั้ง ADMIN_PIN — ลองใหม่หรือตรวจค่า env",
        );
        setLoading(false);
        return;
      }

      window.location.href = result?.url || callbackUrl || "/admin";
    } catch {
      setFormError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-sm text-slate-400">กำลังโหลด…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e40af]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ผู้ดูแลระบบ Planasia</h1>
            <p className="text-sm text-slate-400">เข้าสู่ระบบด้วยรหัส PIN 6 หลัก</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          จุดเข้าถึงผู้ดูแลระบบต้องยืนยันด้วยรหัส PIN ก่อนจัดการเนื้อหาและรูปภาพบ้าน
        </p>

        {(error || formError) && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {formError ?? "เข้าสู่ระบบไม่สำเร็จ"}
          </div>
        )}

        <form onSubmit={handlePinLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-pin" className="mb-1.5 block text-xs font-medium text-slate-400">
              รหัส PIN 6 หลัก
            </label>
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg tracking-[0.4em] text-white placeholder:text-slate-500 focus:border-[#1e40af] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e3a8a] disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบผู้ดูแล"}
          </button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-center text-[11px] text-slate-500">
            โหมดพัฒนา — รหัสเริ่มต้นคือ{" "}
            <span className="font-mono tracking-wider text-slate-400">501499</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900">
          <p className="text-sm text-slate-400">กำลังโหลด…</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
