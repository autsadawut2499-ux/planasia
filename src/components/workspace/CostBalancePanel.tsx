"use client";

import { AlertTriangle, CheckCircle2, Landmark, Sparkles, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import type { TranslationKey } from "@/lib/i18n";
import type { DesignEditorState } from "@/lib/design/editor-types";
import type { BudgetTargets } from "@/lib/design/budget-targets";
import { formatBudgetThb } from "@/lib/design/budget-targets";
import {
  computeCostBalance,
  type BudgetRecommendation,
  type CostBalanceResult,
} from "@/lib/design/cost-balance-engine";
import { REA_TIER_BENCHMARKS, type CostTier } from "@/lib/design/cost-reference";
import type { Locale } from "@/lib/geo/countries";

interface CostBalancePanelProps {
  editorState: DesignEditorState | null;
  budgetTargets: BudgetTargets;
  project?: import("@/lib/ai/types").ProjectInput | null;
  onTargetsChange: (targets: BudgetTargets) => void;
  onEditorChange?: (state: DesignEditorState) => void;
  onApplyRecommendation?: (editor: DesignEditorState, targets: BudgetTargets) => void;
  compact?: boolean;
  editable?: boolean;
}

export function CostBalancePanel({
  editorState,
  budgetTargets,
  project,
  onTargetsChange,
  onEditorChange,
  onApplyRecommendation,
  compact = false,
  editable = true,
}: CostBalancePanelProps) {
  const { translate, locale } = useApp();

  const balance = useMemo(() => {
    if (!editorState) return null;
    return computeCostBalance(editorState, budgetTargets, project ?? undefined);
  }, [editorState, budgetTargets, project]);

  const handleApplyRec = (rec: BudgetRecommendation) => {
    if (!editorState || !onEditorChange) return;
    const result = rec.apply(editorState, budgetTargets);
    if ("rooms" in result) {
      onEditorChange(result);
      onApplyRecommendation?.(result, budgetTargets);
    } else {
      onTargetsChange(result);
      onApplyRecommendation?.(editorState, result);
    }
  };

  if (compact && balance) {
    return <CostBalanceBar balance={balance} />;
  }

  return (
    <div className="space-y-4">
      {editable && (
        <div className="rounded-xl border border-white/8 bg-white/5 p-3">
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
            <Landmark className="h-3.5 w-3.5" />
            {translate("cost.inputTitle")}
          </p>
          <div className="space-y-2">
            <label className="block text-[10px] text-text-muted">
              {translate("cost.maxBudget")}
              <input
                type="number"
                min={0}
                step={100_000}
                value={budgetTargets.maxBudgetThb || ""}
                onChange={(e) =>
                  onTargetsChange({
                    ...budgetTargets,
                    maxBudgetThb: Number(e.target.value) || 0,
                  })
                }
                placeholder="2500000"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs"
              />
            </label>
            <label className="block text-[10px] text-text-muted">
              {translate("cost.targetArea")}
              <input
                type="number"
                min={0}
                step={5}
                value={budgetTargets.targetAreaSqm || ""}
                onChange={(e) =>
                  onTargetsChange({
                    ...budgetTargets,
                    targetAreaSqm: Number(e.target.value) || 0,
                  })
                }
                placeholder="120"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs"
              />
            </label>
            <label className="block text-[10px] text-text-muted">
              {translate("cost.tierLabel")}
              <select
                value={budgetTargets.costTier}
                onChange={(e) =>
                  onTargetsChange({
                    ...budgetTargets,
                    costTier: e.target.value as CostTier,
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs"
              >
                {REA_TIER_BENCHMARKS.map((t) => (
                  <option key={t.tier} value={t.tier}>
                    {t.label[locale as Locale]} — ฿{t.thConstructionPerSqm.toLocaleString()}/m²
                  </option>
                ))}
              </select>
            </label>
            <p className="text-[10px] leading-relaxed text-text-muted">
              {REA_TIER_BENCHMARKS.find((t) => t.tier === budgetTargets.costTier)?.description[
                locale as Locale
              ] ?? ""}
            </p>
          </div>
        </div>
      )}

      {balance && <CostBalanceSummary balance={balance} />}

      {balance && (balance.isOverBudget || balance.isOverArea) && (
        <BudgetAlert balance={balance} onApplyRec={onEditorChange ? handleApplyRec : undefined} />
      )}

      {balance?.bankReady && (
        <div className="flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
          <p className="text-[11px] text-green-200">{translate("cost.bankReady")}</p>
        </div>
      )}

      {balance && !balance.permitCompliant && !balance.isOverBudget && !balance.isOverArea && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[11px] text-amber-200">{translate("cost.permitNotReady")}</p>
        </div>
      )}
    </div>
  );
}

function statusColor(status: "under" | "on_target" | "over") {
  if (status === "over") return "bg-red-500";
  if (status === "on_target") return "bg-green-500";
  return "bg-accent";
}

export function CostBalanceSummary({ balance }: { balance: CostBalanceResult }) {
  const { translate } = useApp();

  return (
    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-text-muted">
        {translate("cost.liveTotal")}
      </p>
      <p className={`text-xl font-bold ${balance.isOverBudget ? "text-red-400" : "text-accent"}`}>
        {formatBudgetThb(balance.totalEstimatedThb)}
      </p>
      <p className="mt-0.5 text-[10px] text-text-muted">
        {translate("cost.perSqm")}: ฿{balance.costPerSqm.toLocaleString()} · REA ฿
        {balance.tierBenchmarkPerSqm.toLocaleString()}/m²
      </p>

      {balance.maxBudgetThb > 0 && (
        <ProgressRow
          label={translate("cost.budgetUsed")}
          pct={Math.min(balance.budgetUtilizationPct, 150)}
          status={balance.budgetStatus}
          detail={`${formatBudgetThb(balance.totalEstimatedThb)} / ${formatBudgetThb(balance.maxBudgetThb)}`}
        />
      )}

      {balance.targetAreaSqm > 0 && (
        <ProgressRow
          label={translate("cost.areaUsed")}
          pct={Math.min(balance.areaUtilizationPct, 150)}
          status={balance.areaStatus}
          detail={`${balance.grossAreaSqm} / ${balance.targetAreaSqm} m²`}
        />
      )}
    </div>
  );
}

function ProgressRow({
  label,
  pct,
  status,
  detail,
}: {
  label: string;
  pct: number;
  status: "under" | "on_target" | "over";
  detail: string;
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-[10px] text-text-muted">
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${statusColor(status)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function BudgetAlert({
  balance,
  onApplyRec,
}: {
  balance: CostBalanceResult;
  onApplyRec?: (rec: BudgetRecommendation) => void;
}) {
  const { translate } = useApp();

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
      <div className="mb-2 flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="text-xs font-medium text-amber-200">{translate("cost.alertTitle")}</p>
          <p className="mt-0.5 text-[11px] text-amber-200/80">
            {balance.isOverBudget &&
              translate("cost.overBudgetMsg").replace(
                "{amount}",
                formatBudgetThb(Math.abs(balance.budgetDeltaThb)),
              )}
            {balance.isOverBudget && balance.isOverArea && " · "}
            {balance.isOverArea &&
              translate("cost.overAreaMsg").replace("{delta}", String(Math.abs(balance.areaDeltaSqm)))}
          </p>
        </div>
      </div>

      {balance.recommendations.length > 0 && (
        <ul className="space-y-1.5">
          {balance.recommendations.map((rec) => (
            <li
              key={rec.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-black/20 px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-text-secondary">
                  {translate(rec.messageKey as TranslationKey)}
                </p>
                <p className="text-[10px] text-text-muted">
                  {translate("cost.estSavings")}: ฿{rec.estimatedSavingsThb.toLocaleString()}
                </p>
              </div>
              {onApplyRec && (
                <button
                  type="button"
                  onClick={() => onApplyRec(rec)}
                  className="btn-ghost shrink-0 gap-1 px-2 py-1 text-[10px]"
                >
                  <Sparkles className="h-3 w-3" />
                  {translate("cost.applyFix")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CostBalanceBar({ balance }: { balance: CostBalanceResult }) {
  const { translate } = useApp();

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs ${
        balance.isOverBudget
          ? "border-red-500/30 bg-red-500/10"
          : balance.bankReady
            ? "border-green-500/30 bg-green-500/10"
            : "border-white/8 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <TrendingDown className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-text-muted">{translate("cost.liveTotal")}:</span>
        <span className={`font-semibold ${balance.isOverBudget ? "text-red-400" : "text-accent"}`}>
          {formatBudgetThb(balance.totalEstimatedThb)}
        </span>
      </div>
      <span className="text-text-muted">
        {balance.grossAreaSqm} m²
        {balance.targetAreaSqm > 0 && ` / ${balance.targetAreaSqm} m²`}
      </span>
      {balance.maxBudgetThb > 0 && (
        <span className={balance.isOverBudget ? "text-red-400" : "text-text-muted"}>
          {balance.budgetUtilizationPct}% {translate("cost.ofBudget")}
        </span>
      )}
      {balance.bankReady && (
        <span className="ml-auto flex items-center gap-1 text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {translate("cost.bankReadyShort")}
        </span>
      )}
      {(balance.isOverBudget || balance.isOverArea) && !balance.bankReady && (
        <span className="ml-auto flex items-center gap-1 text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          {translate("cost.adjustNeeded")}
        </span>
      )}
      {!balance.permitCompliant && !balance.isOverBudget && !balance.isOverArea && (
        <span className="ml-auto flex items-center gap-1 text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          {translate("cost.permitNotReadyShort")}
        </span>
      )}
    </div>
  );
}
