"use client";

import { AlertTriangle, CheckCircle2, FileWarning, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { PermitComplianceReport } from "@/lib/db/schema/permit-rules";

interface PermitCompliancePanelProps {
  report: PermitComplianceReport | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}

export function PermitCompliancePanel({
  report,
  loading,
  error,
  compact = false,
}: PermitCompliancePanelProps) {
  const { locale, translate } = useApp();

  if (loading && !report) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {translate("permit.checking")}
      </div>
    );
  }

  if (error === "rate_limited") {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
        {translate("permit.rateLimited")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
        {translate("permit.checkFailed")}
      </div>
    );
  }

  if (!report) return null;

  const failures = report.results.filter((r) => !r.passed && r.message !== "Rule not applicable");
  const errors = failures.filter((r) => r.severity === "error");
  const warnings = failures.filter((r) => r.severity === "warning");

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] ${
          report.passed
            ? "border-green-500/30 bg-green-500/10 text-green-200"
            : errors.length > 0
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
        }`}
      >
        {report.passed ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        )}
        {report.passed
          ? translate("permit.allClear")
          : translate("permit.issuesSummary").replace("{errors}", String(errors.length)).replace("{warnings}", String(warnings.length))}
      </div>
    );
  }

  return (
    <section className="glass-panel space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="section-label mb-0">{translate("permit.title")}</p>
        {report.passed ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {translate("permit.passed")}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400">
            <FileWarning className="h-3.5 w-3.5" />
            {translate("permit.needsReview")}
          </span>
        )}
      </div>

      {failures.length === 0 ? (
        <p className="text-[11px] text-text-muted">{translate("permit.allClear")}</p>
      ) : (
        <ul className="max-h-40 space-y-2 overflow-y-auto">
          {failures.slice(0, 6).map((item) => (
            <li
              key={item.ruleId}
              className={`rounded-lg border px-2.5 py-2 text-[10px] leading-relaxed ${
                item.severity === "error"
                  ? "border-red-500/25 bg-red-500/8 text-red-200"
                  : "border-amber-500/25 bg-amber-500/8 text-amber-200"
              }`}
            >
              <span className="font-semibold">[{item.ruleCode}]</span>{" "}
              {locale === "th" ? item.messageTh : item.message}
            </li>
          ))}
        </ul>
      )}

      {report.requiredDocuments.length > 0 && (
        <div className="border-t border-white/8 pt-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            {translate("permit.requiredDocs")}
          </p>
          <p className="mt-1 text-[10px] text-text-secondary">
            {report.requiredDocuments.slice(0, 5).join(" · ")}
          </p>
        </div>
      )}
    </section>
  );
}
