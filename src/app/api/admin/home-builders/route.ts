import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { HomeBuilderStatus } from "@/lib/home-building/types";
import {
  deleteHomeBuilder,
  listAllHomeBuilders,
  updateHomeBuilderModeration,
} from "@/lib/supabase/home-builders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const builders = await listAllHomeBuilders();
    return NextResponse.json({ builders });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const status = body.status as HomeBuilderStatus | undefined;
    const isPublished =
      typeof body.isPublished === "boolean" ? (body.isPublished as boolean) : undefined;

    if (!status && typeof isPublished !== "boolean") {
      return NextResponse.json(
        { error: "Provide status and/or isPublished" },
        { status: 400 },
      );
    }

    const builder = await updateHomeBuilderModeration(id, { status, isPublished });
    return NextResponse.json({ builder });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminSession();
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteHomeBuilder(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
