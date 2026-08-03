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

/**
 * Policy 2 — Privacy Policy
 * Structured for marketplace + payment-gateway review (PDPA-aligned, Thai domestic).
 */
export const PRIVACY_CONTENT: LegalContentMap = {
  en: {
    title: "2. Privacy Policy",
    sections: [
      {
        heading: "2.1 Introduction and controller",
        body: "Planasia (“we”, “us”, “our”) operates a digital marketplace for house-plan PDF files and related online services. We respect your privacy and are committed to protecting personal data. This Privacy Policy explains what information we collect, how we use and safeguard it, and the choices available to you when you visit our website, create an account, or purchase digital products. For the purposes of applicable Thai personal-data protection law (including the Personal Data Protection Act B.E. 2562), Planasia is the data controller of personal data processed in connection with this platform. Contact: hello@planasia.com.",
      },
      {
        heading: "2.2 Information we collect",
        body: "We collect only personal data that is necessary to operate the marketplace, process orders, and deliver digital PDF house plans. Categories include: (a) Contact and identity data — full name and email address, used to send download links, receipts, and order communications; (b) Account data — if you sign in (for example via Google Sign-In), we may receive your name, email, and profile image from the identity provider; (c) Transaction and order data — order identifiers, purchased listing/plan references, amounts, currency, payment status, selected add-ons, and timestamps; (d) Payment data — card numbers, PromptPay credentials, and bank passwords are entered and processed by our PCI-compliant payment gateway / payment processor (currently Stripe, including PromptPay where available). We do not store full payment-card numbers, CVV/CVC codes, or bank login credentials on our servers. We may retain limited payment metadata returned by the gateway (such as payment intent or session IDs, last four digits where provided, payment method type, and success/failure status) for reconciliation, fraud prevention, and accounting; (e) Technical and security data — IP address, browser/user-agent, device type, approximate location derived from IP where applicable, cookies or similar identifiers, and server logs used for security, rate limiting, and diagnostics; (f) Support communications — messages and attachments you send to customer support regarding orders or technical issues.",
      },
      {
        heading: "2.3 How we use your information",
        body: "We use personal data solely for legitimate business purposes related to the service, including: to process and fulfil orders and deliver PDF download access; to send order confirmations, receipts, and download links; to provide customer service, status updates, and technical troubleshooting; to authenticate users, prevent fraud, abuse, and unauthorized access; to maintain accounting, tax, and regulatory records as required by law; to improve reliability and security of the website; and to communicate important service or policy changes. We do not use your payment-card data for marketing. Where we rely on consent (for example optional marketing, if offered), you may withdraw consent at any time without affecting the lawfulness of prior processing.",
      },
      {
        heading: "2.4 Legal bases for processing",
        body: "Depending on the activity, we process personal data because: (a) processing is necessary to perform a contract with you (checkout, payment confirmation, and digital delivery); (b) processing is necessary to comply with legal obligations (tax, accounting, dispute, or law-enforcement requests); (c) processing is necessary for our legitimate interests in securing the platform, preventing fraud, and improving service quality, balanced against your rights; and/or (d) you have given consent where required. If you do not provide data marked as required at checkout (such as name and email), we may be unable to complete your purchase or deliver download links.",
      },
      {
        heading: "2.5 Data security",
        body: "We implement industry-standard technical and organizational measures designed to protect personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encrypted transport (HTTPS/TLS), access controls on production systems, use of reputable cloud infrastructure, and routing of card/PromptPay payments through a certified payment gateway so sensitive payment credentials are not stored on Planasia servers. No method of transmission or storage is completely secure; if we become aware of a personal-data breach affecting you, we will take steps required under applicable law, which may include notification to regulators and affected individuals where mandated.",
      },
      {
        heading: "2.6 Third-party disclosure and processors",
        body: "We do not sell, rent, or trade your personal data. We disclose personal data only to service providers that process data on our behalf or as necessary to complete a transaction, under appropriate contractual and security expectations, including: payment gateways / processors (e.g. Stripe) to authorize and settle payments; hosting, database, and storage providers that host the website and order records; email delivery providers used to send receipts and download links; authentication providers if you use social or SSO login; and analytics or security tooling strictly as needed to operate and protect the service. These parties may process data only for the purposes we specify (or as required by their role as independent controllers for payment compliance). We may also disclose data when required by law, court order, or to protect the rights, property, or safety of Planasia, our users, or the public.",
      },
      {
        heading: "2.7 International transfers",
        body: "Our infrastructure and payment partners may process data in countries other than Thailand (for example where Stripe or cloud hosting operates). Where personal data is transferred outside Thailand, we take steps consistent with applicable law so that an adequate level of protection is maintained, such as contractual safeguards with processors and reliance on their compliance programs.",
      },
      {
        heading: "2.8 Retention",
        body: "We retain personal data only for as long as necessary for the purposes described in this policy: order and payment records for the period required by tax, accounting, and consumer laws and to handle refunds or disputes; account data for the life of the account plus a reasonable wind-down period; technical logs for a limited period for security and diagnostics; and support correspondence for as long as needed to resolve issues and meet legal obligations. When data is no longer required, we delete or anonymize it where reasonably practicable.",
      },
      {
        heading: "2.9 Your rights",
        body: "Subject to applicable Thai personal-data protection law, you may have the right to request access to your personal data, rectification of inaccurate data, deletion or restriction of processing in certain cases, objection to certain processing, and withdrawal of consent where processing is consent-based. To exercise these rights, email hello@planasia.com with sufficient detail to verify your identity and locate your records. We will respond within the timeframes required by law. You may also lodge a complaint with the competent Thai data-protection authority if you believe your rights have been infringed.",
      },
      {
        heading: "2.10 Cookies and similar technologies",
        body: "We use cookies and similar technologies that are necessary for session management, security, language/preferences, and cart or checkout continuity. We may also use limited analytics cookies to understand aggregate traffic. You can control cookies through your browser settings; disabling certain cookies may affect login, cart, or checkout functionality.",
      },
      {
        heading: "2.11 Children’s privacy",
        body: "The service is directed to adults purchasing architectural plans for construction or design use. We do not knowingly collect personal data from children under 20 years of age (or the applicable age of majority). If you believe a child has provided personal data to us, contact hello@planasia.com and we will take appropriate steps to delete it.",
      },
      {
        heading: "2.12 Changes to this policy",
        body: "We may update this Privacy Policy from time to time to reflect operational, legal, or payment-partner requirements. The “Last updated” date on this page will be revised when material changes are published. Continued use of the website after an update constitutes acceptance of the revised policy to the extent permitted by law. For material changes affecting your rights, we may provide additional notice (for example by email or a website notice).",
      },
      {
        heading: "2.13 Contact",
        body: "Privacy and data requests: hello@planasia.com. Business hours and additional contact channels may be published on our website. Please include your order reference where the request relates to a purchase.",
      },
    ],
  },
  th: {
    title: "2. นโยบายความเป็นส่วนตัว (Privacy Policy)",
    sections: [
      {
        heading: "2.1 บทนำและผู้ควบคุมข้อมูล",
        body: "Planasia (“เรา”) ให้บริการแพลตฟอร์มตลาดกลางสำหรับจำหน่ายไฟล์แบบบ้านดิจิทัลในรูปแบบ PDF และบริการออนไลน์ที่เกี่ยวข้อง เราให้ความสำคัญอย่างยิ่งต่อความเป็นส่วนตัวและความปลอดภัยของข้อมูลท่าน นโยบายความเป็นส่วนตัวฉบับนี้อธิบายถึงวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของท่านเมื่อใช้งานเว็บไซต์ สร้างบัญชี หรือสั่งซื้อสินค้าดิจิทัล ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 และกฎหมายที่เกี่ยวข้อง Planasia เป็นผู้ควบคุมข้อมูลส่วนบุคคลที่ประมวลผลบนแพลตฟอร์มนี้ ติดต่อ: hello@planasia.com",
      },
      {
        heading: "2.2 ข้อมูลที่เราจัดเก็บ (Information We Collect)",
        body: "เราจัดเก็บเฉพาะข้อมูลที่จำเป็นสำหรับการดำเนินงานตลาดกลาง การประมวลผลคำสั่งซื้อ และการจัดส่งสินค้าดิจิทัล (ไฟล์ PDF) ซึ่งรวมถึง: (ก) ข้อมูลการติดต่อและระบุตัวตน — ชื่อ-นามสกุล และที่อยู่อีเมล เพื่อจัดส่งลิงก์ดาวน์โหลด ใบเสร็จ และการสื่อสารเกี่ยวกับคำสั่งซื้อ (ข) ข้อมูลบัญชี — หากท่านเข้าสู่ระบบ (เช่น ผ่าน Google Sign-In) เราอาจได้รับชื่อ อีเมล และรูปโปรไฟล์จากผู้ให้บริการยืนยันตัวตน (ค) ข้อมูลธุรกรรมและคำสั่งซื้อ — รหัสคำสั่งซื้อ อ้างอิงแบบบ้าน/รายการสินค้า จำนวนเงิน สกุลเงิน สถานะการชำระเงิน แพ็กเกจเสริม และวันเวลาทำรายการ (ง) ข้อมูลการชำระเงิน — หมายเลขบัตรเครดิต/เดบิต ข้อมูลพร้อมเพย์ และรหัสผ่านธนาคาร จะถูกกรอกและประมวลผลผ่านระบบ Payment Gateway / ผู้ให้บริการชำระเงินที่ได้มาตรฐาน PCI (ปัจจุบันคือ Stripe รวมถึง PromptPay ตามที่มี) โดยเราไม่มีการจัดเก็บหมายเลขบัตรเต็ม รหัส CVV/CVC หรือรหัสผ่านธนาคารของท่านไว้บนเซิร์ฟเวอร์ของเรา เราอาจเก็บเฉพาะข้อมูลเมตาที่เกตเวย์ส่งกลับ (เช่น รหัสเซสชัน/เจตนาชำระเงิน เลขท้ายบัตรหากมี ประเภทวิธีชำระเงิน และสถานะสำเร็จ/ล้มเหลว) เพื่อกระทบยอด ป้องกันการฉ้อโกง และบัญชี (จ) ข้อมูลทางเทคนิคและความปลอดภัย — ที่อยู่ IP เบราว์เซอร์/user-agent ประเภทอุปกรณ์ ตำแหน่งโดยประมาณจาก IP (หากมี) คุกกี้หรือตัวระบุที่คล้ายกัน และบันทึกเซิร์ฟเวอร์ เพื่อความปลอดภัย การจำกัดอัตราการใช้ และการวินิจฉัยระบบ (ฉ) การติดต่อฝ่ายสนับสนุน — ข้อความและไฟล์แนบที่ท่านส่งเกี่ยวกับคำสั่งซื้อหรือปัญหาทางเทคนิค",
      },
      {
        heading: "2.3 การนำข้อมูลไปใช้ (How We Use Your Information)",
        body: "ข้อมูลที่เก็บรวบรวมจะถูกนำไปใช้เพื่อวัตถุประสงค์ดังต่อไปนี้เท่านั้น: เพื่อดำเนินการคำสั่งซื้อและจัดส่งสิทธิ์ดาวน์โหลดไฟล์ PDF แบบบ้านให้แก่ท่าน เพื่อส่งการยืนยันคำสั่งซื้อ ใบเสร็จ และลิงก์ดาวน์โหลด เพื่อการบริการลูกค้า การแจ้งเตือนสถานะคำสั่งซื้อ หรือการแก้ไขปัญหาทางเทคนิค เพื่อยืนยันตัวตนผู้ใช้ ป้องกันการฉ้อโกง การใช้งานในทางที่ผิด และการเข้าถึงโดยไม่ได้รับอนุญาต เพื่อปฏิบัติตามกฎหมายและข้อบังคับทางบัญชีหรือภาษีที่เกี่ยวข้อง เพื่อรักษาความน่าเชื่อถือและความปลอดภัยของเว็บไซต์ และเพื่อแจ้งการเปลี่ยนแปลงบริการหรือนโยบายที่สำคัญ เราไม่ใช้ข้อมูลบัตรของท่านเพื่อการตลาด หากมีการขอความยินยอม (เช่น การตลาดทางเลือก หากมี) ท่านสามารถถอนความยินยอมได้ทุกเมื่อ โดยไม่กระทบความชอบด้วยกฎหมายของการประมวลผลที่ได้ทำไปแล้ว",
      },
      {
        heading: "2.4 ฐานทางกฎหมายในการประมวลผล",
        body: "เราประมวลผลข้อมูลส่วนบุคคลตามฐานทางกฎหมายที่เกี่ยวข้อง ได้แก่: (ก) ความจำเป็นเพื่อการปฏิบัติตามสัญญา (การชำระเงิน การยืนยันคำสั่งซื้อ และการจัดส่งดิจิทัล) (ข) ความจำเป็นเพื่อปฏิบัติตามหน้าที่ตามกฎหมาย (ภาษี บัญชี ข้อพิพาท หรือคำสั่งของหน่วยงาน) (ค) ความจำเป็นเพื่อประโยชน์โดยชอบด้วยกฎหมายของเราในการรักษาความปลอดภัย ป้องกันการฉ้อโกง และปรับปรุงคุณภาพบริการ โดยคำนึงถึงสิทธิของท่าน และ/หรือ (ง) ความยินยอมของท่านในกรณีที่กฎหมายกำหนด หากท่านไม่ให้ข้อมูลที่จำเป็นในขั้นตอนชำระเงิน (เช่น ชื่อและอีเมล) เราอาจไม่สามารถดำเนินการสั่งซื้อหรือจัดส่งลิงก์ดาวน์โหลดได้",
      },
      {
        heading: "2.5 ความปลอดภัยของข้อมูล (Data Security)",
        body: "เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและองค์กรที่ได้มาตรฐานสากล เพื่อปกป้องข้อมูลส่วนบุคคลของท่านจากการเข้าถึง การเปลี่ยนแปลง หรือการเปิดเผยโดยไม่ได้รับอนุญาต รวมถึงการเข้ารหัสการสื่อสาร (HTTPS/TLS) การควบคุมการเข้าถึงระบบผลิต การใช้โครงสร้างคลาวด์ที่น่าเชื่อถือ และการส่งผ่านการชำระเงินด้วยบัตร/พร้อมเพย์ไปยัง Payment Gateway ที่ได้รับการรับรอง เพื่อไม่ให้ข้อมูลรับรองการชำระเงินที่ละเอียดอ่อนถูกจัดเก็บบนเซิร์ฟเวอร์ของ Planasia ไม่มีระบบใดปลอดภัยสมบูรณ์ หากเราทราบถึงเหตุละเมิดข้อมูลส่วนบุคคลที่กระทบท่าน เราจะดำเนินการตามที่กฎหมายกำหนด ซึ่งอาจรวมถึงการแจ้งหน่วยงานและผู้ได้รับผลกระทบเมื่อมีหน้าที่ต้องทำ",
      },
      {
        heading: "2.6 การเปิดเผยข้อมูลแก่บุคคลภายนอก (Third-Party Disclosure)",
        body: "เราไม่มีนโยบายขาย แลกเปลี่ยน หรือโอนย้ายข้อมูลส่วนบุคคลของท่านไปยังบุคคลภายนอกเพื่อผลประโยชน์ทางการค้า เราเปิดเผยข้อมูลเฉพาะแก่ผู้ให้บริการโครงสร้างพื้นฐานที่จำเป็นต่อการดำเนินงานภายใต้ข้อตกลงและความคาดหวังด้านความปลอดภัยที่เหมาะสม ได้แก่ ระบบชำระเงินออนไลน์ (Payment Gateway เช่น Stripe) เพื่อให้ธุรกรรมสำเร็จ ผู้ให้บริการโฮสติ้ง ฐานข้อมูล และที่เก็บไฟล์ ผู้ให้บริการส่งอีเมลสำหรับใบเสร็จและลิงก์ดาวน์โหลด ผู้ให้บริการยืนยันตัวตนหากท่านใช้การเข้าสู่ระบบผ่านบัญชีภายนอก และเครื่องมือวิเคราะห์หรือความปลอดภัยเท่าที่จำเป็นต่อการดำเนินงานและปกป้องบริการ บุคคลเหล่านี้ประมวลผลข้อมูลเพื่อวัตถุประสงค์ที่เรากำหนด (หรือในฐานะผู้ควบคุมข้อมูลอิสระตามหน้าที่ด้านการชำระเงิน) นอกจากนี้เราอาจเปิดเผยข้อมูลเมื่อกฎหมายหรือคำสั่งศาลกำหนด หรือเพื่อปกป้องสิทธิ ทรัพย์สิน หรือความปลอดภัยของ Planasia ผู้ใช้ หรือสาธารณะ",
      },
      {
        heading: "2.7 การโอนข้อมูลไปต่างประเทศ",
        body: "โครงสร้างพื้นฐานและพันธมิตรด้านการชำระเงินของเราอาจประมวลผลข้อมูลในประเทศอื่นนอกประเทศไทย (เช่น ที่ Stripe หรือผู้ให้บริการคลาวด์ดำเนินการ) เมื่อมีการโอนข้อมูลส่วนบุคคลออกนอกประเทศไทย เราจะดำเนินการให้สอดคล้องกับกฎหมายที่ใช้บังคับ เพื่อรักษาระดับการคุ้มครองที่เหมาะสม เช่น ข้อสัญญากับผู้ประมวลผล และการอาศัยโปรแกรมการปฏิบัติตามกฎของพันธมิตร",
      },
      {
        heading: "2.8 ระยะเวลาการเก็บรักษา",
        body: "เราเก็บรักษาข้อมูลส่วนบุคคลเท่าที่จำเป็นตามวัตถุประสงค์ในนโยบายนี้ ได้แก่ บันทึกคำสั่งซื้อและการชำระเงินตามระยะเวลาที่กฎหมายภาษี บัญชี และผู้บริโภคกำหนด รวมถึงเพื่อจัดการคืนเงินหรือข้อพิพาท ข้อมูลบัญชีตลอดอายุบัญชีบวกช่วงเวลาปิดบัญชีที่สมเหตุสมผล บันทึกทางเทคนิคในระยะเวลาจำกัดเพื่อความปลอดภัย และการติดต่อฝ่ายสนับสนุนเท่าที่จำเป็นต่อการแก้ไขปัญหาและหน้าที่ตามกฎหมาย เมื่อไม่จำเป็นแล้ว เราจะลบหรือทำให้ไม่สามารถระบุตัวตนได้ตามสมควร",
      },
      {
        heading: "2.9 สิทธิของเจ้าของข้อมูล",
        body: "ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล ท่านอาจมีสิทธิขอเข้าถึง แก้ไข ลบ หรือจำกัดการประมวลผล คัดค้านการประมวลผลในบางกรณี และถอนความยินยอมเมื่อการประมวลผลอาศัยความยินยอม ท่านสามารถใช้สิทธิได้โดยส่งอีเมลถึง hello@planasia.com พร้อมรายละเอียดที่เพียงพอต่อการยืนยันตัวตนและค้นหาข้อมูล เราจะตอบภายในระยะเวลาที่กฎหมายกำหนด ท่านอาจร้องเรียนต่อหน่วยงานคุ้มครองข้อมูลส่วนบุคคลที่มีอำนาจหากเห็นว่าสิทธิของท่านถูกละเมิด",
      },
      {
        heading: "2.10 คุกกี้และเทคโนโลยีที่คล้ายกัน",
        body: "เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันซึ่งจำเป็นต่อการจัดการเซสชัน ความปลอดภัย การตั้งค่าภาษา/ความชอบ และการทำงานของตะกร้าหรือการชำระเงิน อาจมีการใช้คุกกี้วิเคราะห์ในขอบเขตจำกัดเพื่อดูปริมาณการใช้งานโดยรวม ท่านควบคุมคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ได้ การปิดคุกกี้บางประเภทอาจกระทบการเข้าสู่ระบบ ตะกร้า หรือการชำระเงิน",
      },
      {
        heading: "2.11 ความเป็นส่วนตัวของเด็ก",
        body: "บริการมุ่งเน้นผู้ใหญ่ที่ซื้อแบบบ้านเพื่อการออกแบบหรือก่อสร้าง เราไม่เจตนาเก็บข้อมูลส่วนบุคคลจากผู้ที่มีอายุต่ำกว่า 20 ปี (หรืออายุบรรลุนิติภาวะตามที่กฎหมายกำหนด) หากท่านเชื่อว่าเด็กได้ให้ข้อมูลแก่เรา กรุณาติดต่อ hello@planasia.com เพื่อให้เราดำเนินการลบตามสมควร",
      },
      {
        heading: "2.12 การเปลี่ยนแปลงนโยบาย",
        body: "เราอาจปรับปรุงนโยบายความเป็นส่วนตัวเป็นครั้งคราว เพื่อสะท้อนการดำเนินงาน ข้อกฎหมาย หรือข้อกำหนดของพันธมิตรการชำระเงิน วันที่ “อัปเดตล่าสุด” บนหน้านี้จะถูกปรับเมื่อมีการเผยแพร่การเปลี่ยนแปลงที่สำคัญ การใช้เว็บไซต์ต่อไปหลังการอัปเดตถือว่ายอมรับนโยบายฉบับปรับปรุงในขอบเขตที่กฎหมายอนุญาต สำหรับการเปลี่ยนแปลงที่กระทบสิทธิของท่านอย่างมีนัยสำคัญ เราอาจแจ้งเพิ่มเติม (เช่น ทางอีเมลหรือประกาศบนเว็บไซต์)",
      },
      {
        heading: "2.13 ช่องทางติดต่อ",
        body: "เรื่องความเป็นส่วนตัวและคำขอเกี่ยวกับข้อมูล: hello@planasia.com เวลาทำการและช่องทางเพิ่มเติมอาจประกาศบนเว็บไซต์ หากเกี่ยวข้องกับการสั่งซื้อ กรุณาระบุเลขอ้างอิงคำสั่งซื้อด้วย",
      },
    ],
  },
  hi: {
    title: "2. Privacy Policy",
    sections: [
      {
        heading: "Summary",
        body: "Planasia collects name, email, order and limited payment metadata to fulfil digital PDF purchases. Card/PromptPay data is processed by Stripe; we do not store full card numbers. We do not sell personal data. Contact hello@planasia.com for access or deletion requests under applicable law.",
      },
    ],
  },
  vi: {
    title: "2. Chính sách bảo mật",
    sections: [
      {
        heading: "Tóm tắt",
        body: "Planasia thu thập họ tên, email, dữ liệu đơn hàng và metadata thanh toán giới hạn để giao PDF. Dữ liệu thẻ/PromptPay do Stripe xử lý; chúng tôi không lưu số thẻ đầy đủ. Không bán dữ liệu cá nhân. Liên hệ hello@planasia.com để yêu cầu truy cập hoặc xóa theo luật áp dụng.",
      },
    ],
  },
};

/**
 * Policy 3 — Terms of Service
 * Marketplace intermediary terms for digital PDF house-plan sales (Thai domestic).
 */
export const TERMS_CONTENT: LegalContentMap = {
  en: {
    title: "3. Terms of Service",
    sections: [
      {
        heading: "3.1 Acceptance of terms",
        body: "Welcome to Planasia. By accessing this website, purchasing products, or downloading house-plan PDF files from this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service in full. If you do not agree, you must not use the website or complete a purchase. These Terms operate together with our Privacy Policy, Return Policy, Construction Requirements, and Delivery Policy. At checkout you must actively confirm (checkbox) that you understand our Construction License and return rules before payment is processed.",
      },
      {
        heading: "3.2 Platform role",
        body: "Planasia operates a digital marketplace that facilitates the sale and delivery of house-plan PDF files and related digital add-ons between independent designers (or rights holders) and buyers. Except where we expressly state otherwise, we act as an intermediary and technology platform; we are not the builder, contractor, or licensed engineer for your project, and we do not supervise on-site construction.",
      },
      {
        heading: "3.3 Copyright information",
        body: "When you purchase a house plan from Plan Asia, you are purchasing a Construction License. This license grants you the right to build one (1) house from these plans. Building more than one house, modifying, or copying without prior written permission is a violation of this copyright.",
      },
      {
        heading: "3.4 Construction requirements and building codes",
        body: "Purchased plans are intended to follow general design principles and commonly accepted international practice, but may not cover every planning law, zoning rule, or local requirement where you build. It is the buyer’s and/or contractor’s responsibility to ensure the structure is built to comply with building-control laws and local requirements. The customer agrees to indemnify and hold harmless Plan Asia, its officers, employees, and agents from any claim, loss, or liability arising from a plan’s failure to meet local laws or regulations, or from any breach of agreement by the customer or the customer’s contractors in whole or in part. Because local rules and construction methods vary, certain systems (such as air-conditioning and actual plumbing layouts) may need to be adapted to your site and may not be included in our standard plans. You should meet a local contractor or engineer to select and plan systems appropriate for your area. Some municipalities may require review by a licensed local architect or structural engineer. After purchase, the customer is responsible for any additional costs incurred to meet local or other construction requirements. See also our Construction Requirements page.",
      },
      {
        heading: "3.5 Purchases, pricing, and digital delivery",
        body: "Prices are displayed at checkout in Thai Baht (THB) for our domestic marketplace phase. Payment is processed through our payment gateway partners (including Stripe). Upon successful payment confirmation, download rights for the applicable PDF files are unlocked as described in our Delivery Policy. Completed purchases are charged at the price shown at the time of payment. You agree to provide accurate buyer name and email so we can deliver download links and receipts. Because of copyright law and the risk of unauthorized copying, plans cannot be returned for credit or refund after an order is processed — see our Return Policy.",
      },
      {
        heading: "3.6 Digital goods acknowledgment (Stripe / chargeback clarity)",
        body: "You acknowledge that: (a) you are purchasing digital blueprint / house-plan files (and optional digital or hard-copy add-ons selected at checkout) under a Construction License for one house; (b) access is typically granted immediately after payment confirmation; and (c) after an order is processed, plans cannot be returned for credit or refund under any circumstances, as set out in the Return Policy. Unfounded chargebacks that contradict this acknowledgment may be contested with our payment processor using order, download, and consent records.",
      },
      {
        heading: "3.7 Customer support and building-permit guidance",
        body: "Planasia provides customer support and practical guidance to help buyers prepare for building-permit applications and understand how to use purchased plan files with local professionals. Support may include answering product questions, clarifying what is included in a listing, and directing buyers to next steps for permit readiness. Support and guidance do not replace licensed local architects, engineers, or permit authorities, and do not guarantee that any authority will approve a permit. Final permit approval remains subject to local law, site conditions, and professional certifications you obtain independently.",
      },
      {
        heading: "3.8 Limitation of liability",
        body: "The platform facilitates digital-file transactions between buyers and designers. Products and services on the website are provided on an “As Is” and “As Available” basis. To the maximum extent permitted by law, Planasia does not warrant that content, drawings, or PDF files are entirely free from error, complete for every site, or fit for a particular purpose. We will coordinate and investigate technical delivery issues in accordance with our Return Policy (redelivery support where appropriate). Except where liability cannot be limited under mandatory Thai consumer law, Planasia’s aggregate liability arising out of any order is limited to the fees actually paid to Planasia for that affected order. We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits or construction delay costs, even if advised of the possibility.",
      },
      {
        heading: "3.9 Acceptable use and accounts",
        body: "You are responsible for activity under your account and for keeping login credentials secure. You must not abuse the website or APIs, circumvent security or rate limits, upload unlawful content, infringe intellectual property, or use purchased files beyond the Construction License. We may suspend or terminate access for violations of these Terms or applicable law.",
      },
      {
        heading: "3.10 Changes to terms",
        body: "We reserve the right to update, amend, or replace these Terms of Service at any time. Material updates will be reflected by revising the “Last updated” notice on this page. Continued use of the website after changes are published constitutes acceptance of the revised Terms to the extent permitted by law. If you do not agree to the updated Terms, you must stop using the service.",
      },
      {
        heading: "3.11 Governing law and contact",
        body: "These Terms are governed by the laws of Thailand, without prejudice to any mandatory consumer-protection rights that cannot be waived. Disputes shall be subject to the competent courts of Thailand unless mandatory law requires otherwise. Contact: hello@planasia.com (or the contact channel published on our website).",
      },
    ],
  },
  th: {
    title: "3. ข้อกำหนดการให้บริการ (Terms of Service)",
    sections: [
      {
        heading: "3.1 การยอมรับข้อกำหนด",
        body: "ยินดีต้อนรับสู่แพลตฟอร์ม Planasia การเข้าใช้งานเว็บไซต์ การซื้อสินค้า หรือการดาวน์โหลดไฟล์ PDF แบบบ้านจากเว็บไซต์นี้ ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขการให้บริการฉบับนี้โดยสมบูรณ์ หากท่านไม่ยอมรับ กรุณาหยุดใช้บริการและอย่าทำการสั่งซื้อ ข้อกำหนดนี้อ่านประกอบกับนโยบายความเป็นส่วนตัว นโยบายการคืนสินค้า ข้อกำหนดด้านการก่อสร้าง และนโยบายการจัดส่งของเรา ในขั้นตอนชำระเงิน ท่านต้องยืนยันผ่านช่องทำเครื่องหมาย (checkbox) ว่าเข้าใจใบอนุญาตในการก่อสร้าง (Construction License) และนโยบายการคืนสินค้าก่อนชำระเงิน",
      },
      {
        heading: "3.2 บทบาทของแพลตฟอร์ม",
        body: "Planasia เป็นตลาดกลางดิจิทัลที่อำนวยความสะดวกด้านการซื้อขายและจัดส่งไฟล์แบบบ้าน PDF รวมถึงแพ็กเกจดิจิทัลที่เกี่ยวข้อง ระหว่างนักออกแบบอิสระ (หรือเจ้าของสิทธิ์) กับผู้ซื้อ เว้นแต่เราจะระบุเป็นอย่างอื่นโดยชัดเจน เราทำหน้าที่เป็นตัวกลางและแพลตฟอร์มเทคโนโลยี ไม่ใช่ผู้รับเหมาก่อสร้าง หรือวิศวกรที่มีใบอนุญาตสำหรับโครงการของท่าน และไม่ได้ควบคุมงานก่อสร้างหน้างาน",
      },
      {
        heading: "3.3 ข้อมูลลิขสิทธิ์",
        body: "เมื่อคุณซื้อแบบแปลนบ้านจาก Plan Asia คุณกำลังซื้อใบอนุญาตในการก่อสร้าง (Construction License) ใบอนุญาตนี้ให้สิทธิ์คุณในการสร้างบ้านหนึ่งหลังจากแบบแปลนเหล่านี้ การสร้างบ้านมากกว่าหนึ่งครั้ง ดัดแปลง หรือคัดลอกโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร ถือเป็นการละเมิดลิขสิทธิ์นี้",
      },
      {
        heading: "3.4 ข้อกำหนดด้านการก่อสร้างและรหัสอาคาร",
        body: "แบบแปลนที่ซื้อจะต้องเป็นไปตามหลักการออกแบบและมาตรฐานสากลทั่วไป แต่อาจไม่ครอบคลุมกฎหมายและข้อบังคับผังเมืองหรือข้อกำหนดท้องถิ่นในแต่ละพื้นที่ที่ลูกค้าจะทำการก่อสร้าง เป็นความรับผิดชอบของผู้ซื้อและ/หรือผู้รับเหมาที่จะต้องตรวจสอบให้แน่ใจว่าโครงสร้างนั้นสร้างขึ้นเพื่อให้เป็นไปตามกฎหมายควบคุมอาคารและข้อกำหนดของท้องถิ่นคุณ ลูกค้าตกลงที่จะชดใช้และปกป้องบริษัท Plan Asia, ผู้บริหาร, พนักงาน และตัวแทนของบริษัท จากการเรียกร้อง ความสูญเสีย หรือความรับผิดใด ๆ ที่เกิดจากความล้มเหลวของแบบแปลนในการปฏิบัติตามกฎหมายหรือข้อบังคับท้องถิ่น หรือจากการละเมิดข้อตกลงใด ๆ ที่มาจากลูกค้าหรือผู้รับเหมาของลูกค้าทั้งหมดหรือบางส่วน เนื่องจากข้อกำหนดและระเบียบข้อบังคับในท้องถิ่น รวมถึงวิธีการก่อสร้างที่แตกต่างกันไปในแต่ละพื้นที่ การวางแผนงานระบบบางอย่าง (เช่น ระบบปรับอากาศและระบบประปาจริง) อาจจำเป็นต้องปรับแผนให้เข้ากับพื้นที่ของคุณ ด้วยเหตุนี้ ระบบงานระบบดังกล่าวอาจไม่รวมอยู่ในแบบแปลนมาตรฐานของเรา คุณควรนัดพบกับผู้รับเหมาหรือวิศวกรท้องถิ่นเพื่อเลือกและวางแผนระบบที่เหมาะสมที่สุดสำหรับพื้นที่ของคุณ เทศบาลหรือหน่วยงานท้องถิ่นบางแห่งอาจกำหนดให้มีการตรวจสอบแผนโดยสถาปนิกหรือวิศวกรโครงสร้างที่ได้รับใบอนุญาตในพื้นที่ของคุณ หลังจากซื้อแบบแปลนจาก Plan Asia แล้ว ลูกค้าต้องรับผิดชอบค่าใช้จ่ายเพิ่มเติมที่เกิดขึ้นจากการปฏิบัติตามข้อกำหนดของท้องถิ่นหรือข้อกำหนดอื่น ๆ สำหรับการก่อสร้าง ดูรายละเอียดเพิ่มเติมได้ที่หน้าข้อกำหนดด้านการก่อสร้าง",
      },
      {
        heading: "3.5 การซื้อ ราคา และการจัดส่งดิจิทัล",
        body: "ราคาแสดงที่หน้าชำระเงินเป็นเงินบาทไทย (THB) ในช่วงที่มุ่งตลาดในประเทศ การชำระเงินดำเนินการผ่านพันธมิตร Payment Gateway (รวมถึง Stripe) เมื่อยืนยันการชำระเงินสำเร็จ สิทธิ์ดาวน์โหลดไฟล์ PDF ที่เกี่ยวข้องจะถูกเปิดตามนโยบายการจัดส่งของเรา การซื้อที่เสร็จสิ้นแล้วคิดตามราคาที่แสดง ณ เวลาชำระเงิน ท่านตกลงให้ชื่อและอีเมลผู้ซื้อที่ถูกต้องเพื่อให้เราจัดส่งลิงก์ดาวน์โหลดและใบเสร็จได้ เนื่องจากกฎหมายลิขสิทธิ์และความเป็นไปได้ของการทำสำเนาโดยไม่ได้รับอนุญาต แบบแปลนไม่สามารถส่งคืนเพื่อขอเครดิตหรือคืนเงินได้หลังจากคำสั่งซื้อได้รับการดำเนินการแล้ว — ดูรายละเอียดในนโยบายการคืนสินค้า",
      },
      {
        heading: "3.6 การรับทราบสินค้าดิจิทัล (ความชัดเจนต่อ Stripe / การโต้แย้งการชำระเงิน)",
        body: "ท่านรับทราบว่า: (ก) ท่านกำลังซื้อไฟล์แบบแปลน/แบบบ้านดิจิทัล (และแพ็กเกจเสริมที่เลือกตอนชำระเงิน หากมี) ภายใต้ใบอนุญาตในการก่อสร้าง (Construction License) สำหรับบ้านหนึ่งหลัง (ข) โดยทั่วไปสิทธิ์เข้าถึงจะเปิดทันทีหลังยืนยันการชำระเงิน และ (ค) หลังจากคำสั่งซื้อได้รับการดำเนินการแล้ว แบบแปลนไม่สามารถส่งคืนเพื่อขอเครดิตหรือคืนเงินได้ไม่ว่าในกรณีใด ๆ ตามนโยบายการคืนสินค้า การโต้แย้งการชำระเงิน (chargeback) ที่ไม่สอดคล้องกับการรับทราบนี้ อาจถูกคัดค้านกับผู้ให้บริการชำระเงินโดยใช้หลักฐานคำสั่งซื้อ การดาวน์โหลด และการยินยอมของท่าน",
      },
      {
        heading: "3.7 การสนับสนุนลูกค้าและคำแนะนำด้านใบอนุญาตก่อสร้าง",
        body: "Planasia ให้บริการลูกค้าและคำแนะนำเชิงปฏิบัติ เพื่อช่วยผู้ซื้อเตรียมความพร้อมสำหรับการยื่นขออนุญาตก่อสร้าง และเข้าใจวิธีใช้ไฟล์แบบที่ซื้อร่วมกับผู้ประกอบวิชาชีพท้องถิ่น การสนับสนุนอาจรวมถึงการตอบคำถามเกี่ยวกับสินค้า ชี้แจงสิ่งที่รวมอยู่ในรายการ และแนะนำขั้นตอนถัดไปเพื่อความพร้อมในการขออนุญาต ทั้งนี้ การสนับสนุนและคำแนะนำไม่ได้ทดแทนสถาปนิก วิศวกรท้องถิ่นที่มีใบอนุญาต หรือหน่วยงานผู้อนุญาต และไม่ได้การันตีว่าหน่วยงานใดจะอนุมัติใบอนุญาต การอนุมัติขั้นสุดท้ายขึ้นอยู่กับกฎหมายท้องถิ่น สภาพที่ดิน และการรับรองจากผู้เชี่ยวชาญที่ท่านจัดหาเอง",
      },
      {
        heading: "3.8 การจำกัดความรับผิด (Limitation of Liability)",
        body: "แพลตฟอร์มของเราทำหน้าที่เป็นตัวกลางในการอำนวยความสะดวกด้านการซื้อขายไฟล์ดิจิทัลระหว่างผู้ซื้อและผู้ออกแบบ สินค้าและบริการบนเว็บไซต์จัดเตรียมไว้ให้ตามสภาพที่เป็นอยู่ (“As Is” และ “As Available”) ในขอบเขตสูงสุดที่กฎหมายอนุญาต ทางแพลตฟอร์มไม่รับประกันว่าเนื้อหา แบบแปลน หรือไฟล์ PDF จะปราศจากข้อผิดพลาดทั้งหมด 100% ครบถ้วนสำหรับทุกแปลงที่ดิน หรือเหมาะสมกับวัตถุประสงค์เฉพาะ แต่เรายินดีประสานงานและตรวจสอบปัญหาทางเทคนิคด้านการจัดส่งตามเงื่อนไขในนโยบายการคืนสินค้า (การจัดส่งใหม่ตามความเหมาะสม) เว้นแต่ความรับผิดที่ไม่สามารถจำกัดได้ตามกฎหมายคุ้มครองผู้บริโภคไทย ความรับผิดรวมของ Planasia จากคำสั่งซื้อใดๆ จำกัดไม่เกินค่าธรรมเนียมที่ท่านชำระจริงให้ Planasia สำหรับคำสั่งซื้อที่เกี่ยวข้องนั้น เราไม่รับผิดต่อความเสียหายทางอ้อม พิเศษ ผลสืบเนื่อง หรือเชิงลงโทษ รวมถึงกำไรที่สูญเสียหรือค่าใช้จ่ายจากการล่าช้าของงานก่อสร้าง แม้จะได้แจ้งความเป็นไปได้แล้วก็ตาม",
      },
      {
        heading: "3.9 การใช้งานที่ยอมรับได้และบัญชีผู้ใช้",
        body: "ท่านรับผิดชอบกิจกรรมภายใต้บัญชีของท่านและต้องรักษาข้อมูลเข้าสู่ระบบให้ปลอดภัย ห้ามใช้เว็บไซต์หรือ API ในทางที่ผิด หลีกเลี่ยงมาตรการความปลอดภัยหรือการจำกัดอัตรา อัปโหลดเนื้อหาผิดกฎหมาย ละเมิดทรัพย์สินทางปัญญา หรือใช้ไฟล์ที่ซื้อเกินขอบเขตใบอนุญาตในการก่อสร้าง (Construction License) เราอาจระงับหรือยุติการเข้าถึงหากมีการละเมิดข้อกำหนดนี้หรือกฎหมายที่ใช้บังคับ",
      },
      {
        heading: "3.10 การเปลี่ยนแปลงข้อกำหนด (Changes to Terms)",
        body: "ทางเราขอสงวนสิทธิ์ในการปรับปรุง แก้ไข หรือเปลี่ยนแปลงข้อกำหนดการให้บริการนี้ได้ตลอดเวลา การเปลี่ยนแปลงที่มีสาระสำคัญจะสะท้อนโดยการอัปเดตข้อความ “อัปเดตล่าสุด” บนหน้านี้ การใช้งานเว็บไซต์ต่อเนื่องหลังจากการเผยแพร่การเปลี่ยนแปลงถือว่าท่านยอมรับข้อกำหนดใหม่ในขอบเขตที่กฎหมายอนุญาต หากท่านไม่ยอมรับข้อกำหนดที่ปรับปรุงแล้ว กรุณาหยุดใช้บริการ",
      },
      {
        heading: "3.11 กฎหมายที่ใช้บังคับและช่องทางติดต่อ",
        body: "ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย โดยไม่กระทบสิทธิ์คุ้มครองผู้บริโภคที่กฎหมายห้ามสละ ข้อพิพาทให้อยู่ในเขตอำนาจศาลที่มีอำนาจในประเทศไทย เว้นแต่กฎหมายบังคับจะกำหนดเป็นอย่างอื่น ติดต่อ: hello@planasia.com (หรือช่องทางที่ประกาศบนเว็บไซต์)",
      },
    ],
  },
  hi: {
    title: "3. Terms of Service",
    sections: [
      {
        heading: "Summary",
        body: "Using Planasia means you accept these Terms. Purchase grants a Construction License for one house. After an order is processed, plans cannot be returned for credit or refund. Buyers must ensure local building-code compliance. Contact hello@planasia.com.",
      },
    ],
  },
  vi: {
    title: "3. Điều khoản dịch vụ",
    sections: [
      {
        heading: "Tóm tắt",
        body: "Sử dụng Planasia đồng nghĩa chấp nhận Điều khoản. Mua bản vẽ được cấp Construction License cho một ngôi nhà. Sau khi đơn được xử lý, không hoàn trả để nhận tín dụng hoặc hoàn tiền. Người mua phải tuân thủ quy chuẩn xây dựng địa phương. Liên hệ hello@planasia.com.",
      },
    ],
  },
};

/**
 * Policy 1 — Return / Refund Policy (Plan Asia)
 */
export const REFUND_CONTENT: LegalContentMap = {
  en: {
    title: "1. Return Policy",
    sections: [
      {
        heading: "1.1 No returns after an order is processed",
        body: "Because of copyright law and the possibility that plans you receive may be copied without authorization, our house plans cannot be returned for credit or refund under any circumstances after an order has been processed. Please review your options carefully before placing an order.",
      },
      {
        heading: "1.2 Nature of digital goods",
        body: "Planasia’s primary products are digital house-plan files (such as PDF and related add-ons). Access is typically unlocked immediately after successful payment. Digital files cannot be “returned” in the same way as physical goods, and access after fulfilment cannot be reliably reversed.",
      },
      {
        heading: "1.3 Technical support (not a return)",
        body: "If you cannot access a file due to a verified technical issue on our side, contact hello@planasia.com with your order reference and proof of payment. We may redeliver a working download link or corrected file where appropriate. Redelivery is a support remedy — it is not a return for credit or a refund under this policy.",
      },
      {
        heading: "1.4 Contact",
        body: "Support: hello@planasia.com (or the contact channel published on our website).",
      },
    ],
  },
  th: {
    title: "1. นโยบายการคืนสินค้า",
    sections: [
      {
        heading: "1.1 ไม่รับคืนหลังดำเนินการคำสั่งซื้อแล้ว",
        body: "เนื่องจากกฎหมายลิขสิทธิ์และความเป็นไปได้ที่จะมีการทำสำเนาแบบแปลนที่คุณได้รับโดยไม่ได้รับอนุญาต แบบแปลนของเราจึงไม่สามารถส่งคืนเพื่อขอเครดิตหรือคืนเงินได้ไม่ว่าในกรณีใด ๆ หลังจากที่คำสั่งซื้อได้รับการดำเนินการแล้ว โปรดตรวจสอบตัวเลือกของคุณอีกครั้งก่อนสั่งซื้อ",
      },
      {
        heading: "1.2 ลักษณะสินค้าดิจิทัล",
        body: "สินค้าหลักบนแพลตฟอร์ม Plan Asia เป็นไฟล์แบบแปลนดิจิทัล (เช่น PDF และแพ็กเกจเสริมที่เกี่ยวข้อง) ซึ่งโดยทั่วไปจะปลดล็อกสิทธิ์เข้าถึงทันทีหลังชำระเงินสำเร็จ ไฟล์ดิจิทัลไม่สามารถ “ส่งคืน” ได้ในลักษณะเดียวกับสินค้าทางกายภาพ และการเข้าถึงหลังจัดส่งแล้วไม่อาจเพิกถอนได้อย่างสมบูรณ์",
      },
      {
        heading: "1.3 การสนับสนุนทางเทคนิค (ไม่ใช่การคืนสินค้า)",
        body: "หากท่านเข้าถึงไฟล์ไม่ได้เนื่องจากปัญหาทางเทคนิคที่ยืนยันได้ว่าเกิดจากระบบของเรา กรุณาติดต่อ hello@planasia.com พร้อมเลขอ้างอิงคำสั่งซื้อและหลักฐานการชำระเงิน เราอาจจัดส่งลิงก์ดาวน์โหลดหรือไฟล์ที่ถูกต้องให้ใหม่ตามความเหมาะสม การจัดส่งใหม่เป็นการแก้ไขปัญหาด้านการใช้งาน — ไม่ใช่การคืนสินค้าเพื่อขอเครดิตหรือคืนเงินตามนโยบายนี้",
      },
      {
        heading: "1.4 ช่องทางติดต่อ",
        body: "ฝ่ายสนับสนุน: hello@planasia.com (หรือช่องทางที่ประกาศบนเว็บไซต์)",
      },
    ],
  },
  hi: {
    title: "1. Return Policy",
    sections: [
      {
        heading: "No returns after processing",
        body: "Because of copyright law and the risk of unauthorized copying, Planasia house plans cannot be returned for credit or refund in any case after an order is processed. Please review options carefully before ordering.",
      },
    ],
  },
  vi: {
    title: "1. Chính sách đổi trả",
    sections: [
      {
        heading: "Không hoàn trả sau khi xử lý đơn",
        body: "Do luật bản quyền và rủi ro sao chép trái phép, bản vẽ Planasia không thể trả lại để nhận tín dụng hoặc hoàn tiền trong mọi trường hợp sau khi đơn hàng được xử lý. Vui lòng kiểm tra lựa chọn trước khi đặt hàng.",
      },
    ],
  },
};

/**
 * Policy 4 — Delivery Policy
 * Digital PDF delivery + optional supplementary document sets (Thai domestic).
 */
export const SHIPPING_CONTENT: LegalContentMap = {
  en: {
    title: "4. Delivery Policy",
    sections: [
      {
        heading: "4.1 Scope",
        body: "Products on the Planasia platform consist of digital files and optional supplementary services selected by the customer during checkout. This Delivery Policy explains how primary digital house-plan files and any elected supplementary document sets are delivered after successful payment.",
      },
      {
        heading: "4.2 Digital delivery of primary files",
        body: "For house plans delivered as digital files (for example PDF), upon successful completion of payment the system unlocks your download link immediately on the website success page and automatically sends the download link to the email address you provided at checkout. Standard digital orders do not require physical shipment. Keep your confirmation email and order reference secure; do not share licensed download links publicly.",
      },
      {
        heading: "4.3 Supplementary document / file sets (3 sets)",
        body: "If, during checkout, you select a package or expressly request an additional three (3) sets of documents or files, we will arrange delivery of those sets according to the terms and channel agreed for that option — for example postal delivery to the address you provide, or a designated digital channel, depending on the type of supplementary set. Supplementary sets are not included by default with every order; they apply only when selected or confirmed as part of your purchase.",
      },
      {
        heading: "4.4 Processing timeframes",
        body: "Digital files: available for download immediately after successful payment, on a 24-hour basis (subject to brief delays during payment confirmation, such as PromptPay settlement, or scheduled maintenance). Supplementary / document sets (3 sets): our team will prepare and dispatch according to the applicable fulfilment schedule; you will receive delivery-status confirmation by email or another contact channel you provided.",
      },
      {
        heading: "4.5 Delivery or access issues",
        body: "If you do not receive a digital download link, cannot access your files after payment, or have questions about the delivery of a supplementary three-set document order, contact our support team through the contact channels published on the website at any time. Please include your order reference and proof of payment so we can investigate and assist promptly. Technical delivery failures attributable to our systems may be addressed under our Return Policy (redelivery support — not a return for credit).",
      },
      {
        heading: "4.6 Contact",
        body: "Support: hello@planasia.com (or the contact channel published on our website). For purchases in Thailand, communications are handled in Thai or English as available.",
      },
    ],
  },
  th: {
    title: "4. นโยบายการจัดส่งสินค้า (Delivery Policy)",
    sections: [
      {
        heading: "4.1 ขอบเขต",
        body: "เนื่องจากสินค้าบนแพลตฟอร์ม Planasia ประกอบด้วยไฟล์ดิจิทัล และบริการเสริมตามเงื่อนไขที่ลูกค้าเลือกในขั้นตอนการสั่งซื้อ นโยบายการจัดส่งสินค้าฉบับนี้อธิบายวิธีการจัดส่งไฟล์แบบบ้านดิจิทัลหลัก และชุดเอกสาร/ไฟล์เสริม (หากมีการเลือก) หลังการชำระเงินสำเร็จ",
      },
      {
        heading: "4.2 การจัดส่งไฟล์ดิจิทัลหลัก (Digital Delivery)",
        body: "สำหรับแบบบ้านในรูปแบบไฟล์ดิจิทัล (เช่น PDF) ระบบจะทำการปลดล็อกลิงก์ดาวน์โหลดให้ท่านทันทีบนหน้าเว็บไซต์ (Success Page) และจัดส่งลิงก์ดาวน์โหลดไปยังอีเมลของท่านโดยอัตโนมัติหลังจากการชำระเงินเสร็จสมบูรณ์ คำสั่งซื้อดิจิทัลมาตรฐานไม่ต้องจัดส่งพัสดุทางกายภาพ กรุณาเก็บอีเมลยืนยันและเลขอ้างอิงคำสั่งซื้อไว้ให้ปลอดภัย และห้ามเผยแพร่ลิงก์ดาวน์โหลดที่ได้รับอนุญาตสู่สาธารณะ",
      },
      {
        heading: "4.3 เงื่อนไขการจัดส่งเอกสาร/ไฟล์ชุดเสริม (3 ชุด)",
        body: "หากในขั้นตอนการสั่งซื้อ ท่านได้เลือกแพ็กเกจหรือระบุความประสงค์ขอรับเอกสาร/ไฟล์จำนวน 3 ชุด เพิ่มเติม ทางเราจะดำเนินการจัดส่งชุดเอกสารดังกล่าวตามเงื่อนไขและช่องทางที่ได้ตกลงกันไว้ (เช่น การจัดส่งผ่านทางไปรษณีย์ตามที่อยู่ที่ท่านระบุ หรือช่องทางดิจิทัลที่กำหนดตามประเภทของชุดเอกสารนั้นๆ) ชุดเสริมไม่ได้รวมอยู่ในทุกคำสั่งซื้อโดยอัตโนมัติ จะมีผลเฉพาะเมื่อท่านเลือกหรือยืนยันเป็นส่วนหนึ่งของการซื้อ",
      },
      {
        heading: "4.4 ระยะเวลาในการดำเนินการ",
        body: "สำหรับไฟล์ดิจิทัล: สามารถดาวน์โหลดได้ทันทีหลังชำระเงินสำเร็จ ตลอด 24 ชั่วโมง (อาจล่าช้าเล็กน้อยระหว่างยืนยันการชำระเงิน เช่น PromptPay หรือช่วงบำรุงรักษา) สำหรับชุดเสริม/เอกสาร (3 ชุด): ทีมงานจะดำเนินการจัดเตรียมและจัดส่งตามรอบเวลาที่กำหนด โดยท่านจะได้รับการยืนยันสถานะการจัดส่งผ่านทางอีเมลหรือช่องทางติดต่อที่ท่านให้ไว้",
      },
      {
        heading: "4.5 ปัญหาการจัดส่งหรือการรับสินค้า",
        body: "หากท่านไม่ได้รับลิงก์ดาวน์โหลดไฟล์ดิจิทัล ไม่สามารถเข้าถึงไฟล์หลังชำระเงิน หรือมีข้อสงสัยเกี่ยวกับการจัดส่งเอกสารชุดเสริม 3 ชุด กรุณาติดต่อทีมสนับสนุนของเราได้ตลอดเวลาผ่านช่องทางติดต่อบนเว็บไซต์ พร้อมระบุเลขอ้างอิงคำสั่งซื้อและหลักฐานการชำระเงิน เพื่อให้เราตรวจสอบและช่วยเหลือท่านอย่างรวดเร็ว กรณีปัญหาทางเทคนิคด้านการจัดส่งที่เกิดจากระบบของเรา อาจได้รับการช่วยเหลือภายใต้นโยบายการคืนสินค้า (การจัดส่งใหม่ — ไม่ใช่การคืนเพื่อขอเครดิต)",
      },
      {
        heading: "4.6 ช่องทางติดต่อ",
        body: "ฝ่ายสนับสนุน: hello@planasia.com (หรือช่องทางที่ประกาศบนเว็บไซต์) สำหรับการสั่งซื้อในประเทศไทย เราให้บริการเป็นภาษาไทยหรือภาษาอังกฤษตามที่มี",
      },
    ],
  },
  hi: {
    title: "4. Delivery Policy",
    sections: [
      {
        heading: "Summary",
        body: "Primary PDF house plans unlock on the success page and by email after payment. Optional 3-set supplementary documents ship by the agreed postal or digital channel. Contact hello@planasia.com if you do not receive access.",
      },
    ],
  },
  vi: {
    title: "4. Chính sách giao hàng",
    sections: [
      {
        heading: "Tóm tắt",
        body: "Bản vẽ PDF chính được mở trên trang thành công và gửi email sau thanh toán. Bộ tài liệu bổ sung 3 bộ (nếu chọn) giao theo kênh bưu điện hoặc số đã thỏa thuận. Liên hệ hello@planasia.com nếu không nhận được quyền truy cập.",
      },
    ],
  },
};

/**
 * Policy 5 — Construction requirements and building codes (Plan Asia)
 */
export const CONSTRUCTION_CONTENT: LegalContentMap = {
  en: {
    title: "5. Construction Requirements and Building Codes",
    sections: [
      {
        heading: "5.1 General design standards vs local law",
        body: "Purchased plans are intended to follow general design principles and commonly accepted international practice, but may not cover every planning law, zoning rule, or local requirement in the area where the customer will build.",
      },
      {
        heading: "5.2 Buyer and contractor responsibility",
        body: "It is the buyer’s and/or contractor’s responsibility to ensure that the structure is built to comply with building-control laws and the local requirements of your area. The customer agrees to indemnify and hold harmless Plan Asia, its officers, employees, and agents from any claim, loss, or liability arising from a plan’s failure to meet local laws or regulations, or from any breach of agreement by the customer or the customer’s contractors in whole or in part.",
      },
      {
        heading: "5.3 Building systems and local adaptation",
        body: "Because local rules and construction methods vary by area, planning for certain systems (such as air-conditioning and actual plumbing) may require adapting the plans to your site. For that reason, such systems may not be included in our standard plans. You should meet a local contractor or engineer to select and plan the systems best suited to your area.",
      },
      {
        heading: "5.4 Local professional review and extra costs",
        body: "Some municipalities or local authorities may require plan review by a licensed architect or structural engineer in your area. After purchasing plans from Plan Asia, the customer is responsible for any additional costs incurred to comply with local or other requirements for construction.",
      },
      {
        heading: "5.5 Related policies",
        body: "Copyright and the Construction License are described in our Terms of Service. Our Return Policy explains that plans cannot be returned for credit or refund after an order is processed.",
      },
    ],
  },
  th: {
    title: "5. ข้อกำหนดด้านการก่อสร้างและรหัสอาคาร",
    sections: [
      {
        heading: "5.1 มาตรฐานการออกแบบทั่วไปกับกฎหมายท้องถิ่น",
        body: "แบบแปลนที่ซื้อจะต้องเป็นไปตามหลักการออกแบบและมาตรฐานสากลทั่วไป แต่อาจไม่ครอบคลุมกฎหมายและข้อบังคับผังเมืองหรือข้อกำหนดท้องถิ่นในแต่ละพื้นที่ที่ลูกค้าจะทำการก่อสร้าง",
      },
      {
        heading: "5.2 ความรับผิดชอบของผู้ซื้อและผู้รับเหมา",
        body: "เป็นความรับผิดชอบของผู้ซื้อและ/หรือผู้รับเหมาที่จะต้องตรวจสอบให้แน่ใจว่าโครงสร้างนั้นสร้างขึ้นเพื่อให้เป็นไปตามกฎหมายควบคุมอาคารและข้อกำหนดของท้องถิ่นคุณ ลูกค้าตกลงที่จะชดใช้และปกป้องบริษัท Plan Asia, ผู้บริหาร, พนักงาน และตัวแทนของบริษัท จากการเรียกร้อง ความสูญเสีย หรือความรับผิดใด ๆ ที่เกิดจากความล้มเหลวของแบบแปลนในการปฏิบัติตามกฎหมายหรือข้อบังคับท้องถิ่น หรือจากการละเมิดข้อตกลงใด ๆ ที่มาจากลูกค้าหรือผู้รับเหมาของลูกค้าทั้งหมดหรือบางส่วน",
      },
      {
        heading: "5.3 งานระบบและการปรับให้เข้ากับพื้นที่",
        body: "เนื่องจากข้อกำหนดและระเบียบข้อบังคับในท้องถิ่น รวมถึงวิธีการก่อสร้างที่แตกต่างกันไปในแต่ละพื้นที่ การวางแผนงานระบบบางอย่าง (เช่น ระบบปรับอากาศและระบบประปาจริง) อาจจำเป็นต้องปรับแผนให้เข้ากับพื้นที่ของคุณ ด้วยเหตุนี้ ระบบงานระบบดังกล่าวอาจไม่รวมอยู่ในแบบแปลนมาตรฐานของเรา คุณควรนัดพบกับผู้รับเหมาหรือวิศวกรท้องถิ่นเพื่อเลือกและวางแผนระบบที่เหมาะสมที่สุดสำหรับพื้นที่ของคุณ",
      },
      {
        heading: "5.4 การตรวจสอบโดยผู้ประกอบวิชาชีพท้องถิ่นและค่าใช้จ่ายเพิ่มเติม",
        body: "เทศบาลหรือหน่วยงานท้องถิ่นบางแห่งอาจกำหนดให้มีการตรวจสอบแผนโดยสถาปนิกหรือวิศวกรโครงสร้างที่ได้รับใบอนุญาตในพื้นที่ของคุณ หลังจากซื้อแบบแปลนจาก Plan Asia แล้ว ลูกค้าต้องรับผิดชอบค่าใช้จ่ายเพิ่มเติมที่เกิดขึ้นจากการปฏิบัติตามข้อกำหนดของท้องถิ่นหรือข้อกำหนดอื่น ๆ สำหรับการก่อสร้าง",
      },
      {
        heading: "5.5 นโยบายที่เกี่ยวข้อง",
        body: "ข้อมูลลิขสิทธิ์และใบอนุญาตในการก่อสร้าง (Construction License) อยู่ในเงื่อนไขและข้อตกลงการใช้บริการ นโยบายการคืนสินค้าอธิบายว่าแบบแปลนไม่สามารถส่งคืนเพื่อขอเครดิตหรือคืนเงินได้หลังจากคำสั่งซื้อได้รับการดำเนินการแล้ว",
      },
    ],
  },
  hi: {
    title: "5. Construction Requirements and Building Codes",
    sections: [
      {
        heading: "Summary",
        body: "Plans follow general design standards but may not meet every local code. Buyers/contractors must ensure local compliance and indemnify Plan Asia. MEP systems may need local adaptation. Local stamped review and related costs are the customer’s responsibility after purchase.",
      },
    ],
  },
  vi: {
    title: "5. Yêu cầu xây dựng và quy chuẩn xây dựng",
    sections: [
      {
        heading: "Tóm tắt",
        body: "Bản vẽ theo nguyên tắc thiết kế chung nhưng có thể không đáp ứng mọi quy định địa phương. Người mua/nhà thầu chịu trách nhiệm tuân thủ luật địa phương và bồi hoàn Plan Asia. Hệ thống MEP có thể cần điều chỉnh tại chỗ. Chi phí thẩm định/đáp ứng yêu cầu địa phương do khách hàng chịu sau khi mua.",
      },
    ],
  },
};
