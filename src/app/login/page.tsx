"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

function UserLoginForm() {
  const { uiLocale } = useApp();
  const thai = uiLocale === "th";
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-text-muted">
          {thai ? "กำลังโหลด…" : "Loading…"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#1e3a5f]">
        {thai ? "เข้าสู่ระบบ" : "Sign in"}
      </h1>
      <p className="mt-2 text-center text-sm text-text-secondary">
        {thai
          ? "เข้าสู่ระบบด้วย Google เพื่อดาวน์โหลดไฟล์และรับเอกสาร"
          : "Sign in with Google to download files and receive documents."}
      </p>
      <p className="mt-1.5 text-center text-xs text-text-muted">
        {thai
          ? "ระบบจะใช้ชื่อและอีเมลของคุณอัตโนมัติสำหรับใบเสร็จและลิงก์ดาวน์โหลด — ไม่ต้องตั้งรหัสผ่าน"
          : "We’ll use your name and email automatically for receipts and download links — no password needed."}
      </p>

      {error && (
        <div className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {thai
            ? "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่"
            : "Sign-in failed. Please try again."}
        </div>
      )}

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e3a8a]"
      >
        <LogIn className="h-4 w-4" />
        {thai ? "เข้าสู่ระบบด้วย Google" : "Sign in with Google"}
      </button>

      <p className="mt-6 text-center text-xs text-text-muted">
        {thai ? "ผู้ดูแลระบบ?" : "Admin?"}{" "}
        <Link
          href="/admin/login"
          className="font-medium text-[#1e40af] hover:underline"
        >
          {thai ? "เข้าสู่ระบบแอดมิน" : "Admin sign in"}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-text-muted">Loading…</p>
        </div>
      }
    >
      <UserLoginForm />
    </Suspense>
  );
}
