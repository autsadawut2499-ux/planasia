import { NextResponse } from "next/server";
import { requireBuyerSession } from "@/lib/auth/buyer-session";
import { listValidGrantsByUserId } from "@/lib/supabase/download-grants";
import { boqDocumentLabel, calcDocumentLabel } from "@/lib/store/listing-packages";

export const dynamic = "force-dynamic";

function grantLabel(
  fileKind: string | undefined,
  planId: string,
  format: string,
  thai: boolean,
): string {
  if (fileKind === "boq") return boqDocumentLabel(thai);
  if (fileKind === "calc") return calcDocumentLabel(thai);
  if (fileKind === "cad" || format === "cad") {
    return thai
      ? `${planId} — ไฟล์ AutoCAD (DWG)`
      : `${planId} — AutoCAD (DWG)`;
  }
  return thai
    ? `${planId} — แบบแปลน (ไฟล์ PDF)`
    : `${planId} — Blueprint (PDF file)`;
}

export async function GET(request: Request) {
  const buyer = await requireBuyerSession();
  if (!buyer) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const thai = searchParams.get("locale") === "th";

  try {
    const grants = await listValidGrantsByUserId(buyer.userId);
    const downloads = grants.map((g) => ({
      token: g.token,
      planId: g.planId,
      listingId: g.listingId,
      format: g.format,
      fileKind: g.fileKind ?? (g.format === "cad" ? "cad" : "blueprint"),
      label: grantLabel(g.fileKind, g.planId, g.format, thai),
      downloadUrl: `/api/download?token=${encodeURIComponent(g.token)}&format=${g.format}`,
      expiresAt: g.expiresAt,
      createdAt: g.createdAt,
    }));

    return NextResponse.json({
      customer: {
        id: buyer.userId,
        email: buyer.email,
        name: buyer.name,
      },
      downloads,
    });
  } catch (err) {
    console.error("[account/purchases]", err);
    return NextResponse.json(
      { error: "Could not load purchases" },
      { status: 500 },
    );
  }
}
