import type { Locale } from "@/lib/geo/countries";

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  sections: LegalSection[];
}

type LegalContentMap = Record<Locale, LegalDocument>;

export const PRIVACY_CONTENT: LegalContentMap = {
  en: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Overview",
        body: "Planasia (“we”, “us”) provides AI-assisted architectural design tools and a digital house-plan store. This policy explains what data we collect, why we use it, and your choices.",
      },
      {
        heading: "Data we collect",
        body: "We may collect: account information from Google Sign-In (name, email, profile image); project inputs you enter in the workspace (location, building specs, uploads); browser identifiers stored locally for store privacy filtering; payment metadata processed by Stripe or PromptPay (we do not store full card numbers); and technical logs (IP address, user agent) for security and rate limiting.",
      },
      {
        heading: "How we use data",
        body: "We use your data to generate design previews and plan documents, process purchases, validate permit compliance against our rule catalog, improve service reliability, prevent abuse, and communicate about your orders.",
      },
      {
        heading: "Uploads & AI processing",
        body: "Files you upload (site plans, elevations, floor plans) are processed to produce renders and documentation. When configured, Google Gemini may process prompts and images. Do not upload documents containing third-party personal data without consent.",
      },
      {
        heading: "Sharing",
        body: "We share data with payment processors (Stripe), authentication providers (Google), and cloud/AI providers strictly to deliver the service. We do not sell personal data. Store listings you publish may display anonymized design metadata.",
      },
      {
        heading: "Retention & contact",
        body: "Project drafts may be stored locally in your browser and optionally on our servers. You may request deletion of account-linked data by emailing hello@planasia.com. We may update this policy; continued use after changes constitutes acceptance.",
      },
    ],
  },
  th: {
    title: "นโยบายความเป็นส่วนตัว",
    sections: [
      {
        heading: "ภาพรวม",
        body: "Planasia (“เรา”) ให้บริการเครื่องมือออกแบบสถาปัตยกรรมด้วย AI และร้านแบบบ้านดิจิทัล นโยบายนี้อธิบายข้อมูลที่เราเก็บ วัตถุประสงค์ และทางเลือกของคุณ",
      },
      {
        heading: "ข้อมูลที่เก็บ",
        body: "เราอาจเก็บ: ข้อมูลบัญชีจาก Google Sign-In (ชื่อ อีเมล รูปโปรไฟล์); ข้อมูลโครงการใน workspace (ที่ตั้ง สเปกอาคาร ไฟล์อัปโหลด); ตัวระบุเบราว์เซอร์สำหรับกรองความเป็นส่วนตัวใน Store; ข้อมูลการชำระเงินผ่าน Stripe/PromptPay (เราไม่เก็บเลขบัตรเต็ม); และบันทึกทางเทคนิค (IP, user agent) เพื่อความปลอดภัย",
      },
      {
        heading: "การใช้ข้อมูล",
        body: "เราใช้ข้อมูลเพื่อสร้างภาพตัวอย่างและเอกสารแบบ ประมวลผลการซื้อ ตรวจสอบกฎขออนุญาต ปรับปรุงระบบ ป้องกันการใช้งานในทางที่ผิด และแจ้งสถานะคำสั่งซื้อ",
      },
      {
        heading: "ไฟล์อัปโหลด & AI",
        body: "ไฟล์ที่คุณอัปโหลดจะถูกประมวลผลเพื่อสร้างภาพและเอกสาร หากเปิดใช้ Google Gemini อาจประมวลผล prompt และรูปภาพ อย่าอัปโหลดข้อมูลส่วนบุคคลของบุคคลที่สามโดยไม่ได้รับความยินยอม",
      },
      {
        heading: "การเปิดเผย",
        body: "เราเปิดเผยข้อมูลกับผู้ให้บริการชำระเงิน (Stripe) การยืนยันตัวตน (Google) และผู้ให้บริการ AI/คลาวด์ เท่าที่จำเป็นต่อการให้บริการ เราไม่ขายข้อมูลส่วนบุคคล",
      },
      {
        heading: "การเก็บรักษา & ติดต่อ",
        body: "แบบร่างอาจเก็บในเบราว์เซอร์และเซิร์ฟเวอร์ของเรา คุณสามารถขอลบข้อมูลที่เชื่อมกับบัญชีได้ที่ hello@planasia.com เราอาจปรับนโยบายนี้เป็นระยะ",
      },
    ],
  },
  hi: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Overview",
        body: "Planasia provides AI-assisted architectural design and a house-plan store. This policy describes what we collect and how we use it.",
      },
      {
        heading: "Data we collect",
        body: "Account info from Google Sign-In, project inputs, browser IDs for store privacy, payment metadata via Stripe/PromptPay, and security logs including IP address.",
      },
      {
        heading: "How we use data",
        body: "To generate designs, process purchases, validate permit rules, maintain security, and support customers.",
      },
      {
        heading: "Uploads & AI",
        body: "Uploaded plans are processed for renders and documents. Gemini may process content when enabled. Do not upload others' personal data without consent.",
      },
      {
        heading: "Sharing",
        body: "We share data with payment, auth, and AI providers as needed. We do not sell personal data.",
      },
      {
        heading: "Contact",
        body: "Request deletion at hello@planasia.com. We may update this policy periodically.",
      },
    ],
  },
  vi: {
    title: "Chính sách bảo mật",
    sections: [
      {
        heading: "Tổng quan",
        body: "Planasia cung cấp công cụ thiết kế kiến trúc AI và cửa hàng bản vẽ nhà. Chính sách này mô tả dữ liệu chúng tôi thu thập và cách sử dụng.",
      },
      {
        heading: "Dữ liệu thu thập",
        body: "Thông tin tài khoản Google, dữ liệu dự án, mã trình duyệt cho quyền riêng tư Store, metadata thanh toán qua Stripe/PromptPay, và nhật ký bảo mật.",
      },
      {
        heading: "Mục đích sử dụng",
        body: "Tạo bản xem trước, xử lý mua hàng, kiểm tra quy tắc cấp phép, bảo mật và hỗ trợ khách hàng.",
      },
      {
        heading: "Tải lên & AI",
        body: "Tệp tải lên được xử lý để tạo hình ảnh và tài liệu. Gemini có thể xử lý khi được bật. Không tải dữ liệu cá nhân của người khác mà không có đồng ý.",
      },
      {
        heading: "Chia sẻ",
        body: "Chia sẻ với nhà cung cấp thanh toán, xác thực và AI khi cần. Chúng tôi không bán dữ liệu cá nhân.",
      },
      {
        heading: "Liên hệ",
        body: "Yêu cầu xóa dữ liệu tại hello@planasia.com. Chúng tôi có thể cập nhật chính sách định kỳ.",
      },
    ],
  },
};

export const TERMS_CONTENT: LegalContentMap = {
  en: {
    title: "Terms of Service",
    sections: [
      {
        heading: "Acceptance",
        body: "By using Planasia (website, workspace, store, or downloads), you agree to these Terms. If you do not agree, do not use the service.",
      },
      {
        heading: "Service description",
        body: "Planasia provides AI-generated architectural concepts, permit-oriented rule checks, and digital plan purchases. Outputs are design aids — final permit approval remains with local authorities and licensed professionals.",
      },
      {
        heading: "Accounts & acceptable use",
        body: "You are responsible for your account activity. Do not abuse APIs, attempt to bypass rate limits, upload unlawful content, or infringe intellectual property. We may suspend access for violations.",
      },
      {
        heading: "Purchases & licenses",
        body: "Store and custom plan fees are shown at checkout. PDF/CAD downloads grant a license for your construction project unless otherwise stated. Prices and bundles may change; completed purchases are honored at the paid rate.",
      },
      {
        heading: "Disclaimer",
        body: "Plans and AI outputs are provided “as is” without warranty of fitness for a particular site. You must verify structural, MEP, and code compliance with qualified engineers before construction or permit submission.",
      },
      {
        heading: "Limitation & governing law",
        body: "Planasia’s liability is limited to fees paid for the affected order in the prior 12 months. These Terms are governed by the laws of Thailand unless mandatory local consumer laws apply. Contact: hello@planasia.com",
      },
    ],
  },
  th: {
    title: "ข้อกำหนดการใช้งาน",
    sections: [
      {
        heading: "การยอมรับ",
        body: "การใช้ Planasia (เว็บไซต์ workspace ร้านค้า หรือดาวน์โหลด) ถือว่าคุณยอมรับข้อกำหนดนี้ หากไม่ยอมรับ กรุณาหยุดใช้บริการ",
      },
      {
        heading: "บริการ",
        body: "Planasia ให้บริการแนวคิดออกแบบด้วย AI ตรวจสอบกฎขออนุญาตเบื้องต้น และจำหน่ายแบบดิจิทัล ผลลัพธ์เป็นเครื่องมือช่วยออกแบบ — การอนุญาตจริงขึ้นกับหน่วยงานท้องถิ่นและผู้เชี่ยวชาญ",
      },
      {
        heading: "บัญชี & การใช้งาน",
        body: "คุณรับผิดชอบกิจกรรมในบัญชีของคุณ ห้ามใช้บริการในทางที่ผิด หลีกเลี่ยง rate limit อัปโหลดเนื้อหาผิดกฎหมาย หรือละเมิดทรัพย์สินทางปัญญา เราอาจระงับการเข้าถึงเมื่อมีการละเมิด",
      },
      {
        heading: "การซื้อ & สิทธิ์ใช้งาน",
        body: "ราคาแสดงที่หน้าชำระเงิน การดาวน์โหลด PDF/CAD ให้สิทธิ์ใช้งานสำหรับโครงการก่อสร้างของคุณ เว้นแต่ระบุ otherwise ราคาอาจเปลี่ยนแปลง การซื้อที่เสร็จสิ้นแล้วใช้ราคาที่ชำระจริง",
      },
      {
        heading: "ข้อจำกัดความรับผิด",
        body: "แบบและผลลัพธ์ AI ให้ “ตามสภาพ” คุณต้องตรวจสอบโครงสร้าง ระบบ MEP และกฎท้องถิ่นกับวิศวกรที่มีใบอนุญาตก่อนก่อสร้างหรือยื่นอนุญาต",
      },
      {
        heading: "กฎหมาย & ติดต่อ",
        body: "ความรับผิดของ Planasia จำกัดไม่เกินค่าธรรมเนียมที่ชำระสำหรับคำสั่งซื้อที่เกี่ยวข้องใน 12 เดือนที่ผ่านมา อยู่ภายใต้กฎหมายไทย เว้นแต่กฎคุ้มครองผู้บริโภคท้องถิ่นจะบังคับ ติดต่อ hello@planasia.com",
      },
    ],
  },
  hi: {
    title: "Terms of Service",
    sections: [
      {
        heading: "Acceptance",
        body: "Using Planasia means you accept these Terms.",
      },
      {
        heading: "Service",
        body: "AI design aids and digital plans — not a substitute for licensed professional approval.",
      },
      {
        heading: "Use",
        body: "Do not abuse the service, bypass limits, or upload unlawful content.",
      },
      {
        heading: "Purchases",
        body: "Fees shown at checkout. Downloads licensed for your project.",
      },
      {
        heading: "Disclaimer",
        body: "Verify all code and structural requirements locally before building.",
      },
      {
        heading: "Contact",
        body: "hello@planasia.com — governed by laws of Thailand where applicable.",
      },
    ],
  },
  vi: {
    title: "Điều khoản dịch vụ",
    sections: [
      {
        heading: "Chấp nhận",
        body: "Sử dụng Planasia đồng nghĩa bạn chấp nhận các điều khoản này.",
      },
      {
        heading: "Dịch vụ",
        body: "Công cụ thiết kế AI và bản vẽ số — không thay thế phê duyệt chuyên gia có giấy phép.",
      },
      {
        heading: "Sử dụng",
        body: "Không lạm dụng dịch vụ, vượt giới hạn, hoặc tải nội dung trái phép.",
      },
      {
        heading: "Mua hàng",
        body: "Phí hiển thị khi thanh toán. Tải xuống được cấp phép cho dự án của bạn.",
      },
      {
        heading: "Tuyên bố miễn trừ",
        body: "Xác minh quy chuẩn và kết cấu tại địa phương trước khi thi công.",
      },
      {
        heading: "Liên hệ",
        body: "hello@planasia.com — áp dụng luật Thái Lan khi phù hợp.",
      },
    ],
  },
};
