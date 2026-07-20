"use client";

import { Building2, Home, Hotel, Warehouse } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { pickLocalized } from "@/lib/i18n/localized-text";
import type { ProjectType, ProjectTypeCode } from "@/lib/db/schema/project-types";

const ICONS: Record<string, typeof Home> = {
  home: Home,
  building: Building2,
  warehouse: Warehouse,
  hotel: Hotel,
};

interface ProjectTypeSelectorProps {
  types: ProjectType[];
  value: ProjectTypeCode;
  onChange: (code: ProjectTypeCode) => void;
  loading?: boolean;
}

export function ProjectTypeSelector({
  types,
  value,
  onChange,
  loading,
}: ProjectTypeSelectorProps) {
  const { locale, translate } = useApp();

  if (loading && types.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-text-muted">{translate("questionnaire.projectTypeHint")}</p>
      <div className="grid grid-cols-2 gap-2">
        {types.map((type) => {
          const Icon = ICONS[type.icon] ?? Building2;
          const selected = value === type.code;
          return (
            <button
              key={type.code}
              type="button"
              onClick={() => onChange(type.code)}
              className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all ${
                selected
                  ? "border-accent bg-accent/15 shadow-sm shadow-accent/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <Icon className={`h-4 w-4 ${selected ? "text-accent" : "text-text-muted"}`} />
              <span className="text-xs font-semibold text-text-primary">
                {pickLocalized(type.name, locale)}
              </span>
              <span className="line-clamp-2 text-[10px] leading-snug text-text-muted">
                {pickLocalized(type.description, locale)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
