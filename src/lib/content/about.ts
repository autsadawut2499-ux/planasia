/**
 * Customer Service menu topics. Each page renders at /about/[slug].
 * Navbar shows these as a clean text list (not card mega-menu).
 */

export interface Bilingual {
  en: string;
  th: string;
}

export interface AboutSection {
  heading: Bilingual;
  body: Bilingual;
}

export interface AboutPage {
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  sections: AboutSection[];
}

/** Customer-service topics — used by the navbar dropdown and /about index. */
export const ABOUT_PAGES: AboutPage[] = [
  {
    slug: "warranty",
    title: { en: "Warranty", th: "การรับประกัน" },
    summary: {
      en: "What Planasia guarantees after you purchase a house plan.",
      th: "ขอบเขตการรับประกันหลังซื้อแบบบ้านบน Planasia",
    },
    sections: [
      {
        heading: { en: "File integrity", th: "ความครบถ้วนของไฟล์" },
        body: {
          en: "We guarantee that purchased plan files download correctly and match the package described on the product page. If a file is corrupted or incomplete, contact support for a free re-issue.",
          th: "เรารับประกันว่าไฟล์แบบที่ซื้อดาวน์โหลดได้ครบตามแพ็กเกจในหน้าสินค้า หากไฟล์เสียหรือไม่ครบ ติดต่อฝ่ายสนับสนุนเพื่อขอออกไฟล์ใหม่โดยไม่มีค่าใช้จ่าย",
        },
      },
      {
        heading: { en: "What is not covered", th: "สิ่งที่ไม่ครอบคลุม" },
        body: {
          en: "Construction outcomes, on-site adaptations, and third-party builder workmanship are outside this warranty. Always verify local codes with a licensed professional before building.",
          th: "ผลงานก่อสร้าง การดัดแปลงหน้างาน และฝีมือผู้รับเหมาภายนอกไม่อยู่ในการรับประกันนี้ ควรตรวจสอบข้อกำหนดท้องถิ่นกับผู้มีใบอนุญาตก่อนก่อสร้าง",
        },
      },
    ],
  },
  {
    slug: "special-sites",
    title: {
      en: "Adaptation for Special Sites",
      th: "การปรับใช้ในพื้นที่พิเศษ",
    },
    summary: {
      en: "How to adapt plans for slopes, narrow lots, flood zones, and other special conditions.",
      th: "แนวทางปรับแบบสำหรับที่ดินลาดชัน หน้าแคบ พื้นที่น้ำท่วม และเงื่อนไขพิเศษอื่นๆ",
    },
    sections: [
      {
        heading: { en: "Site-specific review", th: "ตรวจทานตามสภาพที่ดิน" },
        body: {
          en: "Standard plans assume typical flat lots. Sloped land, setback limits, soil conditions, or coastal/flood rules may require a draftsman or engineer to adapt the design.",
          th: "แบบมาตรฐานสมมติที่ดินราบทั่วไป ที่ลาดชัน ข้อจำกัดระยะร่น สภาพดิน หรือพื้นที่ชายฝั่ง/น้ำท่วม อาจต้องให้ช่างเขียนแบบหรือวิศวกรปรับแบบให้เหมาะสม",
        },
      },
      {
        heading: { en: "How we can help", th: "เราช่วยได้อย่างไร" },
        body: {
          en: "Use Find a Draftsman to connect with professionals who can revise floor levels, foundations, and site plans for your plot.",
          th: "ใช้เมนูค้นหาช่างเขียนแบบเพื่อเชื่อมต่อผู้เชี่ยวชาญที่ปรับระดับพื้น ฐานราก และผังที่ดินให้เข้ากับแปลงของคุณได้",
        },
      },
    ],
  },
  {
    slug: "construction-budget",
    title: {
      en: "Construction Budget Estimate",
      th: "การประมาณงบประมาณก่อสร้าง",
    },
    summary: {
      en: "How plan listings help you estimate build cost before you buy.",
      th: "แบบบ้านช่วยประมาณงบก่อสร้างอย่างไรก่อนตัดสินใจซื้อ",
    },
    sections: [
      {
        heading: { en: "Indicative figures only", th: "ตัวเลขเป็นแนวทางเท่านั้น" },
        body: {
          en: "Construction cost estimates on listings are indicative. Final budgets depend on materials, labor rates, location, finishes, and market conditions.",
          th: "ตัวเลขประมาณการบนหน้ารายการเป็นแนวทางเท่านั้น งบจริงขึ้นกับวัสดุ ค่าแรง พื้นที่ สเปกงานตกแต่ง และภาวะตลาด",
        },
      },
      {
        heading: { en: "Next steps", th: "ขั้นตอนถัดไป" },
        body: {
          en: "Share the plan and area with your builder or quantity surveyor for a site-specific quotation before committing to construction.",
          th: "ส่งแบบและพื้นที่ให้ผู้รับเหมาหรือผู้ประมาณราคา เพื่อขอใบเสนอราคาเฉพาะหน้างานก่อนเริ่มก่อสร้าง",
        },
      },
    ],
  },
  {
    slug: "global-local-language",
    title: {
      en: "International Plan Use & Local Language Certification",
      th: "การใช้งานแบบบ้านในระดับสากลและการรับรองภาษาถิ่นท้องถิ่น",
    },
    summary: {
      en: "Using Planasia plans across borders and supporting local-language documentation.",
      th: "การใช้แบบบ้านข้ามพรมแดน และการรองรับเอกสารภาษาถิ่นท้องถิ่น",
    },
    sections: [
      {
        heading: { en: "Cross-border use", th: "การใช้งานข้ามพรมแดน" },
        body: {
          en: "Plans can be a starting point in many countries, but permit drawings must meet local authority requirements. A local professional should certify adaptations.",
          th: "แบบบ้านใช้เป็นจุดเริ่มต้นได้หลายประเทศ แต่แบบยื่นขออนุญาตต้องตรงข้อกำหนดหน่วยงานท้องถิ่น ควรให้ผู้เชี่ยวชาญในพื้นที่รับรองการปรับแก้",
        },
      },
      {
        heading: { en: "Local language notes", th: "หมายเหตุภาษาถิ่น" },
        body: {
          en: "Where available, captions and key notes may be offered in local languages. Official stamped sets still follow the jurisdiction’s required language rules.",
          th: "หากมีบริการ คำบรรยายและหมายเหตุสำคัญอาจมีภาษาถิ่น แต่ชุดประทับตราอย่างเป็นทางการยังต้องเป็นไปตามภาษาที่หน่วยงานท้องถิ่นกำหนด",
        },
      },
    ],
  },
  {
    slug: "foreign-languages",
    title: {
      en: "Foreign Language Support",
      th: "การรองรับภาษาต่างประเทศ",
    },
    summary: {
      en: "Languages available on the site, store, and customer support.",
      th: "ภาษาที่รองรับบนเว็บไซต์ ร้านค้า และฝ่ายบริการลูกค้า",
    },
    sections: [
      {
        heading: { en: "Website & store", th: "เว็บไซต์และร้านค้า" },
        body: {
          en: "Planasia’s interface supports multiple languages across Asia. Listing copy may be translated for browse convenience; the purchased file package is defined on each product page.",
          th: "อินเทอร์เฟซ Planasia รองรับหลายภาษาในเอเชีย ข้อความรายการอาจแปลเพื่อช่วยเลือกชม ส่วนชุดไฟล์ที่ซื้อระบุชัดในหน้าสินค้าของแบบนั้นๆ",
        },
      },
      {
        heading: { en: "Support channels", th: "ช่องทางสนับสนุน" },
        body: {
          en: "Primary support is available in Thai and English. Other languages may be assisted via translation tools with confirmation in Thai or English for accuracy.",
          th: "ฝ่ายสนับสนุนหลักใช้ภาษาไทยและอังกฤษ ภาษาอื่นอาจช่วยผ่านเครื่องมือแปล โดยยืนยันเนื้อหาสำคัญเป็นไทยหรืออังกฤษเพื่อความถูกต้อง",
        },
      },
    ],
  },
  {
    slug: "international-communication",
    title: {
      en: "International Communication",
      th: "การสื่อสารระดับสากล",
    },
    summary: {
      en: "How buyers and vendors communicate across time zones and countries.",
      th: "แนวทางการสื่อสารระหว่างผู้ซื้อและผู้ขายข้ามโซนเวลาและประเทศ",
    },
    sections: [
      {
        heading: { en: "Channels", th: "ช่องทางติดต่อ" },
        body: {
          en: "Use in-platform contact details, email, and published phone numbers. Response times follow business hours in Thailand (ICT) unless otherwise stated.",
          th: "ใช้ข้อมูลติดต่อบนแพลตฟอร์ม อีเมล และเบอร์โทรที่เผยแพร่ เวลาตอบกลับอิงเวลาทำการของไทย (ICT) เว้นแต่ระบุไว้เป็นอย่างอื่น",
        },
      },
      {
        heading: { en: "Clarity tips", th: "เคล็ดลับสื่อสารให้ชัด" },
        body: {
          en: "Include plan code, order ID, country, and preferred language. Attach screenshots for technical issues to speed up resolution.",
          th: "แจ้งรหัสแบบ เลขคำสั่งซื้อ ประเทศ และภาษาที่ต้องการ พร้อมแคปหน้าจอเมื่อมีปัญหาทางเทคนิค เพื่อให้แก้ไขได้เร็วขึ้น",
        },
      },
    ],
  },
  {
    slug: "terms",
    title: { en: "Terms of Service", th: "เงื่อนไขการใช้บริการ" },
    summary: {
      en: "Rules for using Planasia, purchasing plans, and licensing downloads.",
      th: "เงื่อนไขการใช้ Planasia การซื้อแบบ และการอนุญาตใช้งานไฟล์",
    },
    sections: [
      {
        heading: { en: "Acceptable use", th: "การใช้ที่ยอมรับได้" },
        body: {
          en: "You may use purchased plans for the intended building project as described at checkout. Redistributing, reselling, or publicly posting unlocked files without permission is prohibited.",
          th: "ใช้แบบที่ซื้อสำหรับโครงการก่อสร้างตามที่ระบุตอนชำระเงิน ห้ามแจกจ่าย ขายต่อ หรือโพสต์ไฟล์ที่ปลดล็อกแล้วโดยไม่ได้รับอนุญาต",
        },
      },
      {
        heading: { en: "Accounts & payments", th: "บัญชีและการชำระเงิน" },
        body: {
          en: "You are responsible for account security and accurate payment details. Prices shown at checkout are binding for that order. Digital blueprints: after a successful download, refunds are not given for change of mind—see the full Terms and Refund Policy.",
          th: "คุณรับผิดชอบความปลอดภัยของบัญชีและข้อมูลการชำระเงิน ราคาที่แสดงตอนชำระเงินมีผลผูกพันสำหรับคำสั่งซื้อนั้น แบบบ้านดิจิทัล: หลังดาวน์โหลดสำเร็จแล้วไม่คืนเงินเพราะเปลี่ยนใจ — ดูรายละเอียดในข้อกำหนดและนโยบายคืนเงินฉบับเต็ม",
        },
      },
      {
        heading: { en: "Changes", th: "การเปลี่ยนแปลงเงื่อนไข" },
        body: {
          en: "We may update these terms; material changes will be reflected on this page. Continued use after updates constitutes acceptance.",
          th: "เราอาจปรับปรุงเงื่อนไข การเปลี่ยนแปลงสำคัญจะแสดงบนหน้านี้ การใช้บริการต่อหลังมีการอัปเดตถือว่าคุณยอมรับ",
        },
      },
    ],
  },
  {
    slug: "borderless-architecture",
    title: {
      en: "Borderless Architecture Standards",
      th: "มาตรฐานสถาปัตยกรรมไร้พรมแดน",
    },
    summary: {
      en: "Our approach to clear, transferable architectural documentation across regions.",
      th: "แนวทางเอกสารสถาปัตยกรรมที่ชัดเจนและนำไปใช้ข้ามภูมิภาคได้",
    },
    sections: [
      {
        heading: { en: "Readable drawings", th: "แบบที่อ่านเข้าใจได้" },
        body: {
          en: "We encourage listings to present clean floor plans, elevations, and notes so professionals in different countries can interpret the design intent.",
          th: "เราส่งเสริมให้รายการแสดงแปลนพื้น รูปด้าน และหมายเหตุที่ชัด เพื่อให้ผู้เชี่ยวชาญในประเทศต่างๆ เข้าใจเจตนาการออกแบบได้",
        },
      },
      {
        heading: { en: "Local compliance still required", th: "ยังต้องปฏิบัติตามกฎหมายท้องถิ่น" },
        body: {
          en: "Borderless clarity does not replace local building codes. Always have a licensed local professional review before permit submission.",
          th: "ความชัดเจนข้ามพรมแดนไม่ได้ทดแทนกฎหมายอาคารท้องถิ่น ควรให้ผู้มีใบอนุญาตในพื้นที่ตรวจทานก่อนยื่นขออนุญาต",
        },
      },
    ],
  },
  {
    slug: "measurement-standards",
    title: {
      en: "International Measurement Standards",
      th: "มาตรฐานหน่วยวัดสากล",
    },
    summary: {
      en: "How Planasia presents areas, dimensions, and units (metric by default).",
      th: "แนวทางการแสดงพื้นที่ ขนาด และหน่วยวัดบน Planasia (มาตรฐานเมตริกเป็นค่าเริ่มต้น)",
    },
    sections: [
      {
        heading: { en: "Metric first", th: "เมตริกเป็นหลัก" },
        body: {
          en: "Areas are typically shown in square metres (sqm) and linear dimensions in metres or millimetres, matching common Asian construction drawing practice.",
          th: "พื้นที่โดยทั่วไปแสดงเป็นตารางเมตร (ตร.ม.) และขนาดเชิงเส้นเป็นเมตรหรือมิลลิเมตร สอดคล้องกับการเขียนแบบก่อสร้างที่ใช้กันในหลายประเทศเอเชีย",
        },
      },
      {
        heading: { en: "Conversions", th: "การแปลงหน่วย" },
        body: {
          en: "If you need imperial or other units, convert carefully or ask your draftsman. Do not mix unit systems on the same construction set without clear labeling.",
          th: "หากต้องการหน่วยอังกฤษหรือหน่วยอื่น ให้แปลงอย่างระมัดระวังหรือปรึกษาช่างเขียนแบบ อย่าผสมระบบหน่วยในชุดก่อสร้างเดียวกันโดยไม่ติดป้ายให้ชัด",
        },
      },
    ],
  },
];

export function getAboutPage(slug: string): AboutPage | undefined {
  return ABOUT_PAGES.find((p) => p.slug === slug);
}
