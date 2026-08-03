"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BedDouble, Bath, Layers, Loader2, Send, Sparkles, X } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useInteractionTracker } from "@/hooks/useInteractionTracker";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import type { PlanChatListingCard } from "@/lib/gemini/capabilities/plan-chat";

type ChatRole = "user" | "assistant";

interface ChatTurn {
  id: string;
  role: ChatRole;
  content: string;
  listings?: PlanChatListingCard[];
}

/** Open the AI plan finder; optional `message` auto-sends after open. */
export const OPEN_AI_CHAT_EVENT = "planasia:open-ai-chat";

export function openAiPlanChat(message?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_AI_CHAT_EVENT, {
      detail: { message: message?.trim() || undefined },
    }),
  );
}

function shouldHideAiChat(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function shouldHideFab(pathname: string | null): boolean {
  if (!pathname) return false;
  // Home uses the in-hero AI search entry — hide the floating FAB there.
  if (pathname === "/") return true;
  return shouldHideAiChat(pathname);
}

function makeId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const SUGGESTIONS_TH = [
  "บ้าน 3 ห้องนอน งบไม่เกิน 3 ล้าน",
  "สไตล์โมเดิร์น ที่ดินกว้าง 10 ม. ลึก 15 ม.",
  "บ้านชั้นเดียว พื้นที่ใช้สอยประมาณ 120 ตร.ม.",
];

const SUGGESTIONS_EN = [
  "3-bedroom house under 3 million THB",
  "Modern style, land 10m × 15m",
  "Single-storey home around 120 sqm",
];

/**
 * Global AI plan-finder FAB + right drawer.
 * Stacks above the contact FAB at bottom-right.
 */
export function AiPlanChat() {
  const pathname = usePathname();
  const L = useBilingual();
  const { formatMoney, uiLocale } = useApp();
  const toast = useToast();
  const viewer = useStoreViewer();
  const { track } = useInteractionTracker();
  const panelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [pendingLaunch, setPendingLaunch] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const welcomeText = L(
    "Hi — I’m Planasia’s plan finder. Tell me your budget, bedrooms, style, or land size and I’ll recommend real listings from our store.",
    "สวัสดีครับ — ผมช่วยหาแบบบ้านจากแคตตาล็อกจริงของ Planasia ได้ บอกลงบ ห้องนอน สไตล์ หรือขนาดที่ดินได้เลย",
  );
  const suggestions = uiLocale === "th" ? SUGGESTIONS_TH : SUGGESTIONS_EN;

  const displayMessages: ChatTurn[] =
    messages.length === 0
      ? [{ id: "welcome", role: "assistant", content: welcomeText }]
      : messages;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onOpenAiChat(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setOpen(true);
      const msg = detail?.message?.trim();
      if (msg) setPendingLaunch(msg);
    }
    window.addEventListener(OPEN_AI_CHAT_EVENT, onOpenAiChat);
    return () => window.removeEventListener(OPEN_AI_CHAT_EVENT, onOpenAiChat);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [open]);

  async function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || sendingRef.current) return;

    const userTurn: ChatTurn = { id: makeId(), role: "user", content: text };
    const nextHistory = [...messages, userTurn]
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userTurn]);
    setInput("");
    sendingRef.current = true;
    setSending(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...viewer.headers(),
        },
        body: JSON.stringify({
          message: text,
          history: nextHistory.slice(-8),
          uiLocale,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        reply?: string;
        listings?: PlanChatListingCard[];
        keywords?: string[];
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error || "Chat failed");
      }

      const listings = Array.isArray(data?.listings) ? data.listings : [];
      const reply =
        data?.reply?.trim() ||
        L(
          "Here are some plans from our catalog.",
          "นี่คือแบบบ้านจากแคตตาล็อกของเราครับ",
        );

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: reply,
          listings,
        },
      ]);

      for (const item of listings.slice(0, 5)) {
        track(item.id, "chat", {
          query: text,
          keywords: data?.keywords ?? [],
          source: "ai-plan-chat",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed";
      toast.error(
        L("Could not reach the AI assistant", "เชื่อมต่อผู้ช่วย AI ไม่สำเร็จ"),
      );
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: L(
            `Sorry — something went wrong (${msg}). Please try again in a moment.`,
            `ขออภัย ระบบขัดข้องชั่วคราว (${msg}) ลองใหม่อีกครั้งนะครับ`,
          ),
        },
      ]);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  useEffect(() => {
    if (!open || !pendingLaunch) return;
    const msg = pendingLaunch;
    setPendingLaunch(null);
    void sendMessage(msg);
    // Intentionally run once per pending launch when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingLaunch]);

  if (shouldHideAiChat(pathname)) return null;

  // Panel stays mounted on public pages; FAB is hidden on home (hero entry).
  const hideFab = shouldHideFab(pathname);

  return (
    <>
      {!hideFab && (
        <button
          type="button"
          aria-label={
            open
              ? L("Close AI chat", "ปิดแชท AI")
              : L("AI house-plan finder", "AI ค้นหาแบบบ้าน")
          }
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={`ai-plan-fab${open ? " ai-plan-fab--open" : ""}`}
        >
          <span className="ai-plan-fab__orbit" aria-hidden />
          <span className="ai-plan-fab__glow" aria-hidden />
          <span className="ai-plan-fab__inner">
            {open ? (
              <>
                <X className="h-4 w-4 shrink-0" strokeWidth={2.4} />
                <span className="ai-plan-fab__label">{L("Close", "ปิด")}</span>
              </>
            ) : (
              <>
                <span className="ai-plan-fab__emoji" aria-hidden>
                  ✨
                </span>
                <span className="ai-plan-fab__label">AI ค้นหาแบบบ้าน</span>
              </>
            )}
          </span>
        </button>
      )}

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[72] bg-black/40 backdrop-blur-[1px]"
            aria-label={L("Close AI chat", "ปิดแชท AI")}
            onClick={() => setOpen(false)}
          />
          <aside
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={L("AI plan finder", "ผู้ช่วยหาแบบบ้าน AI")}
            className="fixed inset-y-0 right-0 z-[73] flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border bg-gradient-to-br from-[#1e40af]/[0.06] via-white to-[#1a2744]/[0.04] px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1e40af] text-white">
                    <Sparkles className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-[#1a2744]">
                      {L("AI Plan Finder", "ผู้ช่วยหาแบบบ้าน AI")}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {L(
                        "Search real Planasia listings with Gemini",
                        "ค้นหาแบบบ้านจริงใน Planasia ด้วย Gemini",
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-surface-raised hover:text-slate-800"
                aria-label={L("Close", "ปิด")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {displayMessages.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      turn.role === "user"
                        ? "bg-[#1e40af] text-white"
                        : "border border-border bg-surface-raised text-text-primary"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{turn.content}</p>
                    {turn.listings && turn.listings.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {turn.listings.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="flex gap-2.5 rounded-xl border border-border bg-white p-2 transition hover:border-[#1e40af]/40 hover:shadow-sm"
                            >
                              <img
                                src={item.image}
                                alt=""
                                className="h-16 w-20 shrink-0 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-[13px] font-semibold text-[#1a2744]">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-[#1e40af]">
                                  {formatMoney(item.price)}
                                </p>
                                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-muted">
                                  <span className="inline-flex items-center gap-0.5">
                                    <BedDouble className="h-3 w-3" /> {item.beds}
                                  </span>
                                  <span className="inline-flex items-center gap-0.5">
                                    <Bath className="h-3 w-3" /> {item.baths}
                                  </span>
                                  <span className="inline-flex items-center gap-0.5">
                                    <Layers className="h-3 w-3" /> {item.floors}
                                  </span>
                                  <span>{item.area}</span>
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-[#1e40af]" />
                    {L("Searching plans…", "กำลังค้นหาแบบบ้าน…")}
                  </div>
                </div>
              )}

              {messages.length === 0 && !sending && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => void sendMessage(hint)}
                      className="rounded-full border border-[#1e40af]/25 bg-white px-3 py-1.5 text-left text-xs font-medium text-[#1e40af] transition hover:bg-[#1e40af]/5"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="border-t border-border bg-white px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
            >
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface-raised px-2.5 py-2 focus-within:border-[#1e40af]/50 focus-within:ring-2 focus-within:ring-[#1e40af]/15">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={L(
                    "e.g. 3 beds, modern, under 2.5M…",
                    "เช่น 3 ห้องนอน โมเดิร์น งบ 2.5 ล้าน…",
                  )}
                  className="max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={L("Send", "ส่ง")}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-text-muted">
                {L(
                  "Recommendations use live store listings.",
                  "ผลลัพธ์มาจากแบบบ้านจริงในร้านค้า",
                )}
              </p>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
