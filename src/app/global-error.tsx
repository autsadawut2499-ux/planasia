"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Planasia] Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] font-sans text-white antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold">
            P
          </div>
          <h1 className="mb-3 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-2 text-sm text-white/70">
            เกิดข้อผิดพลาดฝั่งไคลเอ็นต์ขณะโหลด Planasia
          </p>
          <p className="mb-8 text-xs text-white/45">
            มักเกิดจาก cache เก่าหลังอัปเดตเว็บ — ลองรีเฟรชหรือล้าง cache
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/90"
            >
              Reload page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
