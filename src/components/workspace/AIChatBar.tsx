"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { ChatMessage, ProjectInput } from "@/lib/ai/types";

interface AIChatBarProps {
  project: ProjectInput;
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function AIChatBar({ project, onMessagesChange }: AIChatBarProps) {
  const { locale, country, translate } = useApp();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const next = [...prev, userMsg];
      onMessagesChange?.(next);
      return next;
    });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          project,
          locale,
          countryCode: country.code,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        agent: data.agent,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const next = [...prev, assistantMsg];
        onMessagesChange?.(next);
        return next;
      });
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          locale === "th"
            ? "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
            : "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, project, locale, country.code, messages, onMessagesChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="shrink-0 border-t border-white/8 bg-surface/80 px-4 py-4 backdrop-blur-xl">
      {messages.length > 0 && (
        <div className="mb-3 max-h-36 space-y-2 overflow-y-auto rounded-2xl border border-white/8 bg-white/3 p-3">
          {messages.slice(-4).map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 text-xs ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/20">
                  <Sparkles className="h-3 w-3 text-accent" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent/20 text-indigo-100"
                    : "bg-white/5 text-text-secondary"
                }`}
              >
                {msg.agent && (
                  <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-accent/80">
                    {msg.agent}
                  </span>
                )}
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="prompt-box mx-auto max-w-3xl">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-violet/30">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={translate("workspace.chatPlaceholder")}
          disabled={loading}
          rows={1}
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted disabled:opacity-60"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet text-white transition-all hover:shadow-lg hover:shadow-accent/30 disabled:opacity-40"
          aria-label="Send message"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
