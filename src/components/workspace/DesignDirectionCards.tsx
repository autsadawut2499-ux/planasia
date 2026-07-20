"use client";

import { Building2, Crown, Home, Layers } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HOUSE_STYLES } from "@/lib/geo/countries";
import {
  DECORATION_STYLES,
  DISCIPLINE_PRESETS,
  GOLDEN_STANDARD_PRESETS,
} from "@/lib/design/catalog-options";
import { COLOR_PALETTES } from "@/lib/ai/types";
import type { QuestionnaireInput } from "@/lib/ai/types";
import { pickLocalizedLabel } from "@/lib/i18n/localized-text";

const GOLDEN_ICONS = {
  "smart-a-type-e": Crown,
  "residential-mirror": Home,
  "airport-asbuilt": Building2,
} as const;

interface DesignDirectionCardsProps {
  questionnaire: QuestionnaireInput;
  catalogStyle: string;
  onChange: (updates: Partial<QuestionnaireInput["designDirection"]>) => void;
  onStyleChange: (styleId: string) => void;
  decorationStyle: string;
  colorTone: string;
  onDecorationChange: (v: string) => void;
  onColorChange: (v: string) => void;
}

export function DesignDirectionCards({
  questionnaire,
  catalogStyle,
  onChange,
  onStyleChange,
  decorationStyle,
  colorTone,
  onDecorationChange,
  onColorChange,
}: DesignDirectionCardsProps) {
  const { locale, translate } = useApp();

  return (
    <div className="space-y-5">
      <div>
        <p className="section-label">{translate("questionnaire.goldenStandard")}</p>
        <div className="grid gap-2">
          {GOLDEN_STANDARD_PRESETS.map((preset) => {
            const Icon = GOLDEN_ICONS[preset.id as keyof typeof GOLDEN_ICONS] ?? Layers;
            const selected = questionnaire.designDirection.goldenStandardId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ goldenStandardId: preset.id })}
                className={`glass-card flex w-full items-start gap-3 p-3 text-left ${selected ? "glass-card-selected" : ""}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selected ? "bg-accent/20 text-accent" : "bg-white/5 text-text-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary">{pickLocalizedLabel(locale, preset.label)}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-text-muted">
                    {pickLocalizedLabel(locale, preset.description)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="section-label">{translate("questionnaire.disciplinePreset")}</p>
        <div className="grid grid-cols-2 gap-2">
          {DISCIPLINE_PRESETS.map((preset) => {
            const selected = questionnaire.designDirection.disciplinePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ disciplinePreset: preset.id })}
                className={`glass-card p-3 text-left ${selected ? "glass-card-selected" : ""}`}
              >
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {preset.includes.map((d) => (
                    <span
                      key={d}
                      className="rounded-md bg-white/8 px-1.5 py-0.5 text-[9px] font-bold text-accent"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-medium leading-tight text-text-primary">
                  {pickLocalizedLabel(locale, preset.label)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="section-label">{translate("workspace.style")}</p>
        <div className="flex flex-wrap gap-1.5">
          {HOUSE_STYLES.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStyleChange(s.id)}
              className={`chip ${catalogStyle === s.id ? "chip-active" : ""}`}
            >
              {s.label[locale] ?? s.label.en}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="section-label">{translate("questionnaire.decorationStyle")}</p>
        <div className="flex flex-wrap gap-1.5">
          {DECORATION_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onDecorationChange(s.value)}
              className={`chip ${decorationStyle === s.value ? "chip-active" : ""}`}
            >
              {pickLocalizedLabel(locale, s.label)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="section-label">{translate("workspace.colorPalette")}</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onColorChange(c.value)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                colorTone === c.value ? "glass-card-selected" : "glass-card"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full ring-1 ring-white/20"
                style={{
                  background:
                    c.value === "gray"
                      ? "linear-gradient(135deg,#71717a,#3f3f46)"
                      : c.value === "white"
                        ? "linear-gradient(135deg,#fafafa,#e4e4e7)"
                        : c.value === "earth"
                          ? "linear-gradient(135deg,#a16207,#78716c)"
                          : "linear-gradient(135deg,#92400e,#451a03)",
                }}
              />
              <span className="text-[11px] font-medium">{pickLocalizedLabel(locale, c.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FloorToggle({
  value,
  onChange,
}: {
  value: 1 | 2;
  onChange: (v: 1 | 2) => void;
}) {
  return (
    <div className="flex rounded-xl border border-white/10 bg-white/3 p-1">
      {([1, 2] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            value === n
              ? "bg-gradient-to-r from-accent to-violet text-white shadow-lg shadow-accent/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {n}F
        </button>
      ))}
    </div>
  );
}
