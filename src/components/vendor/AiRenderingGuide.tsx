"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import {
  AI_RENDER_GUIDE_SLOT_COUNT,
  defaultAiRenderGuide,
  rewriteGuideSetTitle,
  type AiRenderGuide,
  type AiRenderGuideImageSet,
  type AiRenderGuidePrompt,
} from "@/lib/vendor/ai-render-guide";

function useGuide(): AiRenderGuide {
  const siteConfig = useSiteConfigOptional();
  return siteConfig?.aiRenderGuide ?? defaultAiRenderGuide();
}

function CopyPromptButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text.trim() || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text.trim()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e40af]/25 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1e40af] transition hover:bg-[#1e40af]/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" /> คัดลอกแล้ว
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> คัดลอกคำสั่ง
        </>
      )}
    </button>
  );
}

interface GuideSet {
  key: string;
  sortOrder: number;
  title: string;
  prompt: AiRenderGuidePrompt | null;
  images: AiRenderGuideImageSet | null;
}

function buildGuideSets(guide: AiRenderGuide): GuideSet[] {
  const prompts = [...guide.prompts].sort((a, b) => a.sortOrder - b.sortOrder);
  const images = [...guide.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const count = Math.max(prompts.length, images.length, AI_RENDER_GUIDE_SLOT_COUNT);

  return Array.from({ length: count }, (_, i) => {
    const prompt = prompts[i] ?? null;
    const imageSet = images[i] ?? null;
    const sortOrder = prompt?.sortOrder ?? imageSet?.sortOrder ?? i + 1;
    const title = rewriteGuideSetTitle(
      prompt?.title?.trim() || imageSet?.title?.trim() || `ชุดคำสั่ง ${sortOrder}`,
      sortOrder,
    );

    return {
      key: prompt?.id ?? imageSet?.id ?? `set-${sortOrder}`,
      sortOrder,
      title,
      prompt,
      images: imageSet,
    };
  }).filter((set) => {
    const hasPrompt = Boolean(set.prompt?.content.trim());
    const hasImages = Boolean(set.images?.beforeUrl || set.images?.afterUrl);
    return hasPrompt || hasImages;
  });
}

function BeforeAfterPair({
  title,
  beforeUrl,
  afterUrl,
}: {
  title: string;
  beforeUrl?: string;
  afterUrl?: string;
}) {
  if (!beforeUrl && !afterUrl) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-slate-50">
      <div className="grid grid-cols-2 gap-px bg-border">
        <figure className="bg-slate-50">
          {beforeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={beforeUrl}
              alt={`${title} — before`}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-[10px] text-text-muted">
              Before
            </div>
          )}
          <figcaption className="px-2 py-1.5 text-center text-[10px] font-medium text-text-muted">
            Before
          </figcaption>
        </figure>
        <figure className="bg-slate-50">
          {afterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={afterUrl}
              alt={`${title} — after`}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-[10px] text-text-muted">
              After
            </div>
          )}
          <figcaption className="px-2 py-1.5 text-center text-[10px] font-medium text-text-muted">
            After
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/** Admin-managed prompts + before/after examples for draftsman AI rendering workflow. */
export function AiRenderingGuide({ compact = false }: { compact?: boolean }) {
  const guide = useGuide();
  const sets = useMemo(() => buildGuideSets(guide), [guide]);

  if (sets.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface-raised/40 px-4 py-5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e40af]/10 text-[#1e40af]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-text-primary">คู่มือ AI Rendering Guide</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
              ยังไม่มีพร้อมพ์ตหรือตัวอย่างรูปจากแอดมิน — จะแสดงที่นี่เมื่ออัปเดตในแผงผู้ดูแลระบบ
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border/80 bg-[#0b1220]/[0.02] p-4 md:p-5">
      <div className="mb-5 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e40af] to-[#0f766e] text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-text-primary">คู่มือ AI Rendering Guide</h3>
          <p className="text-xs leading-relaxed text-text-muted">
            แต่ละชุดรวมตัวอย่าง Before / After กับพร้อมพ์ตไว้ด้วยกัน — คัดลอกไปใช้กับเครื่องมือ AI ด้านบนได้ทันที
          </p>
        </div>
      </div>

      <div className={`flex flex-col ${compact ? "gap-4" : "gap-6"}`}>
        {sets.map((set) => {
          const promptText = set.prompt?.content?.trim() ?? "";
          return (
            <article
              key={set.key}
              className="rounded-xl border border-border bg-white p-3.5 shadow-sm md:p-4"
            >
              <h4 className="text-sm font-bold text-[#1e3a5f]">{set.title}</h4>

              <div className="mt-3 space-y-3">
                <BeforeAfterPair
                  title={set.title}
                  beforeUrl={set.images?.beforeUrl}
                  afterUrl={set.images?.afterUrl}
                />

                {promptText ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        คำสั่ง
                      </p>
                      <CopyPromptButton text={promptText} />
                    </div>
                    <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/70 bg-slate-50 px-3 py-2.5 font-sans text-[12px] leading-relaxed text-text-secondary">
                      {promptText}
                    </pre>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
