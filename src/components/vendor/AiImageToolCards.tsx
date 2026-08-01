"use client";

import { Sparkles } from "lucide-react";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { AI_IMAGE_TOOLS } from "@/lib/vendor/ai-image-tools";

/** Shortcut cards to the AI tools vendors use to produce listing renders. */
export function AiImageToolCards({ compact = false }: { compact?: boolean }) {
  const siteConfig = useSiteConfigOptional();
  const tools = siteConfig?.aiImageTools?.length ? siteConfig.aiImageTools : AI_IMAGE_TOOLS;

  return (
    <section className="rounded-2xl border border-border/80 bg-[#0b1220]/[0.02] p-4 md:p-5">
      <div className="mb-3.5 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e40af] to-[#6366f1] text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-text-primary">เครื่องมือ AI สร้างภาพเรนเดอร์</h3>
          <p className="text-xs leading-relaxed text-text-muted">
            เลือกเครื่องมือด้านล่างเพื่อสร้างภาพ แล้วนำมาอัปโหลดในขั้นตอนส่งผลงาน
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {tools.map((tool) => (
          <a
            key={tool.id}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tool.name}
            className={`group relative isolate overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)] outline-none transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(15,23,42,0.55)] focus-visible:ring-2 focus-visible:ring-offset-2 ${
              compact ? "min-h-[148px]" : "min-h-[168px]"
            }`}
            style={{ ["--tool-accent" as string]: tool.accent }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.previewImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />

            <span
              className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/95 via-[#0b1220]/55 to-[#0b1220]/20"
              aria-hidden
            />
            <span
              className="absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.35),transparent_55%)]"
              aria-hidden
            />
            <span
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
              aria-hidden
            />

            <span
              className={`relative z-[1] flex h-full flex-col justify-end ${
                compact ? "p-3.5" : "p-4"
              }`}
            >
              <span className="mb-2 h-0.5 w-8 rounded-full bg-[var(--tool-accent)] opacity-90 transition group-hover:w-12" />
              <span className="text-[15px] font-semibold tracking-tight text-white drop-shadow-sm">
                {tool.name}
              </span>
              <span className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/80">
                {tool.purpose}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
