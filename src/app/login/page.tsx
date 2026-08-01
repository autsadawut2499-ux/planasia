"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Suspense, useEffect } from "react";
import Link from "next/link";

function UserLoginForm() {
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
        <p className="text-sm text-text-muted">กำลังโหลด…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#1e3a5f]">เข้าสู่ระบบ</h1>
      <p className="mt-2 text-center text-sm text-text-muted">
        ใช้บัญชี Google เพื่อเข้าสู่ระบบ Planasia
      </p>

      {error && (
        <div className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่
        </div>
      )}

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e3a8a]"
      >
        <LogIn className="h-4 w-4" />
        เข้าสู่ระบบด้วย Google
      </button>

      <p className="mt-6 text-center text-xs text-text-muted">
        ผู้ดูแลระบบ?{" "}
        <Link href="/admin/login" className="font-medium text-[#1e40af] hover:underline">
          เข้าสู่ระบบแอดมิน
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
          <p className="text-sm text-text-muted">กำลังโหลด…</p>
        </div>
      }
    >
      <UserLoginForm />
    </Suspense>
  );
}
