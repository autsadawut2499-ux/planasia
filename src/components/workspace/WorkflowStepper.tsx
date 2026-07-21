"use client";

import { Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { WorkflowStage } from "@/lib/ai/types";

const STEPS: { id: WorkflowStage | "options"; key: string }[] = [
  { id: "input", key: "workflow.step1" },
  { id: "render_ready", key: "workflow.step2" },
  { id: "options", key: "workflow.step3" },
  { id: "plans_preview", key: "workflow.step4" },
  { id: "unlocked", key: "workflow.step5" },
];

function stepIndex(stage: WorkflowStage, optionsOpen: boolean): number {
  if (optionsOpen) return 2;
  if (stage === "input" || stage === "clarifying") return 0;
  if (stage === "render_ready") return 1;
  if (stage === "plans_generating" || stage === "plans_preview") return 3;
  return 4;
}

interface WorkflowStepperProps {
  stage: WorkflowStage;
  optionsOpen: boolean;
  compact?: boolean;
}

export function WorkflowStepper({ stage, optionsOpen, compact }: WorkflowStepperProps) {
  const { translate } = useApp();
  const current = stepIndex(stage, optionsOpen);

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-1">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.key} className="flex items-center gap-1.5">
              {i > 0 && <div className={`h-px w-3 ${done ? "bg-accent/40" : "bg-white/10"}`} aria-hidden />}
              <span
                title={translate(step.key as Parameters<typeof translate>[0])}
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-medium ${
                  active
                    ? "bg-white/15 text-white"
                    : done
                      ? "bg-accent/20 text-indigo-200"
                      : "bg-white/5 text-white/35"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/8 bg-surface-raised/60 px-5 py-3 backdrop-blur-sm">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-4 ${done ? "bg-accent/50" : "bg-white/10"}`}
                aria-hidden
              />
            )}
            <div
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-accent to-violet text-white shadow-md shadow-accent/25"
                  : done
                    ? "bg-accent/15 text-indigo-300"
                    : "text-text-muted"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-white/20"
                    : done
                      ? "bg-accent/30 text-accent"
                      : "bg-white/8"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {translate(step.key as Parameters<typeof translate>[0])}
            </div>
          </div>
        );
      })}
    </div>
  );
}
