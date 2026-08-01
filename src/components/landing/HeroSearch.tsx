"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bath, BedDouble, ChevronDown, Maximize2 } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";

const FALLBACK_HERO_IMAGE = DEFAULT_SITE_SETTINGS.hero.backgroundImageUrl;

/**
 * Hero search — large cover image (admin-managed via site_settings.hero)
 * with a compact floating filter bar.
 */
export function HeroSearch() {
  const router = useRouter();
  const L = useBilingual();
  const siteConfig = useSiteConfigOptional();
  const coverImage =
    siteConfig?.settings.hero.backgroundImageUrl?.trim() || FALLBACK_HERO_IMAGE;

  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");

  const startBrowsing = () => {
    const params = new URLSearchParams();
    if (areaMin) params.set("areaMin", areaMin);
    if (areaMax) params.set("areaMax", areaMax);
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    const qs = params.toString();
    router.push(qs ? `/store?${qs}` : "/store");
  };

  return (
    <section className="relative">
      <div className="relative h-[420px] w-full overflow-hidden md:h-[560px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={coverImage}
          src={coverImage}
          alt={L("Featured house cover", "ภาพปกแบบบ้านหน้าแรก")}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="absolute inset-x-0 bottom-[18%] z-10 px-4 md:bottom-[22%]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startBrowsing();
            }}
            className="mx-auto flex w-full max-w-[680px] flex-col gap-1.5 rounded-[12px] border border-white/60 bg-white/92 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-md sm:flex-row sm:items-stretch sm:gap-0 sm:p-1.5 md:w-[50%] md:max-w-[700px] lg:w-[46%] lg:max-w-[680px]"
          >
            <Field
              icon={<Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label={L("SQ FT MIN", "ตร.ม. ขั้นต่ำ")}
              grow="area"
            >
              <input
                type="number"
                min={0}
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                placeholder={L("Enter Value", "กรอกค่า")}
                className="w-full border-none bg-transparent p-0 text-[11px] font-light text-text-primary outline-none placeholder:text-text-muted"
              />
            </Field>

            <Divider />

            <Field
              icon={<Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label={L("SQ FT MAX", "ตร.ม. สูงสุด")}
              grow="area"
            >
              <input
                type="number"
                min={0}
                value={areaMax}
                onChange={(e) => setAreaMax(e.target.value)}
                placeholder={L("Enter Value", "กรอกค่า")}
                className="w-full border-none bg-transparent p-0 text-[11px] font-light text-text-primary outline-none placeholder:text-text-muted"
              />
            </Field>

            <Divider />

            <Field
              icon={<BedDouble className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label={L("BEDROOMS", "ห้องนอน")}
              grow="select"
            >
              <SelectControl
                value={beds}
                onChange={setBeds}
                placeholder={L("Select", "เลือก")}
                max={6}
              />
            </Field>

            <Divider />

            <Field
              icon={<Bath className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label={L("BATHS", "ห้องน้ำ")}
              grow="select"
            >
              <SelectControl
                value={baths}
                onChange={setBaths}
                placeholder={L("Select", "เลือก")}
                max={5}
              />
            </Field>

            <div className="flex shrink-0 items-center sm:pl-1.5">
              <button
                type="submit"
                className="w-full rounded-lg bg-[#1e40af] px-3 py-2 text-[10px] font-medium tracking-wide text-white transition-colors hover:bg-[#1e3a8a] sm:w-auto sm:whitespace-nowrap sm:px-3.5 sm:py-2"
              >
                {L("Start Browsing Plans", "เริ่มค้นหาแบบบ้าน")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  children,
  grow = "area",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  grow?: "area" | "select";
}) {
  return (
    <label
      className={`flex min-w-0 items-center gap-1.5 px-2 py-1 sm:px-2.5 ${
        grow === "select" ? "sm:flex-[0.85] sm:basis-0" : "sm:flex-1 sm:basis-0"
      }`}
    >
      <span className="shrink-0 text-[#64748b]" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}

function Divider() {
  return <span className="hidden w-px self-stretch bg-slate-200 sm:block" aria-hidden />;
}

function SelectControl({
  value,
  onChange,
  placeholder,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border-none bg-transparent py-0 pr-3.5 text-[11px] font-light text-text-primary outline-none"
      >
        <option value="">{placeholder}</option>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <option key={n} value={String(n)}>
            {n}
            {n === max ? "+" : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted"
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  );
}
