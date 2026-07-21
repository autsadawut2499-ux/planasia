"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRICING } from "@/lib/geo/countries";
import { formatPrice } from "@/lib/i18n";

const PACKAGES = [
  {
    id: "store",
    nameKey: "pricing.store" as const,
    price: PRICING.store.pdf,
    featureKeys: [
      "pricing.feature.pdfPreview",
      "pricing.feature.instantDownload",
      "pricing.feature.storeCatalog",
    ] as const,
    highlighted: false,
  },
  {
    id: "custom1",
    nameKey: "pricing.custom1" as const,
    price: PRICING.custom.pdf["1"],
    featureKeys: [
      "pricing.feature.customSpec1Story",
      "pricing.feature.fullPdfA3",
      "pricing.feature.permitReady",
      "pricing.feature.structuralStandardReview",
    ] as const,
    highlighted: true,
  },
  {
    id: "custom2",
    nameKey: "pricing.custom2" as const,
    price: PRICING.custom.pdf["2"],
    featureKeys: [
      "pricing.feature.customSpec2Story",
      "pricing.feature.fullPdfA3",
      "pricing.feature.foundationStructuralCalc",
      "pricing.feature.cadDeliverable",
    ] as const,
    highlighted: false,
  },
] as const;

export function Pricing() {
  const { locale, country, translate } = useApp();

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          {translate("pricing.title")}
        </h2>
        <p className="mb-16 text-center text-text-secondary">{translate("pricing.subtitle")}</p>

        <div className="grid gap-6 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl border p-8 transition-all ${
                pkg.highlighted
                  ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                  : "border-border bg-surface-raised"
              }`}
            >
              <h3 className="mb-2 text-lg font-semibold leading-snug">{translate(pkg.nameKey)}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {formatPrice(pkg.price, country.currency, locale)}
                </span>
                <span className="ml-2 text-text-muted">{translate("pricing.perDesign")}</span>
              </div>
              <ul className="mb-8 space-y-3">
                {pkg.featureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {translate(key)}
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.id === "store" ? "/store" : "/workspace"}
                className={`block w-full rounded-lg py-3 text-center text-sm font-medium transition-all ${
                  pkg.highlighted
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "border border-border bg-surface-overlay hover:bg-surface"
                }`}
              >
                {translate("pricing.buyNow")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
