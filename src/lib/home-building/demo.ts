import type { HomeBuilder } from "@/lib/home-building/types";

/** Demo cards when DB is empty / not configured — matches profile-card design. */
export const DEMO_HOME_BUILDERS: HomeBuilder[] = [
  {
    id: "demo-karnchang",
    companyName: "ช. การช่าง - สถาปัตยกรรมและการก่อสร้าง",
    contactPerson: "คุณชัย",
    phone: "081-234-5678",
    email: "contact@karnchang.example",
    lineId: "@karnchang",
    serviceAreas: "กรุงเทพฯ และปริมณฑล",
    yearsExperience: 15,
    expertise: "ผู้เชี่ยวชาญงานสร้างบ้านหรูและครบวงจร",
    logoUrl: null,
    portfolioUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    companyCertificateUrl: null,
    verificationDocumentUrl: null,
    privacyAccepted: true,
    termsAccepted: true,
    status: "approved",
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
