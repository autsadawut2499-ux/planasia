import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { revalidateArticleSurfaces } from "@/lib/content/revalidate-articles";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  listArticles,
  updateArticle,
} from "@/lib/supabase/articles";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (id) {
      const article = await getArticleById(id);
      if (!article) return NextResponse.json({ error: "ไม่พบบทความ" }, { status: 404 });
      return NextResponse.json({ article });
    }
    const articles = await listArticles();
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = (await request.json()) as Record<string, unknown>;
    const article = await createArticle(
      {
        title: String(body.title ?? ""),
        content: String(body.content ?? ""),
        featuredImageUrl:
          body.featuredImageUrl != null ? String(body.featuredImageUrl) : null,
        excerpt: body.excerpt != null ? String(body.excerpt) : null,
        isPublished: body.isPublished !== false && body.is_published !== false,
        slug: body.slug != null ? String(body.slug) : undefined,
      },
      admin.email,
    );
    revalidateArticleSurfaces({ slug: article.slug });
    return NextResponse.json({ article });
  } catch (err) {
    const message = err instanceof Error ? err.message : "สร้างบทความไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "ต้องระบุ id" }, { status: 400 });

    const existing = await getArticleById(id);
    const article = await updateArticle(
      id,
      {
        title: String(body.title ?? ""),
        content: String(body.content ?? ""),
        featuredImageUrl:
          body.featuredImageUrl === null
            ? null
            : body.featuredImageUrl != null
              ? String(body.featuredImageUrl)
              : undefined,
        excerpt: body.excerpt != null ? String(body.excerpt) : null,
        isPublished: body.isPublished !== false && body.is_published !== false,
        slug: body.slug != null ? String(body.slug) : undefined,
      },
      admin.email,
    );
    revalidateArticleSurfaces({
      slug: article.slug,
      previousSlug: existing?.slug,
    });
    return NextResponse.json({ article });
  } catch (err) {
    const message = err instanceof Error ? err.message : "บันทึกไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminSession();
    let id = request.nextUrl.searchParams.get("id")?.trim() || "";
    if (!id) {
      try {
        const body = (await request.json()) as { id?: string };
        id = String(body.id ?? "").trim();
      } catch {
        /* empty body */
      }
    }
    if (!id) return NextResponse.json({ error: "ต้องระบุ id" }, { status: 400 });
    const existing = await getArticleById(id);
    await deleteArticle(id);
    revalidateArticleSurfaces({ slug: existing?.slug });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ลบไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
