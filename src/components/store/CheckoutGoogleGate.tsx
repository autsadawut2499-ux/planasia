"use client";

import { LogIn } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

/**
 * Optional Google sign-in for checkout — saves receipts/downloads to the account.
 * Guest checkout is always allowed without contact fields.
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
      : pathname || "/");

  return (
    <div className="rounded-xl border border-[#1e40af]/20 bg-gradient-to-br from-blue-50/70 to-white p-3.5">
      <h3 className="text-sm font-semibold text-[#1e3a5f]">
        {title ??
          (thai
            ? "เข้าสู่ระบบด้วย Google (ไม่บังคับ)"
            : "Sign in with Google (optional)")}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
        {thai
          ? "เข้าสู่ระบบเพื่อบันทึกใบเสร็จและลิงก์ดาวน์โหลดในบัญชี — ไม่บังคับ สามารถสั่งซื้อได้เลย"
          : "Sign in to save the receipt and download links to your account — optional, you can place an order without signing in."}
      </p>
      <button
        type="button"
        disabled={status === "loading"}
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-2.5 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#1e40af]/30 bg-white px-4 text-sm font-semibold text-[#1e40af] transition hover:bg-blue-50 disabled:opacity-60"
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
