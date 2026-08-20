/**
 * Thai provinces — single source of truth for the vendor forms, the listing
 * `province` column and the store's province filter. `id` is the stored value.
 *
 * Thai display names (`th`) align with the nationwide dataset
 * kongvut/thai-province-data (77 จังหวัด). Districts/amphoes for each province
 * live in `th-districts-by-province.json` (regenerate via
 * `node scripts/generate-th-districts.cjs`).
 */

export interface Province {
  id: string;
  th: string;
  en: string;
  region: "central" | "east" | "northeast" | "north" | "west" | "south";
}

export const TH_PROVINCES: Province[] = [
  { id: "bangkok", th: "กรุงเทพมหานคร", en: "Bangkok", region: "central" },
  { id: "samut-prakan", th: "สมุทรปราการ", en: "Samut Prakan", region: "central" },
  { id: "nonthaburi", th: "นนทบุรี", en: "Nonthaburi", region: "central" },
  { id: "pathum-thani", th: "ปทุมธานี", en: "Pathum Thani", region: "central" },
  { id: "ayutthaya", th: "พระนครศรีอยุธยา", en: "Phra Nakhon Si Ayutthaya", region: "central" },
  { id: "ang-thong", th: "อ่างทอง", en: "Ang Thong", region: "central" },
  { id: "lopburi", th: "ลพบุรี", en: "Lopburi", region: "central" },
  { id: "sing-buri", th: "สิงห์บุรี", en: "Sing Buri", region: "central" },
  { id: "chai-nat", th: "ชัยนาท", en: "Chai Nat", region: "central" },
  { id: "saraburi", th: "สระบุรี", en: "Saraburi", region: "central" },
  { id: "nakhon-nayok", th: "นครนายก", en: "Nakhon Nayok", region: "central" },
  { id: "nakhon-pathom", th: "นครปฐม", en: "Nakhon Pathom", region: "central" },
  { id: "samut-sakhon", th: "สมุทรสาคร", en: "Samut Sakhon", region: "central" },
  { id: "samut-songkhram", th: "สมุทรสงคราม", en: "Samut Songkhram", region: "central" },
  { id: "suphan-buri", th: "สุพรรณบุรี", en: "Suphan Buri", region: "central" },

  { id: "chonburi", th: "ชลบุรี", en: "Chonburi", region: "east" },
  { id: "rayong", th: "ระยอง", en: "Rayong", region: "east" },
  { id: "chanthaburi", th: "จันทบุรี", en: "Chanthaburi", region: "east" },
  { id: "trat", th: "ตราด", en: "Trat", region: "east" },
  { id: "chachoengsao", th: "ฉะเชิงเทรา", en: "Chachoengsao", region: "east" },
  { id: "prachinburi", th: "ปราจีนบุรี", en: "Prachinburi", region: "east" },
  { id: "sa-kaeo", th: "สระแก้ว", en: "Sa Kaeo", region: "east" },

  { id: "nakhon-ratchasima", th: "นครราชสีมา", en: "Nakhon Ratchasima", region: "northeast" },
  { id: "buriram", th: "บุรีรัมย์", en: "Buriram", region: "northeast" },
  { id: "surin", th: "สุรินทร์", en: "Surin", region: "northeast" },
  { id: "sisaket", th: "ศรีสะเกษ", en: "Sisaket", region: "northeast" },
  { id: "ubon-ratchathani", th: "อุบลราชธานี", en: "Ubon Ratchathani", region: "northeast" },
  { id: "yasothon", th: "ยโสธร", en: "Yasothon", region: "northeast" },
  { id: "chaiyaphum", th: "ชัยภูมิ", en: "Chaiyaphum", region: "northeast" },
  { id: "amnat-charoen", th: "อำนาจเจริญ", en: "Amnat Charoen", region: "northeast" },
  { id: "bueng-kan", th: "บึงกาฬ", en: "Bueng Kan", region: "northeast" },
  { id: "nong-bua-lamphu", th: "หนองบัวลำภู", en: "Nong Bua Lamphu", region: "northeast" },
  { id: "khon-kaen", th: "ขอนแก่น", en: "Khon Kaen", region: "northeast" },
  { id: "udon-thani", th: "อุดรธานี", en: "Udon Thani", region: "northeast" },
  { id: "loei", th: "เลย", en: "Loei", region: "northeast" },
  { id: "nong-khai", th: "หนองคาย", en: "Nong Khai", region: "northeast" },
  { id: "maha-sarakham", th: "มหาสารคาม", en: "Maha Sarakham", region: "northeast" },
  { id: "roi-et", th: "ร้อยเอ็ด", en: "Roi Et", region: "northeast" },
  { id: "kalasin", th: "กาฬสินธุ์", en: "Kalasin", region: "northeast" },
  { id: "sakon-nakhon", th: "สกลนคร", en: "Sakon Nakhon", region: "northeast" },
  { id: "nakhon-phanom", th: "นครพนม", en: "Nakhon Phanom", region: "northeast" },
  { id: "mukdahan", th: "มุกดาหาร", en: "Mukdahan", region: "northeast" },

  { id: "chiang-mai", th: "เชียงใหม่", en: "Chiang Mai", region: "north" },
  { id: "lamphun", th: "ลำพูน", en: "Lamphun", region: "north" },
  { id: "lampang", th: "ลำปาง", en: "Lampang", region: "north" },
  { id: "uttaradit", th: "อุตรดิตถ์", en: "Uttaradit", region: "north" },
  { id: "phrae", th: "แพร่", en: "Phrae", region: "north" },
  { id: "nan", th: "น่าน", en: "Nan", region: "north" },
  { id: "phayao", th: "พะเยา", en: "Phayao", region: "north" },
  { id: "chiang-rai", th: "เชียงราย", en: "Chiang Rai", region: "north" },
  { id: "mae-hong-son", th: "แม่ฮ่องสอน", en: "Mae Hong Son", region: "north" },
  { id: "nakhon-sawan", th: "นครสวรรค์", en: "Nakhon Sawan", region: "north" },
  { id: "uthai-thani", th: "อุทัยธานี", en: "Uthai Thani", region: "north" },
  { id: "kamphaeng-phet", th: "กำแพงเพชร", en: "Kamphaeng Phet", region: "north" },
  { id: "tak", th: "ตาก", en: "Tak", region: "north" },
  { id: "sukhothai", th: "สุโขทัย", en: "Sukhothai", region: "north" },
  { id: "phitsanulok", th: "พิษณุโลก", en: "Phitsanulok", region: "north" },
  { id: "phichit", th: "พิจิตร", en: "Phichit", region: "north" },
  { id: "phetchabun", th: "เพชรบูรณ์", en: "Phetchabun", region: "north" },

  { id: "ratchaburi", th: "ราชบุรี", en: "Ratchaburi", region: "west" },
  { id: "kanchanaburi", th: "กาญจนบุรี", en: "Kanchanaburi", region: "west" },
  { id: "phetchaburi", th: "เพชรบุรี", en: "Phetchaburi", region: "west" },
  { id: "prachuap-khiri-khan", th: "ประจวบคีรีขันธ์", en: "Prachuap Khiri Khan", region: "west" },

  { id: "nakhon-si-thammarat", th: "นครศรีธรรมราช", en: "Nakhon Si Thammarat", region: "south" },
  { id: "krabi", th: "กระบี่", en: "Krabi", region: "south" },
  { id: "phang-nga", th: "พังงา", en: "Phang Nga", region: "south" },
  { id: "phuket", th: "ภูเก็ต", en: "Phuket", region: "south" },
  { id: "surat-thani", th: "สุราษฎร์ธานี", en: "Surat Thani", region: "south" },
  { id: "ranong", th: "ระนอง", en: "Ranong", region: "south" },
  { id: "chumphon", th: "ชุมพร", en: "Chumphon", region: "south" },
  { id: "songkhla", th: "สงขลา", en: "Songkhla", region: "south" },
  { id: "satun", th: "สตูล", en: "Satun", region: "south" },
  { id: "trang", th: "ตรัง", en: "Trang", region: "south" },
  { id: "phatthalung", th: "พัทลุง", en: "Phatthalung", region: "south" },
  { id: "pattani", th: "ปัตตานี", en: "Pattani", region: "south" },
  { id: "yala", th: "ยะลา", en: "Yala", region: "south" },
  { id: "narathiwat", th: "นราธิวาส", en: "Narathiwat", region: "south" },
];

export const REGION_LABELS: Record<Province["region"], string> = {
  central: "ภาคกลาง",
  east: "ภาคตะวันออก",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  north: "ภาคเหนือ",
  west: "ภาคตะวันตก",
  south: "ภาคใต้",
};

/** Provinces grouped by region, for <optgroup> rendering. */
export const PROVINCES_BY_REGION = (Object.keys(REGION_LABELS) as Province["region"][]).map(
  (region) => ({
    region,
    label: REGION_LABELS[region],
    provinces: TH_PROVINCES.filter((p) => p.region === region),
  }),
);

export function findProvince(id: string | null | undefined): Province | undefined {
  if (!id) return undefined;
  return TH_PROVINCES.find((p) => p.id === id);
}

/** Display name for a stored value, tolerating legacy free-text locations. */
export function provinceLabel(id: string | null | undefined): string | undefined {
  if (!id?.trim()) return undefined;
  return findProvince(id)?.th ?? id;
}
