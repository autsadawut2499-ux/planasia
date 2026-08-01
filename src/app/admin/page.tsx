import Link from "next/link";
import { getAdminSession } from "@/lib/admin/auth";
import { loadSiteSettings } from "@/lib/supabase/site-settings";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminForm";
import {
  Palette,
  FileText,
  PanelBottom,
  Images,
  TrendingUp,
  ShieldCheck,
  Percent,
  Banknote,
  Flame,
  ExternalLink,
  Home,
  ImageIcon,
  LayoutGrid,
  FolderKanban,
  Headphones,
  HardHat,
  Sparkles,
  Wand2,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();
  if (!admin) return null;

  const settings = await loadSiteSettings();

  const quickLinks = [
    {
      href: "/admin/listings",
      label: "จัดการแบบบ้าน",
      desc: "เพิ่ม แก้ไข จัดหมวด และลบแบบบ้านในร้านค้า (Full CRUD)",
      icon: Home,
    },
    {
      href: "/admin/home-builders",
      label: "รับสร้างบ้าน",
      desc: "ตรวจสอบใบสมัครผู้รับสร้าง อนุมัติ และเผยแพร่โปรไฟล์",
      icon: HardHat,
    },
    {
      href: "/admin/hero-cover",
      label: "ภาพปกหน้าแรก",
      desc: "อัปโหลด เปลี่ยน หรือลบภาพปก Hero ขนาดใหญ่บนหน้าแรก",
      icon: ImageIcon,
    },
    {
      href: "/admin/ai-image-tools",
      label: "รูปการ์ด AI",
      desc: "อัปโหลดภาพพื้นหลังการ์ด Google Flow · Midjourney · Adobe Firefly",
      icon: Sparkles,
    },
    {
      href: "/admin/ai-render-guide",
      label: "คู่มือ AI Rendering",
      desc: "จัดการพร้อมพ์ต 5 ชุด และรูป Before/After 5 ชุด สำหรับผู้เขียนแบบ",
      icon: Wand2,
    },
    {
      href: "/admin/mega-menu-styles",
      label: "สไตล์ในเมนู",
      desc: "จัดการการ์ดสไตล์ในเมนูแบบเลื่อนลง (รูป ชื่อ ลิงก์ เพิ่ม/ลบ)",
      icon: LayoutGrid,
    },
    {
      href: "/admin/mega-menu-collections",
      label: "คอลเลกชันในเมนู",
      desc: "จัดการการ์ดคอลเลกชันในเมนูและส่วนแนะนำบนหน้าแรก",
      icon: FolderKanban,
    },
    {
      href: "/admin/customer-service",
      label: "บริการลูกค้า (บทความ)",
      desc: "จัดการข้อความทั้ง 9 หัวข้อในเมนูบริการลูกค้า — แก้ไขแยกอิสระ ไม่มีอัปโหลดรูป",
      icon: Headphones,
    },
    {
      href: "/admin/kyc",
      label: "KYC Audit",
      desc: "Digital/AI auto-KYC — audit & override only",
      icon: ShieldCheck,
    },
    {
      href: "/admin/commissions",
      label: "ส่วนแบ่งรายได้",
      desc: "ผู้เขียนแบบ 70% / แพลตฟอร์ม 30% — ดูยอดขายและส่วนแบ่ง",
      icon: Percent,
    },
    {
      href: "/admin/payouts",
      label: "โอนเงินผู้ขาย",
      desc: "คิวโอน · ส่งออก CSV · บันทึกโอนแล้ว (mark paid)",
      icon: Banknote,
    },
    {
      href: "/admin/ranking",
      label: "Smart Ranking",
      desc: "น้ำหนักคะแนน ความสดใหม่ และปักหมุดหน้าแรก",
      icon: TrendingUp,
    },
    {
      href: "/admin/popular",
      label: "แบบบ้านยอดนิยม",
      desc: "การ์ดหัวข้อบนหน้าแรก (สูงสุด 4 ใบ) — รูป หัวข้อ รายละเอียด ลิงก์",
      icon: Flame,
    },
    {
      href: "/admin/brand",
      label: "แบรนด์และส่วนหัว",
      desc: "ชื่อเว็บไซต์ โลโก้ และเมนูนำทาง",
      icon: Palette,
    },
    {
      href: "/admin/content",
      label: "เนื้อหาและ UI",
      desc: "ข้อความ Hero แบนเนอร์ และปุ่ม CTA",
      icon: FileText,
    },
    {
      href: "/admin/gallery",
      label: "สไตล์แนะนำ",
      desc: "รูปภาพและคำบรรยายในแกลเลอรี",
      icon: Images,
    },
    {
      href: "/admin/footer",
      label: "ส่วนท้ายเว็บ",
      desc: "ข้อมูลติดต่อ โซเชียล และองค์กร",
      icon: PanelBottom,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="แดชบอร์ด"
        description={`ยินดีต้อนรับ ${admin.name ?? admin.email} — จัดการแพลตฟอร์มออกแบบคอนเซปต์บ้านด้วย AI`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">ชื่อเว็บไซต์</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{settings.brand.name}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">อีเมลติดต่อ</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{settings.footer.contactEmail}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">บทบาทของคุณ</p>
          <p className="mt-1 text-lg font-semibold capitalize text-slate-900">{admin.role}</p>
        </AdminCard>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        ทางลัด
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
          >
            <Icon className="mb-3 h-5 w-5 text-indigo-600" />
            <p className="font-semibold text-slate-900 group-hover:text-indigo-700">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ExternalLink className="h-4 w-4" />
          เปิดดูเว็บไซต์สาธารณะ
        </Link>
      </div>
    </div>
  );
}
