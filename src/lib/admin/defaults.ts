import type { Locale } from "@/lib/geo/countries";

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface SiteBrandSettings {
  name: string;
  logoUrl: string | null;
  tagline: string;
}

export interface SiteHeaderSettings {
  showStoreLink: boolean;
  showPricingLink: boolean;
  showHowItWorksLink: boolean;
}

export interface SiteFooterSettings {
  contactEmail: string;
  contactPhone: string;
  /**
   * LINE OA / chat URL for the floating contact button
   * (e.g. https://line.me/R/ti/p/@yourid).
   */
  contactLineUrl: string;
  organizationName: string;
  address: string;
  socialLinks: SocialLink[];
  copyrightText: string;
}

export interface SiteHeroSettings {
  badgeText: string;
  backgroundImageUrl: string;
}

export interface SiteSettingsBundle {
  brand: SiteBrandSettings;
  header: SiteHeaderSettings;
  footer: SiteFooterSettings;
  hero: SiteHeroSettings;
}

export type CmsSectionKey = "hero" | "cta_band" | "footer" | "construction_tips";

export const CMS_SECTION_KEYS: CmsSectionKey[] = [
  "hero",
  "cta_band",
  "footer",
  "construction_tips",
];

export interface CmsSectionContent {
  title?: string;
  subtitle?: string;
  cta?: string;
  ctaSecondary?: string;
  ctaHref?: string;
  badge?: string;
  description?: string;
  [key: string]: string | undefined;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsBundle = {
  brand: {
    name: "Planasia",
    logoUrl: "/brand/planasia-lockup.png",
    tagline: "",
  },
  header: {
    showStoreLink: true,
    showPricingLink: true,
    showHowItWorksLink: true,
  },
  footer: {
    contactEmail: "hello@planasia.com",
    contactPhone: "094-286-6661",
    contactLineUrl: "",
    organizationName: "Planasia Co., Ltd.",
    address: "Bangkok, Thailand",
    socialLinks: [
      { platform: "facebook", url: "", label: "Facebook" },
      { platform: "instagram", url: "", label: "Instagram" },
      { platform: "line", url: "", label: "LINE" },
    ],
    copyrightText: "© {year} Planasia. All Rights Reserved.",
  },
  hero: {
    badgeText: "",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
  },
};

export const DEFAULT_CMS_BY_LOCALE: Record<Locale, Record<CmsSectionKey, CmsSectionContent>> = {
  en: {
    hero: {
      title: "AI House Concept & Layout Generator",
      subtitle:
        "Create house concepts, room zoning, and design presentations with AI — focused on design accuracy, not deep construction drawings.",
      cta: "Start Designing",
      ctaSecondary: "Explore Workflow",
    },
    cta_band: {
      title: "Ready to design your dream home?",
      description: "Start with AI-guided questionnaires and export concept design ideas.",
      cta: "Start Designing",
    },
    construction_tips: {
      title: "เคล็ดลับการก่อสร้าง",
      description:
        "ยกระดับความรู้ในการสร้างบ้านด้วยเคล็ดลับมาตรฐาน ค้นหาข้อมูลเชิงลึกและแนวทางการควบคุมงานก่อสร้างให้มีคุณภาพสูงสุดกับ Planasia",
      cta: "เคล็ดลับการก่อสร้าง",
      ctaHref: "/articles",
    },
    footer: {
      adminLabel: "Administrator",
    },
  },
  th: {
    hero: {
      title: "ออกแบบบ้านด้วย AI ระดับมืออาชีพ",
      subtitle:
        "สร้างแนวคิดแปลนบ้าน จัดโซนห้อง และนำเสนอไอเดียดีไซน์—แม่นยำฉับไวในทุกคอนเซปต์",
      cta: "เริ่มต้นใช้งานฟรี",
      ctaSecondary: "ดูตัวอย่างงาน",
    },
    cta_band: {
      title: "พร้อมออกแบบบ้านในฝันของคุณแล้วหรือยัง?",
      description: "เริ่มต้นด้วยแบบสอบถาม AI และส่งออกชุดคอนเซปต์ดีไซน์",
      cta: "เริ่มต้นใช้งานฟรี",
    },
    construction_tips: {
      title: "เคล็ดลับการก่อสร้าง",
      description:
        "ยกระดับความรู้ในการสร้างบ้านด้วยเคล็ดลับมาตรฐาน ค้นหาข้อมูลเชิงลึกและแนวทางการควบคุมงานก่อสร้างให้มีคุณภาพสูงสุดกับ Planasia",
      cta: "เคล็ดลับการก่อสร้าง",
      ctaHref: "/articles",
    },
    footer: {
      adminLabel: "ผู้ดูแลระบบ",
    },
  },
  hi: {
    hero: {
      title: "AI-Powered Architectural Intelligence for Next-Gen Living",
      subtitle:
        "Browse concept house plans from professional draftsmen across Asia and India.",
      cta: "Start Designing",
      ctaSecondary: "Explore Workflow",
    },
    cta_band: {
      title: "Ready to design your dream home?",
      description: "Browse ready-to-download concept house plans from verified draftsmen.",
      cta: "Start Designing",
    },
    construction_tips: {
      title: "เคล็ดลับการก่อสร้าง",
      description:
        "ยกระดับความรู้ในการสร้างบ้านด้วยเคล็ดลับมาตรฐาน ค้นหาข้อมูลเชิงลึกและแนวทางการควบคุมงานก่อสร้างให้มีคุณภาพสูงสุดกับ Planasia",
      cta: "เคล็ดลับการก่อสร้าง",
      ctaHref: "/articles",
    },
    footer: {
      adminLabel: "Administrator",
    },
  },
  vi: {
    hero: {
      title: "AI-Powered Architectural Intelligence for Next-Gen Living",
      subtitle:
        "Browse concept house plans from professional draftsmen across Asia.",
      cta: "Start Designing",
      ctaSecondary: "Explore Workflow",
    },
    cta_band: {
      title: "Ready to design your dream home?",
      description: "Browse ready-to-download concept house plans from verified draftsmen.",
      cta: "Start Designing",
    },
    construction_tips: {
      title: "เคล็ดลับการก่อสร้าง",
      description:
        "ยกระดับความรู้ในการสร้างบ้านด้วยเคล็ดลับมาตรฐาน ค้นหาข้อมูลเชิงลึกและแนวทางการควบคุมงานก่อสร้างให้มีคุณภาพสูงสุดกับ Planasia",
      cta: "เคล็ดลับการก่อสร้าง",
      ctaHref: "/articles",
    },
    footer: {
      adminLabel: "Administrator",
    },
  },
};

export const SITE_SETTINGS_KEYS = ["brand", "header", "footer", "hero"] as const;
