"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, KeyRound } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

function AdminPinGate() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const error = searchParams.get("error");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Already unlocked with PIN — go to the dashboard (or callback).
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      router.replace(callbackUrl.startsWith("/admin") ? callbackUrl : "/admin");
    }
  }, [status, session?.user?.isAdmin, callbackUrl, router]);

  async function handlePinSubmit(e: React.FormEvent) {
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
      // Drop any buyer/Google session first so the JWT is stamped as admin-only.
      await signOut({ redirect: false });

      const result = await signIn("admin-pin", {
        pin: cleanPin,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setFormError("รหัส PIN ไม่ถูกต้อง");
        setPin("");
        setLoading(false);
        return;
      }

      window.location.href = result?.url || callbackUrl || "/admin";
    } catch {
      setFormError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
      setLoading(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && session?.user?.isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-sm text-slate-400">กำลังโหลด…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e40af]">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin PIN</h1>
          <p className="mt-2 text-sm text-slate-400">
            กรอกรหัส PIN 6 หลักเพื่อเข้าแผงผู้ดูแลระบบ
          </p>
        </div>

        {(error || formError) && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {formError ?? "เข้าสู่ระบบไม่สำเร็จ"}
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label htmlFor="admin-pin" className="sr-only">
              รหัส PIN 6 หลัก
            </label>
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white placeholder:text-slate-500 focus:border-[#1e40af] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e3a8a] disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>
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
      <AdminPinGate />
    </Suspense>
  );
}
