"use client";

import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { ClarificationIssue } from "@/lib/clarification/engine";
import { pickLocalized } from "@/lib/i18n/localized-text";

interface ClarificationPanelProps {
  question: ClarificationIssue;
  index: number;
  total: number;
  onAnswer: (value: string) => void;
  onSkip?: () => void;
}

export function ClarificationPanel({
  question,
  index,
  total,
  onAnswer,
}: ClarificationPanelProps) {
  const { locale, translate } = useApp();
  const [value, setValue] = useState("");

  const text = pickLocalized(question.question, locale);
  const reason = pickLocalized(question.reason, locale);

  const handleSubmit = () => {
    const v = value.trim();
    if (!v) return;
    onAnswer(v);
    setValue("");
  };

  const quickYesNo = (yes: boolean) => {
    onAnswer(yes ? translate("common.yes") : translate("common.no"));
  };

  const isYesNo = question.id === "site-dimensions" || question.id === "confirm-3d-front";
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="gradient-border w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl shadow-accent/10">
        <div className="glass-panel rounded-3xl border-0">
          <div className="border-b border-white/8 px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">{translate("clarify.title")}</h2>
                  <p className="text-xs text-text-muted">
                    {translate("clarify.progress")} {index + 1}/{total}
                  </p>
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-accent/60" />
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="text-sm leading-relaxed text-text-primary">{text}</p>
            </div>

            <p className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs leading-relaxed text-amber-200/90">
              {reason}
            </p>

            <p className="text-[11px] text-text-muted">{translate("clarify.noGuess")}</p>

            {isYesNo ? (
              <div className="flex gap-3">
                <button type="button" onClick={() => quickYesNo(true)} className="btn-primary flex-1 py-3">
                  {translate("common.yes")}
                </button>
                <button type="button" onClick={() => quickYesNo(false)} className="btn-ghost flex-1 border border-white/10 py-3">
                  {translate("common.no")}
                </button>
              </div>
            ) : (
              <div className="prompt-box">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={translate("clarify.placeholder")}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                  className="btn-primary shrink-0 rounded-xl px-4 py-2.5 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
