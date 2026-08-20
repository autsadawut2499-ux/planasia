import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/supabase/articles";
import { getSiteUrl } from "@/lib/seo/site-url";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "บทความ | Articles | Planasia",
  description: "บทความและคู่มือเกี่ยวกับแบบบ้าน การก่อสร้าง และสินเชื่อบ้านจาก Planasia",
  alternates: { canonical: `${getSiteUrl()}/articles` },
};

export default async function ArticlesIndexPage() {
  const articles = await listArticles({ publishedOnly: true });

  return (
    <main className="min-h-screen bg-[var(--color-surface)] pb-16 pt-8 font-sans text-text-primary md:pt-12">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <header className="mb-8 md:mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e40af]">
            Articles
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#1A2744] sm:text-3xl">
            บทความ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            ความรู้และคู่มือเกี่ยวกับแบบบ้าน การก่อสร้าง และการเตรียมสินเชื่อบ้าน
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center text-sm text-text-muted">
            ยังไม่มีบทความที่เผยแพร่
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/articles/${encodeURIComponent(article.slug)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:border-[#1e40af]/35 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {article.featuredImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.featuredImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Planasia
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <time
                      dateTime={article.publishedAt || article.updatedAt}
                      className="text-[11px] font-medium text-text-muted"
                    >
                      {new Date(article.publishedAt || article.updatedAt).toLocaleDateString(
                        "th-TH",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </time>
                    <h2 className="mt-1.5 font-heading text-lg font-bold leading-snug text-[#1A2744] group-hover:text-[#1e40af]">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                        {article.excerpt}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-xs font-semibold text-[#1e40af]">
                      อ่านต่อ →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
