import {
  DEFAULT_CMS_BY_LOCALE,
  type CmsSectionContent,
  type CmsSectionKey,
} from "@/lib/admin/defaults";
import type { Locale } from "@/lib/geo/countries";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

interface CmsRow {
  id: string;
  section: string;
  locale: string;
  content: CmsSectionContent;
  updated_at: string;
  updated_by: string | null;
}

function cmsId(section: CmsSectionKey, locale: Locale): string {
  return `${section}:${locale}`;
}

function defaultContent(section: CmsSectionKey, locale: Locale): CmsSectionContent {
  return DEFAULT_CMS_BY_LOCALE[locale]?.[section] ?? DEFAULT_CMS_BY_LOCALE.en[section];
}

export async function loadCmsSection(
  section: CmsSectionKey,
  locale: Locale,
): Promise<CmsSectionContent> {
  const fallback = defaultContent(section, locale);
  if (!isSupabaseConfigured()) return fallback;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("cms_sections")
      .select("content")
      .eq("section", section)
      .eq("locale", locale)
      .maybeSingle();

    if (error || !data) return fallback;
    return { ...fallback, ...(data as CmsRow).content };
  } catch {
    return fallback;
  }
}

export async function loadAllCmsForLocale(locale: Locale): Promise<Record<CmsSectionKey, CmsSectionContent>> {
  const sections: CmsSectionKey[] = ["hero", "cta_band", "footer"];
  const result = {} as Record<CmsSectionKey, CmsSectionContent>;

  if (!isSupabaseConfigured()) {
    for (const section of sections) {
      result[section] = defaultContent(section, locale);
    }
    return result;
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("cms_sections")
      .select("section, content")
      .eq("locale", locale);

    const dbMap = new Map<string, CmsSectionContent>();
    if (!error && data) {
      for (const row of data as Pick<CmsRow, "section" | "content">[]) {
        dbMap.set(row.section, row.content);
      }
    }

    for (const section of sections) {
      result[section] = { ...defaultContent(section, locale), ...dbMap.get(section) };
    }
    return result;
  } catch {
    for (const section of sections) {
      result[section] = defaultContent(section, locale);
    }
    return result;
  }
}

export async function saveCmsSection(
  section: CmsSectionKey,
  locale: Locale,
  content: CmsSectionContent,
  updatedBy: string,
): Promise<CmsSectionContent> {
  const id = cmsId(section, locale);
  const { error } = await getSupabaseAdmin()
    .from("cms_sections")
    .upsert(
      {
        id,
        section,
        locale,
        content,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "id" },
    );
  if (error) throw error;
  return content;
}

export async function loadAllCmsSections(): Promise<CmsRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("cms_sections")
    .select("*")
    .order("section")
    .order("locale");
  if (error) throw error;
  return (data ?? []) as CmsRow[];
}
