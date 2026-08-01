"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CmsSectionContent, CmsSectionKey, SiteSettingsBundle } from "@/lib/admin/defaults";
import type { CuratedStyleItem } from "@/lib/admin/curated-styles";
import type { MegaMenuCollectionCard } from "@/lib/admin/mega-menu-collections";
import type { MegaMenuStyleCard } from "@/lib/admin/mega-menu-styles";
import type { CustomerServiceArticlesMap } from "@/lib/content/customer-service";
import type { Locale } from "@/lib/geo/countries";
import type { SiteConfigPayload } from "@/lib/site/site-config-types";
import type { AiImageTool } from "@/lib/vendor/ai-image-tools";
import { defaultAiRenderGuide, type AiRenderGuide } from "@/lib/vendor/ai-render-guide";
import { useApp } from "@/context/AppContext";

interface SiteConfigContextValue {
  settings: SiteSettingsBundle;
  cms: Record<CmsSectionKey, CmsSectionContent>;
  curatedStyles: CuratedStyleItem[];
  megaMenuStyles: MegaMenuStyleCard[];
  megaMenuCollections: MegaMenuCollectionCard[];
  customerServiceArticles: CustomerServiceArticlesMap;
  aiImageTools: AiImageTool[];
  aiRenderGuide: AiRenderGuide;
  loading: boolean;
  refresh: () => Promise<void>;
  cmsText: (section: CmsSectionKey, key: string, fallback?: string) => string;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

function applyPayload(
  data: SiteConfigPayload,
  setters: {
    setSettings: (v: SiteSettingsBundle) => void;
    setCms: (v: Record<CmsSectionKey, CmsSectionContent>) => void;
    setCuratedStyles: (v: CuratedStyleItem[]) => void;
    setMegaMenuStyles: (v: MegaMenuStyleCard[]) => void;
    setMegaMenuCollections: (v: MegaMenuCollectionCard[]) => void;
    setCustomerServiceArticles: (v: CustomerServiceArticlesMap) => void;
    setAiImageTools: (v: AiImageTool[]) => void;
    setAiRenderGuide: (v: AiRenderGuide) => void;
  },
) {
  setters.setSettings(data.settings);
  setters.setCms(data.cms);
  setters.setCuratedStyles(data.curatedStyles);
  setters.setMegaMenuStyles(data.megaMenuStyles);
  setters.setMegaMenuCollections(data.megaMenuCollections);
  setters.setCustomerServiceArticles(data.customerServiceArticles);
  setters.setAiImageTools(data.aiImageTools);
  setters.setAiRenderGuide(data.aiRenderGuide ?? defaultAiRenderGuide());
}

/**
 * Thin client provider seeded from RSC (`loadSiteConfig`).
 * No mount waterfall — only refetches CMS when content locale changes.
 */
export function SiteConfigProvider({
  children,
  initialConfig,
}: {
  children: ReactNode;
  initialConfig: SiteConfigPayload;
}) {
  const { locale } = useApp();
  const seededLocale = useRef(initialConfig.locale);

  const [settings, setSettings] = useState(initialConfig.settings);
  const [cms, setCms] = useState(initialConfig.cms);
  const [curatedStyles, setCuratedStyles] = useState(initialConfig.curatedStyles);
  const [megaMenuStyles, setMegaMenuStyles] = useState(initialConfig.megaMenuStyles);
  const [megaMenuCollections, setMegaMenuCollections] = useState(
    initialConfig.megaMenuCollections,
  );
  const [customerServiceArticles, setCustomerServiceArticles] = useState(
    initialConfig.customerServiceArticles,
  );
  const [aiImageTools, setAiImageTools] = useState(initialConfig.aiImageTools);
  const [aiRenderGuide, setAiRenderGuide] = useState(
    () => initialConfig.aiRenderGuide ?? defaultAiRenderGuide(),
  );
  const [loading, setLoading] = useState(false);

  const setters = useMemo(
    () => ({
      setSettings,
      setCms,
      setCuratedStyles,
      setMegaMenuStyles,
      setMegaMenuCollections,
      setCustomerServiceArticles,
      setAiImageTools,
      setAiRenderGuide,
    }),
    [],
  );

  const fetchConfig = useCallback(
    async (targetLocale: Locale) => {
      try {
        const res = await fetch(`/api/site/config?locale=${targetLocale}`);
        if (!res.ok) return;
        const data = (await res.json()) as SiteConfigPayload;
        applyPayload(data, setters);
        seededLocale.current = targetLocale;
      } catch {
        /* keep current */
      }
    },
    [setters],
  );

  // Content-locale change only (e.g. th ↔ en) — skip identical first paint.
  useEffect(() => {
    if (locale === seededLocale.current) return;
    setLoading(true);
    void fetchConfig(locale).finally(() => setLoading(false));
  }, [locale, fetchConfig]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchConfig(locale);
    setLoading(false);
  }, [fetchConfig, locale]);

  const cmsText = useCallback(
    (section: CmsSectionKey, key: string, fallback?: string) => {
      return cms[section]?.[key] ?? fallback ?? "";
    },
    [cms],
  );

  const value = useMemo(
    () => ({
      settings,
      cms,
      curatedStyles,
      megaMenuStyles,
      megaMenuCollections,
      customerServiceArticles,
      aiImageTools,
      aiRenderGuide,
      loading,
      refresh,
      cmsText,
    }),
    [
      settings,
      cms,
      curatedStyles,
      megaMenuStyles,
      megaMenuCollections,
      customerServiceArticles,
      aiImageTools,
      aiRenderGuide,
      loading,
      refresh,
      cmsText,
    ],
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
}

export function useSiteConfigOptional(): SiteConfigContextValue | null {
  return useContext(SiteConfigContext);
}
