"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Planasia] Route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-2xl font-bold text-text">Unable to load this page</h1>
      <p className="mb-2 text-sm text-text-secondary">
        เกิดข้อผิดพลาดฝั่งไคลเอ็นต์ — โปรดลองใหม่อีกครั้ง
      </p>
      <p className="mb-8 text-xs text-text-muted">
        หากยังไม่หาย ให้กด Ctrl+Shift+R (Hard refresh) หรือล้าง cache ของเบราว์เซอร์
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
