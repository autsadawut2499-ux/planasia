import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/supabase/articles";
import { getSiteUrl } from "@/lib/seo/site-url";
import { excerptFromContent } from "@/lib/content/articles";

/**
 * On-demand ISR — do not prerender every slug at build time.
 * Long Thai slugs expand via percent-encoding into ENAMETOOLONG filesystem paths
 * under `.next/.../prerender-fallback`.
 */
export const revalidate = 1800;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug), { publishedOnly: true });
  if (!article) return { title: "บทความ | Planasia" };
  const description =
    article.excerpt || excerptFromContent(article.content) || article.title;
  return {
    title: `${article.title} | Planasia`,
    description,
    alternates: { canonical: `${getSiteUrl()}/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      images: article.featuredImageUrl ? [{ url: article.featuredImageUrl }] : undefined,
    },
  };
}

/** Empty: avoid writing huge encoded slug paths during `next build`. */
export function generateStaticParams() {
  return [];
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug), { publishedOnly: true });
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-[var(--color-surface)] pb-16 pt-8 font-sans text-text-primary md:pt-12">
      <article className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Link
          href="/articles"
          className="text-sm font-semibold text-[#1e40af] hover:underline"
        >
          ← กลับไปบทความทั้งหมด
        </Link>

        <header className="mt-5">
          <time
            dateTime={article.publishedAt || article.updatedAt}
            className="text-[11px] font-medium text-text-muted"
          >
            {new Date(article.publishedAt || article.updatedAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#1A2744] sm:text-3xl">
            {article.title}
          </h1>
        </header>

        {article.featuredImageUrl && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.featuredImageUrl}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-slate mt-8 max-w-none prose-headings:font-heading prose-headings:text-[#1A2744] prose-a:text-[#1e40af] prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </main>
  );
}
