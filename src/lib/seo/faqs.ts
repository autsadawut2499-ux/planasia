import type { StoreListing } from "@/lib/store/listing-types";

/** Common buyer questions for a plan (feeds FAQPage schema + on-page FAQ). */
export function buildListingFaqs(listing: StoreListing): Array<{ question: string; answer: string }> {
  const priceText = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: listing.priceBreakdown?.currency ?? "THB",
    maximumFractionDigits: 0,
  }).format(listing.price);

  return [
    {
      question: `แบบบ้าน "${listing.name}" ราคาเท่าไหร่?`,
      answer: `ชุดเอกสารแบบแปลน (PDF) ราคา ${priceText} จัดส่งถึงที่อยู่ภายใน 2-3 วันทำการ`,
    },
    {
      question: "ได้รับไฟล์รูปแบบใด?",
      answer:
        "ไฟล์ PDF พิมพ์เขียวคุณภาพสูง หน่วยวัดระบบเมตร ประทับตราชื่อผู้ซื้อโดยอัตโนมัติเพื่อป้องกันการแชร์ต่อ",
    },
    {
      question: "แบบนี้มีกี่ห้องนอนกี่ห้องน้ำ?",
      answer: `${listing.beds} ห้องนอน · ${listing.baths} ห้องน้ำ · ${listing.floors} ชั้น · พื้นที่ใช้สอย ${listing.area}`,
    },
    {
      question: "ปรับแบบหรือจ้างเขียนแบบเพิ่มได้ไหม?",
      answer:
        "ได้ ติดต่อสถาปนิกและนักออกแบบเจ้าของผลงานผ่านหน้าโปรไฟล์เพื่อขอปรับแบบให้เหมาะกับที่ดินและงบประมาณของคุณ",
    },
  ];
}
