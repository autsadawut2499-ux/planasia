import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Planasia — ร้านแบบบ้าน",
    short_name: "Planasia",
    description:
      "เลือกซื้อและดาวน์โหลดแบบบ้านที่สร้างร่วมกับ AI ติดตั้งแอปเพื่อเข้าถึงหน้าแรก ร้าน และประวัติการซื้อได้ทันที",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#1e40af",
    categories: ["shopping", "business", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "หน้าแรก",
        short_name: "หน้าแรก",
        url: "/",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "ร้านแบบบ้าน",
        short_name: "ร้าน",
        url: "/store",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
