"use client";

import { ClipboardList, Download, Upload } from "lucide-react";
import { useApp } from "@/context/AppContext";

const STEPS = [
  { icon: ClipboardList, titleKey: "how.step1.title" as const, descKey: "how.step1.desc" as const },
  { icon: Upload, titleKey: "how.step2.title" as const, descKey: "how.step2.desc" as const },
  { icon: Download, titleKey: "how.step3.title" as const, descKey: "how.step3.desc" as const },
];

export function HowItWorks() {
  const { translate } = useApp();

  return (
    <section id="how-it-works" className="border-y border-border bg-surface-raised py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
          {translate("how.title")}
        </h2>

        <div className="grid gap-12 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, titleKey, descKey }, i) => (
            <div key={titleKey} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-overlay">
                <Icon className="h-7 w-7 text-accent" />
              </div>
              <span className="mb-2 block text-sm font-medium text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-3 text-xl font-semibold">{translate(titleKey)}</h3>
              <p className="text-text-secondary">{translate(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
