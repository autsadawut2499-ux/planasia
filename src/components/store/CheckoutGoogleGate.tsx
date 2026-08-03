"use client";

import { LogIn } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

/**
 * Checkout entry gate — Google Login as the primary low-friction identity step.
 * Captures real name/email for receipts and long-term re-downloads.
 */
export function CheckoutGoogleGate({
  thai,
  callbackUrl: callbackUrlProp,
  title,
}: {
  thai: boolean;
  /** Override return URL after Google sign-in (defaults to current page). */
  callbackUrl?: string;
  title?: string;
}) {
  const { status } = useSession();
  const pathname = usePathname();

  if (status === "authenticated") return null;

  const callbackUrl =
    callbackUrlProp ||
    (typeof window !== "undefined"
      ? `${pathname}${window.location.search || ""}`
      : pathname || "/store");

  return (
    <div className="rounded-xl border border-[#1e40af]/25 bg-gradient-to-br from-blue-50/90 to-white p-4">
      <h3 className="text-sm font-bold text-[#1e3a5f]">
        {title ??
          (thai ? "เข้าสู่ระบบเพื่อชำระเงิน" : "Sign in to checkout")}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
        {thai
          ? "เข้าสู่ระบบด้วย Google เพื่อดาวน์โหลดไฟล์และรับเอกสาร — ระบบจะใช้ชื่อและอีเมลของคุณอัตโนมัติสำหรับใบเสร็จและลิงก์ดาวน์โหลด"
          : "Sign in with Google to download files and receive documents. We’ll use your name and email automatically for receipts and download links."}
      </p>
      <button
        type="button"
        disabled={status === "loading"}
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-4 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {status === "loading"
          ? thai
            ? "กำลังโหลด…"
            : "Loading…"
          : thai
            ? "เข้าสู่ระบบด้วย Google"
            : "Sign in with Google"}
      </button>
    </div>
  );
}

export function useCheckoutAuthReady(): boolean {
  const { status } = useSession();
  return status === "authenticated";
}

/** Shared buyer session fields for checkout forms. */
export function useCheckoutBuyer() {
  const { data: session, status } = useSession();
  return {
    authReady: status === "authenticated",
    loading: status === "loading",
    sessionPrefill: {
      name: session?.user?.name,
      email: session?.user?.email,
    },
    buyerId: session?.user?.id,
  };
}
