import { NextResponse } from "next/server";
import { requireBuyerSession } from "@/lib/auth/buyer-session";
import { listValidGrantsByUserId } from "@/lib/supabase/download-grants";
import {
  resolveDeliveryFileKind,
  standardizedDeliveryFilename,
  standardizedDownloadButtonLabel,
} from "@/lib/payments/download-filenames";

export const dynamic = "force-dynamic";

export async function GET() {
  const buyer = await requireBuyerSession();
  if (!buyer) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const grants = await listValidGrantsByUserId(buyer.userId);
    const downloads = grants.map((g) => {
      const fileKind = resolveDeliveryFileKind({
        fileKind: g.fileKind,
        format: g.format,
      });
      const fileIndex =
        typeof g.fileIndex === "number" && g.fileIndex >= 0 ? g.fileIndex : 0;
      const filename = standardizedDeliveryFilename(g.planId, fileKind, fileIndex);
      return {
        token: g.token,
        planId: g.planId,
        listingId: g.listingId,
        format: g.format,
        fileKind,
        filename,
        label: standardizedDownloadButtonLabel(g.planId, fileKind, fileIndex),
        downloadUrl: `/api/download?token=${encodeURIComponent(g.token)}&format=${g.format}`,
        expiresAt: g.expiresAt,
        createdAt: g.createdAt,
      };
    });

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
