import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { CmsSectionKey } from "@/lib/admin/defaults";
import type { Locale } from "@/lib/geo/countries";
import { loadAllCmsSections, loadCmsSection, saveCmsSection } from "@/lib/supabase/cms-sections";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const section = request.nextUrl.searchParams.get("section") as CmsSectionKey | null;
    const locale = request.nextUrl.searchParams.get("locale") as Locale | null;

    if (section && locale) {
      const content = await loadCmsSection(section, locale);
      return NextResponse.json({ section, locale, content });
    }

    const sections = await loadAllCmsSections();
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const section = body.section as CmsSectionKey;
    const locale = body.locale as Locale;
    const content = body.content;

    if (!section || !locale || !content) {
      return NextResponse.json({ error: "section, locale, and content are required" }, { status: 400 });
    }

    const saved = await saveCmsSection(section, locale, content, admin.email);
    return NextResponse.json({ section, locale, content: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save CMS content";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
