import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { SiteSettingsBundle } from "@/lib/admin/defaults";
import { loadSiteSettings, saveSiteSettingsBundle, saveSiteSettingsSection } from "@/lib/supabase/site-settings";

export async function GET() {
  try {
    await requireAdminSession();
    const settings = await loadSiteSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();

    if (body.section != null && body.value != null) {
      const section = body.section as keyof SiteSettingsBundle;
      const value = await saveSiteSettingsSection(section, body.value, admin.email);
      return NextResponse.json({ section, value });
    }

    const settings = await saveSiteSettingsBundle(body.settings ?? body, admin.email);
    return NextResponse.json({ settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
