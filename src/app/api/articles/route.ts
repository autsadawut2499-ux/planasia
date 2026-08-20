import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug, listArticles } from "@/lib/supabase/articles";

export const runtime = "nodejs";

/** Public published articles. */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (slug) {
    const article = await getArticleBySlug(slug, { publishedOnly: true });
    if (!article) {
      return NextResponse.json({ error: "ไม่พบบทความ" }, { status: 404 });
    }
    return NextResponse.json({ article });
  }

  const articles = await listArticles({ publishedOnly: true });
  return NextResponse.json({ articles });
}
