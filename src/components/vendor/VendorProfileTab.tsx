"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { FileUpload } from "@/components/vendor/FileUpload";
import { Card, Field, PrimaryButton, Select, TextArea, TextInput } from "@/components/vendor/ui";
import { ASIA_COUNTRIES } from "@/lib/geo/asia-countries";
import { PROVINCES_BY_REGION, findProvince, provinceLabel } from "@/lib/geo/th-provinces";
import { withMediaCacheBust } from "@/lib/media/cache-bust";
import type { UploadKind, useVendorDashboard } from "@/hooks/useVendorDashboard";

type Dashboard = ReturnType<typeof useVendorDashboard>;

const MAX_GALLERY = 12;

export function VendorProfileTab({ dash }: { dash: Dashboard }) {
  const { data, saveProfile, uploadFile, refresh } = dash;
  const toast = useToast();
  const router = useRouter();
  const p = data?.profile;

  // Live form state — the preview card reads directly from here, so any change
  // (typing or a fresh avatar upload) reflects instantly with no page reload.
  const [displayName, setDisplayName] = useState(p?.displayName ?? "");
  const [headline, setHeadline] = useState(p?.headline ?? "");
  const [bio, setBio] = useState(p?.bio ?? "");
  const [location, setLocation] = useState(p?.location ?? "");
  const [countryCode, setCountryCode] = useState(p?.countryCode ?? "TH");
  const [yearsExperience, setYears] = useState(p?.yearsExperience?.toString() ?? "");
  const [specialties, setSpecialties] = useState((p?.specialties ?? []).join(", "));
  const [avatarUrl, setAvatarUrl] = useState(p?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(p?.coverUrl ?? "");
  // Brand logo is no longer editable here — preserve any existing value on save.
  const brandImageUrl = p?.brandImageUrl ?? "";
  const [galleryUrls, setGalleryUrls] = useState<string[]>(p?.galleryUrls ?? []);
  const [contactEmail, setContactEmail] = useState(p?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(p?.contactPhone ?? "");
  const [lineId, setLineId] = useState(p?.lineId ?? "");
  const [website, setWebsite] = useState(p?.website ?? "");
  const [socials, setSocials] = useState((p?.socials ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync when /api/vendor/me finishes loading (useState only captures the first null profile).
  useEffect(() => {
    if (!p) return;
    setDisplayName(p.displayName ?? "");
    setHeadline(p.headline ?? "");
    setBio(p.bio ?? "");
    setLocation(p.location ?? "");
    setCountryCode(p.countryCode ?? "TH");
    setYears(p.yearsExperience?.toString() ?? "");
    setSpecialties((p.specialties ?? []).join(", "));
    setAvatarUrl(p.avatarUrl ?? "");
    setCoverUrl(p.coverUrl ?? "");
    setGalleryUrls(p.galleryUrls ?? []);
    setContactEmail(p.contactEmail ?? "");
    setContactPhone(p.contactPhone ?? "");
    setLineId(p.lineId ?? "");
    setWebsite(p.website ?? "");
    setSocials((p.socials ?? []).join(", "));
  }, [p?.updatedAt, p?.ownerKey]);

  const specialtyList = specialties.split(",").map((s) => s.trim()).filter(Boolean);
  const initials = (displayName || "?").replace(/[^a-zA-Z0-9ก-๙]/g, "").slice(0, 2).toUpperCase();

  function profilePayload(overrides?: { avatarUrl?: string; coverUrl?: string }) {
    return {
      displayName,
      headline,
      bio,
      location,
      countryCode,
      yearsExperience,
      specialties: specialtyList,
      avatarUrl: overrides?.avatarUrl ?? avatarUrl,
      coverUrl: overrides?.coverUrl ?? coverUrl,
      brandImageUrl,
      galleryUrls,
      contactEmail,
      contactPhone,
      lineId,
      website,
      socials: socials.split(",").map((s) => s.trim()).filter(Boolean),
      isPublished: true,
    };
  }

  async function handlePreviewUpload(file: File | undefined | null, kind: "avatar" | "cover") {
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadFile(file, kind as UploadKind);
      const nextAvatar = kind === "avatar" ? url : avatarUrl;
      const nextCover = kind === "cover" ? url : coverUrl;
      if (kind === "avatar") setAvatarUrl(url);
      else setCoverUrl(url);

      // Persist immediately so public profile / directory show the new cover.
      if (displayName.trim()) {
        const saved = await saveProfile(
          profilePayload({ avatarUrl: nextAvatar, coverUrl: nextCover }),
        );
        if (saved.coverUrl) setCoverUrl(saved.coverUrl);
        if (saved.avatarUrl) setAvatarUrl(saved.avatarUrl);
        await refresh({ quiet: true });
        router.refresh();
        toast.success(
          kind === "avatar"
            ? "อัปโหลดและบันทึกรูปโปรไฟล์แล้ว"
            : "อัปโหลดและบันทึกภาพปกแล้ว",
        );
      } else {
        toast.success(
          kind === "avatar"
            ? "อัปโหลดรูปโปรไฟล์แล้ว — กรอกชื่อแล้วกดบันทึกเพื่อเผยแพร่"
            : "อัปโหลดภาพปกแล้ว — กรอกชื่อแล้วกดบันทึกเพื่อเผยแพร่",
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(null);
      if (kind === "avatar" && avatarInputRef.current) avatarInputRef.current.value = "";
      if (kind === "cover" && coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!displayName.trim()) {
      toast.error("กรุณากรอกชื่อที่แสดง");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveProfile(profilePayload());
      if (saved.coverUrl) setCoverUrl(saved.coverUrl);
      if (saved.avatarUrl) setAvatarUrl(saved.avatarUrl);
      await refresh({ quiet: true });
      router.refresh();
      toast.success("บันทึกโปรไฟล์แล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Card title="ข้อมูลแนะนำตัว">
          <div className="space-y-4">
            <Field label="ชื่อที่แสดง *">
              <TextInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="เช่น สตูดิโอออกแบบบ้าน XYZ" />
            </Field>
            <Field label="หัวข้อสั้น (Headline)">
              <TextInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="เช่น ออกแบบบ้านโมเดิร์นสไตล์ทรอปิคอล" />
            </Field>
            <Field label="ประวัติแนะนำตัว (Bio)">
              <TextArea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="เล่าประสบการณ์ ผลงาน และความเชี่ยวชาญของคุณ" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="ประเทศ">
                <Select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  {ASIA_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.th}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="จังหวัด" hint="แสดงบนโปรไฟล์สาธารณะ">
                <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">— เลือกจังหวัด —</option>
                  {PROVINCES_BY_REGION.map((group) => (
                    <optgroup key={group.region} label={group.label}>
                      {group.provinces.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.th}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {/* Keeps a pre-existing free-text location selectable. */}
                  {location && !findProvince(location) && (
                    <option value={location}>{location}</option>
                  )}
                </Select>
              </Field>
              <Field label="ประสบการณ์ (ปี)">
                <TextInput type="number" min={0} value={yearsExperience} onChange={(e) => setYears(e.target.value)} placeholder="เช่น 8" />
              </Field>
            </div>
            <Field label="ความเชี่ยวชาญ" hint="คั่นด้วยเครื่องหมายจุลภาค เช่น โมเดิร์น, บ้านชั้นเดียว, รีสอร์ท">
              <TextInput value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="โมเดิร์น, ทรอปิคอล, รีสอร์ท" />
            </Field>
          </div>
        </Card>

        <Card
          title="ภาพผลงานที่นำมาโชว์"
          desc="รูปผลงานบนโปรไฟล์สาธารณะ — อัปโหลดและจัดเรียงได้ที่นี่"
        >
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-text-muted">
              {galleryUrls.length}/{MAX_GALLERY} รูป
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {galleryUrls.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="showcase" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setGalleryUrls(galleryUrls.filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-text-muted opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                  aria-label="ลบรูป"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {galleryUrls.length < MAX_GALLERY && (
              <div className="aspect-square">
                <FileUpload
                  kind="render"
                  variant="image"
                  onUpload={uploadFile}
                  onUploaded={(url) => setGalleryUrls([...galleryUrls, url])}
                  onError={(m) => toast.error(m)}
                  hint="+ เพิ่มรูป"
                />
              </div>
            )}
          </div>
        </Card>

        <Card title="ข้อมูลติดต่อ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="อีเมล">
              <TextInput type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field
              label="เบอร์โทร (แจ้งเตือนเมื่อขายได้)"
              hint="ผูกกับแบบบ้านของคุณ — ระบบส่ง SMS ทันทีเมื่อลูกค้าชำระเงินสำเร็จ"
            >
              <TextInput
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
            <Field label="LINE ID">
              <TextInput value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="@yourline" />
            </Field>
            <Field label="เว็บไซต์">
              <TextInput value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </Field>
            <div className="sm:col-span-2">
              <Field label="โซเชียลมีเดีย (sameAs)" hint="ลิงก์ Facebook / Instagram / อื่นๆ คั่นด้วยจุลภาค — ช่วยเพิ่มความน่าเชื่อถือใน Google">
                <TextInput value={socials} onChange={(e) => setSocials(e.target.value)} placeholder="https://facebook.com/..., https://instagram.com/..." />
              </Field>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <PrimaryButton onClick={handleSave} loading={saving}>
            บันทึกโปรไฟล์
          </PrimaryButton>
        </div>
      </div>

      {/* Live preview — avatar & cover edit directly from this card */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          ตัวอย่างหน้าโปรไฟล์ (เรียลไทม์)
        </p>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="group/cover relative h-28 bg-gradient-to-br from-[#1e3a5f] to-[#1e40af]">
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={coverUrl}
                src={withMediaCacheBust(coverUrl)}
                alt="cover"
                className="h-full w-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading === "cover"}
              aria-label={coverUrl ? "แก้ไขภาพปก" : "อัปโหลดภาพปก"}
              title={coverUrl ? "แก้ไขภาพปก" : "อัปโหลดภาพปก"}
              className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#1e3a5f] shadow-sm transition hover:bg-white disabled:opacity-60"
            >
              {uploading === "cover" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pencil className="h-3.5 w-3.5" />
              )}
            </button>
            {uploading === "cover" && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </span>
            )}
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end justify-between gap-3">
              <div className="relative">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={avatarUrl}
                    src={withMediaCacheBust(avatarUrl)}
                    alt={displayName}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-white"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1e40af] text-2xl font-bold text-white ring-4 ring-white">
                    {initials}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading === "avatar"}
                  aria-label={avatarUrl ? "แก้ไขรูปโปรไฟล์" : "อัปโหลดรูปโปรไฟล์"}
                  title={avatarUrl ? "แก้ไขรูปโปรไฟล์" : "อัปโหลดรูปโปรไฟล์"}
                  className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1e40af] text-white shadow-md transition hover:bg-[#1e3a8a] disabled:opacity-60"
                >
                  {uploading === "avatar" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Pencil className="h-3.5 w-3.5" />
                  )}
                </button>
                {uploading === "avatar" && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 ring-4 ring-white">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1e40af]" />
                  </span>
                )}
              </div>
              {brandImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brandImageUrl}
                  alt="brand"
                  className="h-10 w-10 rounded-lg border border-border bg-white object-contain p-1"
                />
              )}
            </div>
            <h4 className="mt-3 flex items-center gap-1.5 text-lg font-bold text-text-primary">
              {displayName || "ชื่อของคุณ"}
              {data?.profile?.isVerified && <BadgeCheck className="h-5 w-5 text-[#1e40af]" />}
            </h4>
            {headline && <p className="mt-0.5 text-sm text-text-secondary">{headline}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {provinceLabel(location)}
                </span>
              )}
              {contactPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {contactPhone}
                </span>
              )}
              {yearsExperience && <span>ประสบการณ์ {yearsExperience} ปี</span>}
              <span>{data?.stats.total ?? 0} แบบ</span>
            </div>
            {bio && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-text-secondary">{bio}</p>}
            {specialtyList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specialtyList.map((s) => (
                  <span key={s} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-[#1e40af]">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {galleryUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {galleryUrls.slice(0, 8).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="showcase"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            )}
            {data?.ownerKey && (
              <Link
                href={`/draftsmen/${encodeURIComponent(data.ownerKey)}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1e40af] hover:underline"
              >
                เปิดหน้าโปรไฟล์จริง <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-text-muted">
          คลิกไอคอนดินสอบนภาพปกหรือรูปโปรไฟล์เพื่ออัปโหลด / แก้ไขรูปโดยตรง
        </p>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void handlePreviewUpload(e.target.files?.[0], "cover")}
        />
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => void handlePreviewUpload(e.target.files?.[0], "avatar")}
        />
      </div>
    </div>
  );
}
