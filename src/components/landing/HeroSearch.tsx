"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bath, BedDouble, ChevronDown, Maximize2 } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";

const FALLBACK_HERO_IMAGE = DEFAULT_SITE_SETTINGS.hero.backgroundImageUrl;

/**
 * Hero search — cover image (admin-managed) with filter controls.
 * Mobile: image first, then a stacked grey search card below (no overlap).
 * Desktop: compact floating filter bar over the cover.
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
    <section className="relative w-full">
      <div className="hero-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={coverImage}
          src={coverImage}
          alt={L("Featured house cover", "ภาพปกแบบบ้านหน้าแรก")}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>

      {/*
        Mobile: in-flow card under the hero (matches ABHP stacking).
        md+: absolute overlay on the cover image.
      */}
      <div className="relative z-10 px-4 py-5 md:absolute md:inset-x-0 md:bottom-[20%] md:px-4 md:py-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startBrowsing();
          }}
          className="mx-auto grid w-full max-w-lg grid-cols-2 gap-x-3 gap-y-4 rounded-2xl bg-[#e8eaef] p-5 shadow-sm md:flex md:max-w-[700px] md:grid-cols-none md:items-stretch md:gap-0 md:rounded-[12px] md:border md:border-white/60 md:bg-white/92 md:p-1.5 md:shadow-[0_12px_36px_rgba(0,0,0,0.22)] md:backdrop-blur-md lg:w-[46%] lg:max-w-[680px]"
        >
          <Field
            icon={<Maximize2 className="h-4 w-4 md:h-3.5 md:w-3.5" strokeWidth={1.5} />}
            label={L("SQ FT MIN", "ตร.ม. ขั้นต่ำ")}
            grow="area"
          >
            <input
              type="number"
              min={0}
              value={areaMin}
              onChange={(e) => setAreaMin(e.target.value)}
              placeholder={L("Enter Value", "กรอกค่า")}
              className="w-full border-none bg-transparent p-0 text-sm font-light text-text-primary outline-none placeholder:text-text-muted md:text-[11px]"
            />
          </Field>

          <Divider />

          <Field
            icon={<Maximize2 className="h-4 w-4 md:h-3.5 md:w-3.5" strokeWidth={1.5} />}
            label={L("SQ FT MAX", "ตร.ม. สูงสุด")}
            grow="area"
          >
            <input
              type="number"
              min={0}
              value={areaMax}
              onChange={(e) => setAreaMax(e.target.value)}
              placeholder={L("Enter Value", "กรอกค่า")}
              className="w-full border-none bg-transparent p-0 text-sm font-light text-text-primary outline-none placeholder:text-text-muted md:text-[11px]"
            />
          </Field>

          <Divider />

          <Field
            icon={<BedDouble className="h-4 w-4 md:h-3.5 md:w-3.5" strokeWidth={1.5} />}
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
            icon={<Bath className="h-4 w-4 md:h-3.5 md:w-3.5" strokeWidth={1.5} />}
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

          <div className="col-span-2 flex shrink-0 items-center md:pl-1.5">
            <button
              type="submit"
              className="w-full rounded-lg bg-[#1e40af] px-4 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#1e3a8a] md:w-auto md:whitespace-nowrap md:px-3.5 md:py-2 md:text-[10px] md:font-medium"
            >
              {L("Start Browsing Plans", "เริ่มค้นหาแบบบ้าน")}
            </button>
          </div>
        </form>
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
      className={`flex min-w-0 items-start gap-2.5 px-1 py-1 md:items-center md:px-2.5 md:py-1 ${
        grow === "select" ? "md:flex-[0.85] md:basis-0" : "md:flex-1 md:basis-0"
      }`}
    >
      <span className="mt-0.5 shrink-0 text-[#64748b] md:mt-0" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary md:mb-0.5 md:text-[8px] md:tracking-[0.08em]">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}

function Divider() {
  return <span className="hidden w-px self-stretch bg-slate-200 md:block" aria-hidden />;
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
        className="w-full appearance-none border-none bg-transparent py-0 pr-4 text-sm font-light text-text-primary outline-none md:pr-3.5 md:text-[11px]"
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
        className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted md:h-3 md:w-3"
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  );
}
