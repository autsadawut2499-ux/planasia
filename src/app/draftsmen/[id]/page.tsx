import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { HousePlanCard } from "@/components/store/HousePlanCard";
import { DraftsmanProfileTabs } from "@/components/vendors/DraftsmanProfileTabs";
import { provinceLabel } from "@/lib/geo/th-provinces";
import { buildBreadcrumbJsonLd, buildDraftsmanJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getDraftsmanByKey } from "@/lib/vendors/directory";

export const dynamicParams = true;

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getDraftsmanByKey(decodeURIComponent(id));
  if (!data) return { title: "ช่างเขียนแบบ | Planasia" };
  const canonical = `${getSiteUrl()}/draftsmen/${encodeURIComponent(data.card.ownerKey)}`;
  return {
    title: `${data.card.displayName} — ช่างเขียนแบบ | Planasia`,
    description:
      data.card.headline ??
      `ผลงานแบบบ้านและแปลนพิมพ์เขียวโดย ${data.card.displayName} — ${data.card.planCount} แบบบน Planasia`,
    alternates: { canonical },
  };
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-text-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </dt>
        <dd className="text-text-secondary">{children}</dd>
      </div>
    </div>
  );
}

export default async function DraftsmanProfilePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getDraftsmanByKey(decodeURIComponent(id));
  if (!data) notFound();
  const { card, listings } = data;
  const initials = card.displayName.replace(/[^a-zA-Z0-9ก-๙]/g, "").slice(0, 2).toUpperCase();

  return (
    <div className="page-canvas">
      <JsonLd data={buildDraftsmanJsonLd(card)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "หน้าแรก", path: "/" },
          { name: "หาช่างเขียนแบบ", path: "/draftsmen" },
          { name: card.displayName, path: `/draftsmen/${encodeURIComponent(card.ownerKey)}` },
        ])}
      />
      <LandingHeader />
      <main>
        <section className="relative border-b border-border bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] py-12 text-white">
          {card.coverUrl && (
            <>
              <Image
                src={card.coverUrl}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/95 to-[#1e40af]/80" />
            </>
          )}
          <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center gap-5 px-4 md:px-6">
            {card.avatarUrl ? (
              <Image
                src={card.avatarUrl}
                alt={card.displayName}
                width={88}
                height={88}
                className="h-22 w-22 rounded-full object-cover ring-4 ring-white/20"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
                {initials}
              </span>
            )}
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                {card.brandImageUrl && (
                  <Image
                    src={card.brandImageUrl}
                    alt={`${card.displayName} logo`}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg bg-white/90 object-contain p-1"
                  />
                )}
                {card.displayName}
                {card.isVerified && <BadgeCheck className="h-6 w-6 text-blue-200" />}
              </h1>
              {card.headline && <p className="mt-1 max-w-2xl text-blue-100">{card.headline}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-blue-100">
                {card.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {provinceLabel(card.location)}
                  </span>
                )}
                {card.contactPhone && (
                  <a
                    href={`tel:${card.contactPhone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold text-white transition hover:bg-white/25"
                  >
                    <Phone className="h-4 w-4" />
                    {card.contactPhone}
                  </a>
                )}
                <span>{card.planCount} แบบ</span>
                {card.rating != null && card.reviewCount > 0 && (
                  <span>
                    ★ {card.rating.toFixed(1)} ({card.reviewCount} รีวิว)
                  </span>
                )}
              </div>
              {card.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {card.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <DraftsmanProfileTabs
          portfolioCount={listings.length}
          galleryCount={card.galleryUrls.length}
          overview={
            <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-2xl border border-border bg-[var(--color-card,#fff)] p-7 md:p-8">
                  <h2 className="text-lg font-bold text-text-primary">เกี่ยวกับช่างเขียนแบบ</h2>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-text-secondary">
                    {card.headline ?? `ผลงานแบบบ้านโดย ${card.displayName} บน Planasia`}
                  </p>
                  {card.specialties.length > 0 && (
                    <>
                      <h3 className="mt-6 text-sm font-bold text-text-primary">ความเชี่ยวชาญ</h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {card.specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#1e40af]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <aside className="h-fit rounded-2xl border border-border bg-[var(--color-card,#fff)] p-7 md:p-8">
                  <h2 className="text-base font-bold text-text-primary">ติดต่อโดยตรง</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    {card.contactPhone && (
                      <ContactRow icon={<Phone className="h-4 w-4" />} label="เบอร์โทร">
                        <a
                          href={`tel:${card.contactPhone.replace(/[^\d+]/g, "")}`}
                          className="font-semibold text-[#1e40af] hover:underline"
                        >
                          {card.contactPhone}
                        </a>
                      </ContactRow>
                    )}
                    {card.location && (
                      <ContactRow icon={<MapPin className="h-4 w-4" />} label="จังหวัด">
                        {provinceLabel(card.location)}
                      </ContactRow>
                    )}
                    {card.contactEmail && (
                      <ContactRow icon={<Mail className="h-4 w-4" />} label="อีเมล">
                        <a
                          href={`mailto:${card.contactEmail}`}
                          className="break-all font-semibold text-[#1e40af] hover:underline"
                        >
                          {card.contactEmail}
                        </a>
                      </ContactRow>
                    )}
                    {card.lineId && (
                      <ContactRow icon={<MessageCircle className="h-4 w-4" />} label="LINE">
                        <a
                          href={
                            card.lineId.startsWith("http")
                              ? card.lineId
                              : `https://line.me/R/ti/p/${encodeURIComponent(
                                  card.lineId.replace(/^@/, ""),
                                )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#1e40af] hover:underline"
                        >
                          {card.lineId}
                        </a>
                      </ContactRow>
                    )}
                    {card.website && (
                      <ContactRow icon={<Globe className="h-4 w-4" />} label="เว็บไซต์">
                        <a
                          href={card.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all font-semibold text-[#1e40af] hover:underline"
                        >
                          {card.website}
                        </a>
                      </ContactRow>
                    )}
                  </dl>
                  {!card.contactPhone && !card.contactEmail && !card.lineId && (
                    <p className="mt-3 text-sm text-text-muted">
                      ช่างเขียนแบบยังไม่ได้เปิดเผยข้อมูลติดต่อ
                    </p>
                  )}
                </aside>
              </div>
            </section>
          }
          portfolio={
            <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
              <h2 className="mb-2 text-lg font-bold text-text-primary">
                ผลงานทั้งหมดของช่างคนนี้
              </h2>
              <p className="mb-7 text-sm text-text-muted">
                แบบบ้านทุกหลังที่ {card.displayName} อัปโหลดและเปิดขายบน Planasia
              </p>
              {listings.length === 0 ? (
                <p className="text-text-muted">ยังไม่มีผลงานเผยแพร่</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
                  {listings.map((listing, index) => (
                    <HousePlanCard key={listing.id} item={listing} index={index} />
                  ))}
                </div>
              )}
            </section>
          }
          gallery={
            <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
              <h2 className="mb-5 text-lg font-bold text-text-primary">ภาพผลงาน</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {card.galleryUrls.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-xl bg-surface-raised"
                  >
                    <Image
                      src={url}
                      alt={`${card.displayName} showcase`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          }
        />
      </main>
    </div>
  );
}
