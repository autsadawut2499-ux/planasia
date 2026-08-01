import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  CUSTOMER_SERVICE_SLUGS,
  type CustomerServiceArticle,
} from "@/lib/content/customer-service";
import {
  loadCustomerServiceArticle,
  loadCustomerServiceArticles,
  saveCustomerServiceArticle,
} from "@/lib/supabase/customer-service";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const slug = request.nextUrl.searchParams.get("slug")?.trim();
    if (slug) {
      if (!CUSTOMER_SERVICE_SLUGS.includes(slug)) {
        return NextResponse.json({ error: "Unknown slug" }, { status: 404 });
      }
      const article = await loadCustomerServiceArticle(slug);
      return NextResponse.json({ article });
    }
    const articles = await loadCustomerServiceArticles();
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const slug = String(body.slug ?? "").trim();
    const article = body.article as CustomerServiceArticle | undefined;

    if (!CUSTOMER_SERVICE_SLUGS.includes(slug)) {
      return NextResponse.json({ error: "Unknown slug" }, { status: 400 });
    }
    if (!article) {
      return NextResponse.json({ error: "article is required" }, { status: 400 });
    }

    const saved = await saveCustomerServiceArticle(slug, { ...article, slug }, admin.email);
    return NextResponse.json({ article: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save article";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
