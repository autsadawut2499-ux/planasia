"use client";

import { useState } from "react";
import { Banknote, Check, ChevronDown, LayoutGrid, Lock, ShieldCheck, UserRound } from "lucide-react";
import type { VendorStepId, VendorWorkflowStep } from "@/lib/vendor/workflow";

const ICONS: Record<VendorStepId, React.ReactNode> = {
  profile: <UserRound className="h-4 w-4" />,
  listings: <LayoutGrid className="h-4 w-4" />,
  payout: <Banknote className="h-4 w-4" />,
  verification: <ShieldCheck className="h-4 w-4" />,
};

interface VendorSidebarNavProps {
  steps: VendorWorkflowStep[];
  active: VendorStepId;
  onSelect: (id: VendorStepId) => void;
}

/**
 * Vertical workflow navigation. Order is the onboarding order, so identity
 * verification always sits at the bottom and stays locked until steps 1–3 are
 * complete. A locked step is still openable so the vendor can read exactly
 * what is missing rather than clicking a dead button.
 */
export function VendorSidebarNav({ steps, active, onSelect }: VendorSidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const prerequisitesDone = steps.every((s) => s.id === "verification" || s.done);
  const completed = steps.filter((s) => s.done).length;
  const activeStep = steps.find((s) => s.id === active);

  const select = (id: VendorStepId) => {
    onSelect(id);
    setMobileOpen(false);
  };

  return (
    <nav aria-label="ขั้นตอนการเปิดร้าน" className="lg:w-[286px] lg:shrink-0">
      <div className="overflow-hidden rounded-2xl border border-border bg-white lg:sticky lg:top-[76px]">
        <div className="border-b border-border px-4 py-3.5">
          <p className="text-sm font-bold text-[#1e3a5f]">ขั้นตอนการเปิดร้าน</p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            ทำครบ {completed}/{steps.length} ขั้นตอน · ยืนยันตัวตนเป็นขั้นตอนสุดท้าย
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-raised"
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={steps.length}
          >
            <div
              className="h-full rounded-full bg-[#1e40af] transition-[width] duration-300"
              style={{ width: `${(completed / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left lg:hidden"
        >
          <span className="flex min-w-0 items-center gap-2">
            {activeStep && ICONS[activeStep.id]}
            <span className="truncate text-sm font-semibold text-text-primary">
              {activeStep?.step}. {activeStep?.label}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>

        <ol className={`${mobileOpen ? "block" : "hidden"} space-y-1 p-2 lg:block`}>
          {steps.map((step) => {
            const isFinal = step.id === "verification";
            const locked = isFinal && !prerequisitesDone && !step.done;
            const isActive = active === step.id;

            return (
              <li
                key={step.id}
                className={isFinal ? "mt-2 border-t border-border pt-2" : undefined}
              >
                <button
                  type="button"
                  onClick={() => select(step.id)}
                  aria-current={isActive ? "step" : undefined}
                  className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                    isActive
                      ? "border-[#1e40af] bg-blue-50/70"
                      : "border-transparent hover:border-[#1e40af]/30 hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      step.done
                        ? "bg-green-600 text-white"
                        : locked
                          ? "bg-surface-raised text-text-muted"
                          : "bg-[#1e40af] text-white"
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : locked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      step.step
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={isActive ? "text-[#1e40af]" : "text-text-muted"}>
                        {ICONS[step.id]}
                      </span>
                      <span
                        className={`text-[13px] font-bold ${
                          isActive ? "text-[#1e40af]" : "text-text-primary"
                        }`}
                      >
                        {step.label}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-text-muted">
                      {step.done
                        ? "เรียบร้อยแล้ว"
                        : locked
                          ? "ล็อกอยู่ — ทำขั้นตอน 1–3 ให้ครบก่อน"
                          : step.todo}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
