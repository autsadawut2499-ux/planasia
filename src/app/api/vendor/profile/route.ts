import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import { upsertVendorProfile } from "@/lib/supabase/vendors";

export const dynamic = "force-dynamic";

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean).slice(0, 20);
}

export async function PUT(request: NextRequest) {
  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const displayName = String(body.displayName ?? "").trim();
    if (!displayName) {
      return NextResponse.json({ error: "displayName is required" }, { status: 400 });
    }

    // Accept empty string as "clear"; keep absolute URLs (incl. ?v= cache-bust) as-is.
    const avatarUrl =
      body.avatarUrl === undefined || body.avatarUrl === null
        ? undefined
        : String(body.avatarUrl).trim() || undefined;
    const coverUrl =
      body.coverUrl === undefined || body.coverUrl === null
        ? undefined
        : String(body.coverUrl).trim() || undefined;

    const profile = await upsertVendorProfile({
      ownerKey: auth.ownerKey,
      displayName,
      headline: body.headline ? String(body.headline).trim() : undefined,
      bio: body.bio ? String(body.bio).trim() : undefined,
      avatarUrl,
      coverUrl,
      brandImageUrl: body.brandImageUrl ? String(body.brandImageUrl) : undefined,
      galleryUrls: cleanList(body.galleryUrls),
      location: body.location ? String(body.location).trim() : undefined,
      countryCode: body.countryCode ? String(body.countryCode).trim().toUpperCase() : undefined,
      specialties: cleanList(body.specialties),
      contactEmail: body.contactEmail ? String(body.contactEmail).trim() : undefined,
      contactPhone: body.contactPhone ? String(body.contactPhone).trim() : undefined,
      lineId: body.lineId ? String(body.lineId).trim() : undefined,
      website: body.website ? String(body.website).trim() : undefined,
      socials: cleanList(body.socials),
      yearsExperience:
        body.yearsExperience != null && body.yearsExperience !== ""
          ? Number(body.yearsExperience)
          : undefined,
      isPublished: body.isPublished !== false,
    });

    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
