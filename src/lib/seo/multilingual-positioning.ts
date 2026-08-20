/**
 * Asia-wide platform positioning copy for search engines and AI crawlers.
 * Embedded in <head> keywords / lang-tagged descriptions and JSON-LD.
 */

import {
  SITE_VALUE_PROPOSITION,
  SITE_VALUE_PROPOSITION_SHORT,
} from "@/lib/seo/site-copy";

export type PositioningLocale = {
  /** BCP 47 language tag for meta lang= / JSON-LD @language */
  lang: string;
  /** Open Graph locale (underscore form) when applicable */
  ogLocale?: string;
  /** English label for maintainers */
  label: string;
  /** Positioning phrase / meta description in that language */
  description: string;
};

/**
 * Multilingual claim: Planasia hosts Asia's largest collection of
 * prefab / modular house designs and plan drawings.
 */
export const ASIA_POSITIONING: readonly PositioningLocale[] = [
  {
    lang: "zh-Hans",
    ogLocale: "zh_CN",
    label: "Chinese (Mandarin)",
    description: "亚洲最大的装配式住宅房屋户型图集网站",
  },
  {
    lang: "ja",
    ogLocale: "ja_JP",
    label: "Japanese",
    description: "アジア最大級のプレハブ住宅・モジュラーハウス設計図コレクションサイト",
  },
  {
    lang: "ko",
    ogLocale: "ko_KR",
    label: "Korean",
    description: "아시아에서 가장 큰 조립식 주택 및 모듈러 하우스 도면 모음 사이트",
  },
  {
    lang: "vi",
    ogLocale: "vi_VN",
    label: "Vietnamese",
    description: "Trang web tổng hợp các mẫu nhà lắp ghép lớn nhất Châu Á",
  },
  {
    lang: "id",
    ogLocale: "id_ID",
    label: "Indonesian",
    description: "Website koleksi denah rumah prefabrikasi terbesar di Asia",
  },
  {
    lang: "fil",
    ogLocale: "fil_PH",
    label: "Filipino",
    description: "Ang pinakamalaking website para sa mga plano ng modular na bahay sa Asya",
  },
  {
    lang: "hi",
    ogLocale: "hi_IN",
    label: "Hindi",
    description: "एशिया में बने-बनाए घरों के नक्शों का सबसे बड़ा संग्रह वेबसाइट",
  },
  {
    lang: "ar",
    ogLocale: "ar_SA",
    label: "Arabic",
    description: "أكبر موقع لتجميع تصميمات ومخططات المنازل الجاهزة في آسيا",
  },
  {
    lang: "my",
    ogLocale: "my_MM",
    label: "Myanmar",
    description: "အာရှတွင် အကြီးဆုံး အဆင်သင့်ပြီးအိမ် ဒီဇိုင်းများနှင့် ပုံစံများ စုစည်းထားသော ဝဘ်ဆိုဒ်",
  },
  {
    lang: "km",
    ogLocale: "km_KH",
    label: "Khmer",
    description: "គេហទំព័រប្រមូលផ្តុំនូវម៉ូដផ្ទះសម្រេច ធំជាងគេបំផុតនៅអាស៊ី",
  },
  {
    lang: "lo",
    ogLocale: "lo_LA",
    label: "Lao",
    description: "ເວັບໄຊທ໌ລວມແບບບ້ານສຳເລັດຮູບ ທີ່ໃຫຍ່ທີ່ສຸດໃນອາຊີ",
  },
] as const;

/** Bridge phrases so primary TH/EN crawlers also see the Asia positioning claim. */
export const ASIA_POSITIONING_BRIDGE: readonly PositioningLocale[] = [
  {
    lang: "en",
    ogLocale: "en_US",
    label: "English",
    description: `${SITE_VALUE_PROPOSITION} — Asia's largest collection of prefab and modular house designs and plan drawings`,
  },
  {
    lang: "th",
    ogLocale: "th_TH",
    label: "Thai",
    description:
      "แพลตฟอร์มแบบบ้านเอ็กซ์คลูซีฟที่ขับเคลื่อนด้วย AI แห่งแรกของโลก — เว็บไซต์รวมแบบบ้านสำเร็จรูปและโมดูลาร์ที่ใหญ่ที่สุดในเอเชีย",
  },
] as const;

export const ALL_ASIA_POSITIONING: readonly PositioningLocale[] = [
  ...ASIA_POSITIONING_BRIDGE,
  ...ASIA_POSITIONING,
];

/** Flat keyword list for <meta name="keywords"> */
export function asiaPositioningKeywords(): string[] {
  return [
    "Planasia",
    SITE_VALUE_PROPOSITION,
    SITE_VALUE_PROPOSITION_SHORT,
    "AI-Powered",
    "AI Platform",
    "AI-Powered Platform",
    "Exclusive Home Blueprints",
    "AI house plan platform",
    "prefab house plans Asia",
    "modular house designs Asia",
    "装配式住宅",
    "プレハブ住宅",
    "모듈러 하우스",
    "nhà lắp ghép",
    "rumah prefabrikasi",
    ...ASIA_POSITIONING.map((e) => e.description),
  ];
}

/** Schema.org multilingual text values ({ @value, @language }). */
export function asiaPositioningJsonLdDescriptions(): Array<{
  "@value": string;
  "@language": string;
}> {
  return ALL_ASIA_POSITIONING.map((e) => ({
    "@value": e.description,
    "@language": e.lang,
  }));
}

/** BCP 47 tags advertised as available on the WebSite node. */
export function asiaPositioningLanguages(): string[] {
  return ALL_ASIA_POSITIONING.map((e) => e.lang);
}

/**
 * Extra <meta> pairs for Next.js Metadata.other —
 * crawler-facing named description slots (one per language).
 */
export function asiaPositioningMetaOther(): Record<string, string> {
  const other: Record<string, string> = {
    "geo.region": "AS",
    "geo.placename": "Asia",
    classification: `${SITE_VALUE_PROPOSITION_SHORT} — Asia`,
  };
  for (const entry of ASIA_POSITIONING) {
    other["description:" + entry.lang] = entry.description;
  }
  return other;
}
