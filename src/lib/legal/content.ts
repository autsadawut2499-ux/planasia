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
        body: "Welcome to Planasia. By accessing this website, purchasing products, or downloading house-plan PDF files from this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service in full. If you do not agree, you must not use the website or complete a purchase. These Terms operate together with our Privacy Policy and Refund and Cancellation Policy. At checkout you must actively confirm (checkbox) that you understand our digital-goods license and refund rules before payment is processed.",
      },
      {
        heading: "3.2 Platform role",
        body: "Planasia operates a digital marketplace that facilitates the sale and delivery of house-plan PDF files and related digital add-ons between independent designers (or rights holders) and buyers. Except where we expressly state otherwise, we act as an intermediary and technology platform; we are not the builder, contractor, or licensed engineer for your project, and we do not supervise on-site construction.",
      },
      {
        heading: "3.3 Intellectual property and copyright",
        body: "All house plans, floor plans, drawings, diagrams, and PDF documents offered on this website are copyrighted works and intellectual property of the architect, designer, or rights holder who created them (and/or Planasia where we own or are licensed to distribute specific materials). Purchase of a product grants you a personal, non-exclusive, non-transferable Single-Use License to use the purchased plan for the construction of one (1) house in accordance with the plan you bought, unless a listing expressly states a different license. Strictly prohibited without prior written permission from the platform or the copyright owner: reproducing, modifying for redistribution, copying, forwarding, publishing, reselling, commercially exploiting, or otherwise distributing the PDF files or house plans to any third party. Unauthorized use may result in termination of access and legal action under applicable intellectual-property law.",
      },
      {
        heading: "3.4 User responsibilities and engineering review",
        body: "Information and drawings in the PDF files are provided as a baseline design guide for construction planning. The buyer or homeowner is solely responsible for having the plans reviewed, verified, and adapted by a structural engineer, local architect, and/or competent authority for accuracy, safety, and compliance with site conditions, local regulations, and the building-control laws of the applicable jurisdiction (including Thailand) before any actual construction. Planasia and the designer are not liable for legal liability, property damage, personal injury, or other loss arising from construction based on the plans without independent professional review and certification by qualified local experts. You must not treat marketplace PDFs as a substitute for stamped or permit-ready drawings where local law requires them.",
      },
      {
        heading: "3.5 Purchases, pricing, and digital delivery",
        body: "Prices are displayed at checkout in Thai Baht (THB) for our domestic marketplace phase. Payment is processed through our payment gateway partners (including Stripe). Upon successful payment confirmation, download rights for the applicable PDF files are unlocked as described in our Delivery Policy. Completed purchases are charged at the price shown at the time of payment. You agree to provide accurate buyer name and email so we can deliver download links and receipts. Because digital files are delivered electronically, ordinary “change of mind” refunds after a successful download are not available — see our Refund and Cancellation Policy.",
      },
      {
        heading: "3.6 Digital goods acknowledgment (Stripe / chargeback clarity)",
        body: "You acknowledge that: (a) you are purchasing digital blueprint / house-plan files (and optional digital or hard-copy add-ons selected at checkout); (b) access is typically granted immediately after payment confirmation; (c) once a blueprint file has been successfully downloaded, refunds are not provided for change of mind, wrong plan selection, or preference changes; and (d) refunds are considered only when a file is genuinely corrupted or defective and cannot reasonably be repaired or redelivered, as set out in the Refund and Cancellation Policy. Unfounded chargebacks that contradict this acknowledgment may be contested with our payment processor using order, download, and consent records.",
      },
      {
        heading: "3.7 Customer support and building-permit guidance",
        body: "Planasia provides customer support and practical guidance to help buyers prepare for building-permit applications and understand how to use purchased plan files with local professionals. Support may include answering product questions, clarifying what is included in a listing, and directing buyers to next steps for permit readiness. Support and guidance do not replace licensed local architects, engineers, or permit authorities, and do not guarantee that any authority will approve a permit. Final permit approval remains subject to local law, site conditions, and professional certifications you obtain independently.",
      },
      {
        heading: "3.8 Limitation of liability",
        body: "The platform facilitates digital-file transactions between buyers and designers. Products and services on the website are provided on an “As Is” and “As Available” basis. To the maximum extent permitted by law, Planasia does not warrant that content, drawings, or PDF files are entirely free from error, complete for every site, or fit for a particular purpose. We will coordinate and investigate technical delivery issues in accordance with our Refund and Cancellation Policy. Except where liability cannot be limited under mandatory Thai consumer law, Planasia’s aggregate liability arising out of any order is limited to the fees actually paid to Planasia for that affected order. We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits or construction delay costs, even if advised of the possibility.",
      },
      {
        heading: "3.9 Acceptable use and accounts",
        body: "You are responsible for activity under your account and for keeping login credentials secure. You must not abuse the website or APIs, circumvent security or rate limits, upload unlawful content, infringe intellectual property, or use purchased files beyond the Single-Use License. We may suspend or terminate access for violations of these Terms or applicable law.",
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
        body: "ยินดีต้อนรับสู่แพลตฟอร์ม Planasia การเข้าใช้งานเว็บไซต์ การซื้อสินค้า หรือการดาวน์โหลดไฟล์ PDF แบบบ้านจากเว็บไซต์นี้ ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขการให้บริการฉบับนี้โดยสมบูรณ์ หากท่านไม่ยอมรับ กรุณาหยุดใช้บริการและอย่าทำการสั่งซื้อ ข้อกำหนดนี้อ่านประกอบกับนโยบายความเป็นส่วนตัว และนโยบายการคืนเงินและการยกเลิกของเรา ในขั้นตอนชำระเงิน ท่านต้องยืนยันผ่านช่องทำเครื่องหมาย (checkbox) ว่าเข้าใจเงื่อนไขสินค้าดิจิทัลและนโยบายคืนเงินก่อนชำระเงิน",
      },
      {
        heading: "3.2 บทบาทของแพลตฟอร์ม",
        body: "Planasia เป็นตลาดกลางดิจิทัลที่อำนวยความสะดวกด้านการซื้อขายและจัดส่งไฟล์แบบบ้าน PDF รวมถึงแพ็กเกจดิจิทัลที่เกี่ยวข้อง ระหว่างนักออกแบบอิสระ (หรือเจ้าของสิทธิ์) กับผู้ซื้อ เว้นแต่เราจะระบุเป็นอย่างอื่นโดยชัดเจน เราทำหน้าที่เป็นตัวกลางและแพลตฟอร์มเทคโนโลยี ไม่ใช่ผู้รับเหมาก่อสร้าง หรือวิศวกรที่มีใบอนุญาตสำหรับโครงการของท่าน และไม่ได้ควบคุมงานก่อสร้างหน้างาน",
      },
      {
        heading: "3.3 ลิขสิทธิ์และทรัพย์สินทางปัญญา (Intellectual Property & Copyright)",
        body: "แบบบ้าน แบบแปลน แผนผัง และไฟล์เอกสารรูปแบบ PDF ทั้งหมดที่วางจำหน่ายบนเว็บไซต์นี้ ถือเป็นงานอันมีลิขสิทธิ์และเป็นทรัพย์สินทางปัญญาของสถาปนิกหรือนักออกแบบผู้ออกแบบผลงานนั้นๆ (และ/หรือของ Planasia ในกรณีที่เราเป็นเจ้าของหรือได้รับอนุญาตให้เผยแพร่) การซื้อสินค้าถือเป็นการให้ “สิทธิ์ในการใช้งานเฉพาะตัว (Single-Use License)” สำหรับการก่อสร้างบ้าน 1 หลัง ตามแบบที่ท่านซื้อเท่านั้น เว้นแต่รายการสินค้าระบุสิทธิ์อื่นไว้ชัดเจน ข้อห้ามเด็ดขาด: ห้ามมิให้ทำซ้ำ ดัดแปลงเพื่อแจกจ่าย คัดลอก ส่งต่อ เผยแพร่ ขายต่อ หรือนำไฟล์ PDF หรือแบบบ้านดังกล่าวไปใช้ในเชิงพาณิชย์หรือแจกจ่ายให้ผู้อื่นโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากทางแพลตฟอร์มหรือเจ้าของลิขสิทธิ์ การใช้งานโดยไม่ได้รับอนุญาตอาจทำให้สิทธิ์การเข้าถึงถูกระงับ และอาจถูกดำเนินคดีตามกฎหมายทรัพย์สินทางปัญญา",
      },
      {
        heading: "3.4 ความรับผิดชอบของผู้ซื้อและการตรวจสอบทางวิศวกรรม",
        body: "ข้อมูลและแบบแปลนในไฟล์ PDF จัดทำขึ้นเพื่อให้เป็นแนวทางในการก่อสร้างพื้นฐาน ผู้ซื้อหรือเจ้าของบ้านมีหน้าที่ต้องนำแบบแปลนดังกล่าวไปให้วิศวกรโครงสร้าง สถาปนิกท้องถิ่น หรือหน่วยงานที่เกี่ยวข้องตรวจสอบความถูกต้อง ความปลอดภัย และปรับแก้ให้สอดคล้องกับสภาพพื้นที่ ข้อบังคับกฎหมายท้องถิ่น หรือกฎหมายควบคุมอาคารของประเทศท่าน (รวมถึงประเทศไทย) ก่อนดำเนินการก่อสร้างจริง ทางแพลตฟอร์มและผู้ออกแบบจะไม่รับผิดชอบต่อความเสียหาย ทางกฎหมาย อุบัติเหตุ หรือความสูญเสียใดๆ ที่เกิดขึ้นจากการนำแบบแปลนไปใช้ก่อสร้างโดยปราศจากการตรวจสอบและรับรองจากผู้เชี่ยวชาญประจำท้องถิ่น ท่านต้องไม่ถือว่าไฟล์ PDF จากตลาดกลางทดแทนแบบที่มีตราประทับหรือแบบพร้อมยื่นอนุญาต ในกรณีที่กฎหมายท้องถิ่นกำหนดให้ต้องมี",
      },
      {
        heading: "3.5 การซื้อ ราคา และการจัดส่งดิจิทัล",
        body: "ราคาแสดงที่หน้าชำระเงินเป็นเงินบาทไทย (THB) ในช่วงที่มุ่งตลาดในประเทศ การชำระเงินดำเนินการผ่านพันธมิตร Payment Gateway (รวมถึง Stripe) เมื่อยืนยันการชำระเงินสำเร็จ สิทธิ์ดาวน์โหลดไฟล์ PDF ที่เกี่ยวข้องจะถูกเปิดตามนโยบายการจัดส่งของเรา การซื้อที่เสร็จสิ้นแล้วคิดตามราคาที่แสดง ณ เวลาชำระเงิน ท่านตกลงให้ชื่อและอีเมลผู้ซื้อที่ถูกต้องเพื่อให้เราจัดส่งลิงก์ดาวน์โหลดและใบเสร็จได้ เนื่องจากเป็นสินค้าดิจิทัลที่จัดส่งทางอิเล็กทรอนิกส์ การคืนเงินเพราะเปลี่ยนใจหลังดาวน์โหลดสำเร็จจะไม่สามารถทำได้ — ดูรายละเอียดในนโยบายการคืนเงินและการยกเลิก",
      },
      {
        heading: "3.6 การรับทราบสินค้าดิจิทัล (ความชัดเจนต่อ Stripe / การโต้แย้งการชำระเงิน)",
        body: "ท่านรับทราบว่า: (ก) ท่านกำลังซื้อไฟล์แบบแปลน/แบบบ้านดิจิทัล (และแพ็กเกจเสริมที่เลือกตอนชำระเงิน หากมี) (ข) โดยทั่วไปสิทธิ์เข้าถึงจะเปิดทันทีหลังยืนยันการชำระเงิน (ค) เมื่อดาวน์โหลดไฟล์แบบแปลนสำเร็จแล้ว จะไม่มีการคืนเงินเพราะเปลี่ยนใจ เลือกแบบผิด หรือเปลี่ยนความชอบ และ (ง) จะพิจารณาคืนเงินเฉพาะเมื่อไฟล์เสีย/ชำรุดจริงและไม่สามารถซ่อมหรือจัดส่งใหม่ได้อย่างสมเหตุสมผล ตามนโยบายการคืนเงินและการยกเลิก การโต้แย้งการชำระเงิน (chargeback) ที่ไม่สอดคล้องกับการรับทราบนี้ อาจถูกคัดค้านกับผู้ให้บริการชำระเงินโดยใช้หลักฐานคำสั่งซื้อ การดาวน์โหลด และการยินยอมของท่าน",
      },
      {
        heading: "3.7 การสนับสนุนลูกค้าและคำแนะนำด้านใบอนุญาตก่อสร้าง",
        body: "Planasia ให้บริการลูกค้าและคำแนะนำเชิงปฏิบัติ เพื่อช่วยผู้ซื้อเตรียมความพร้อมสำหรับการยื่นขออนุญาตก่อสร้าง และเข้าใจวิธีใช้ไฟล์แบบที่ซื้อร่วมกับผู้ประกอบวิชาชีพท้องถิ่น การสนับสนุนอาจรวมถึงการตอบคำถามเกี่ยวกับสินค้า ชี้แจงสิ่งที่รวมอยู่ในรายการ และแนะนำขั้นตอนถัดไปเพื่อความพร้อมในการขออนุญาต ทั้งนี้ การสนับสนุนและคำแนะนำไม่ได้ทดแทนสถาปนิก วิศวกรท้องถิ่นที่มีใบอนุญาต หรือหน่วยงานผู้อนุญาต และไม่ได้การันตีว่าหน่วยงานใดจะอนุมัติใบอนุญาต การอนุมัติขั้นสุดท้ายขึ้นอยู่กับกฎหมายท้องถิ่น สภาพที่ดิน และการรับรองจากผู้เชี่ยวชาญที่ท่านจัดหาเอง",
      },
      {
        heading: "3.8 การจำกัดความรับผิด (Limitation of Liability)",
        body: "แพลตฟอร์มของเราทำหน้าที่เป็นตัวกลางในการอำนวยความสะดวกด้านการซื้อขายไฟล์ดิจิทัลระหว่างผู้ซื้อและผู้ออกแบบ สินค้าและบริการบนเว็บไซต์จัดเตรียมไว้ให้ตามสภาพที่เป็นอยู่ (“As Is” และ “As Available”) ในขอบเขตสูงสุดที่กฎหมายอนุญาต ทางแพลตฟอร์มไม่รับประกันว่าเนื้อหา แบบแปลน หรือไฟล์ PDF จะปราศจากข้อผิดพลาดทั้งหมด 100% ครบถ้วนสำหรับทุกแปลงที่ดิน หรือเหมาะสมกับวัตถุประสงค์เฉพาะ แต่เรายินดีประสานงานและตรวจสอบปัญหาทางเทคนิคด้านการจัดส่งตามเงื่อนไขในนโยบายการคืนเงินและการยกเลิก เว้นแต่ความรับผิดที่ไม่สามารถจำกัดได้ตามกฎหมายคุ้มครองผู้บริโภคไทย ความรับผิดรวมของ Planasia จากคำสั่งซื้อใดๆ จำกัดไม่เกินค่าธรรมเนียมที่ท่านชำระจริงให้ Planasia สำหรับคำสั่งซื้อที่เกี่ยวข้องนั้น เราไม่รับผิดต่อความเสียหายทางอ้อม พิเศษ ผลสืบเนื่อง หรือเชิงลงโทษ รวมถึงกำไรที่สูญเสียหรือค่าใช้จ่ายจากการล่าช้าของงานก่อสร้าง แม้จะได้แจ้งความเป็นไปได้แล้วก็ตาม",
      },
      {
        heading: "3.9 การใช้งานที่ยอมรับได้และบัญชีผู้ใช้",
        body: "ท่านรับผิดชอบกิจกรรมภายใต้บัญชีของท่านและต้องรักษาข้อมูลเข้าสู่ระบบให้ปลอดภัย ห้ามใช้เว็บไซต์หรือ API ในทางที่ผิด หลีกเลี่ยงมาตรการความปลอดภัยหรือการจำกัดอัตรา อัปโหลดเนื้อหาผิดกฎหมาย ละเมิดทรัพย์สินทางปัญญา หรือใช้ไฟล์ที่ซื้อเกินขอบเขต Single-Use License เราอาจระงับหรือยุติการเข้าถึงหากมีการละเมิดข้อกำหนดนี้หรือกฎหมายที่ใช้บังคับ",
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
        body: "Using Planasia means you accept these Terms. Purchased PDFs are Single-Use Licenses for one house. After a successful download, refunds are not given for change of mind—only for verified corrupted/defective files that cannot be fixed. We offer support and permit guidance (not a permit guarantee). Contact hello@planasia.com.",
      },
    ],
  },
  vi: {
    title: "3. Điều khoản dịch vụ",
    sections: [
      {
        heading: "Tóm tắt",
        body: "Sử dụng Planasia đồng nghĩa chấp nhận Điều khoản. PDF mua được cấp Single-Use License cho một ngôi nhà. Sau khi tải thành công, không hoàn tiền vì đổi ý—chỉ khi tệp hỏng/lỗi đã xác minh và không sửa được. Chúng tôi hỗ trợ hướng dẫn xin phép xây (không bảo đảm được duyệt). Liên hệ hello@planasia.com.",
      },
    ],
  },
};

/**
 * Policy 1 — Refund and Cancellation Policy
 * International structure for digital PDF house-plan downloads (Thai domestic market).
 */
export const REFUND_CONTENT: LegalContentMap = {
  en: {
    title: "1. Refund and Cancellation Policy",
    sections: [
      {
        heading: "1.1 Scope and nature of goods",
        body: "All primary products sold on the Planasia platform are digital goods — house-plan / blueprint files in PDF format (and related digital add-ons). Upon successful payment confirmation, download access is typically granted immediately. Because of the nature of digital delivery, this Refund and Cancellation Policy applies to every purchase of house-plan files on Planasia. Optional physical hard-copy add-ons, if selected, follow the same refund principles once production or dispatch has begun, except where a separate defect applies to the physical set.",
      },
      {
        heading: "1.2 Strict policy after successful download",
        body: "Once a blueprint file has been successfully downloaded, no refunds will be given for change of mind, selecting the wrong plan, design preference changes, project cancellation, or similar reasons. Digital files cannot be “returned,” and access after a completed download cannot be reliably undone. Please review previews, specifications, pricing, and license terms carefully before paying. At checkout you must confirm that you understand this digital-goods refund rule.",
      },
      {
        heading: "1.3 When a refund may be considered",
        body: "Refunds are allowed only if the file is genuinely corrupted or defective and cannot be fixed. Eligible situations are limited to defects attributable to our platform or source files, for example: (a) a verified technical failure prevented you from receiving a download link or accessing the PDF after successful payment; or (b) the PDF is damaged, corrupted, incomplete, or otherwise unusable, and our review confirms a defect in the original file. Our first remedy is always to repair or redeliver a corrected file at no extra charge. A refund may be issued only if redelivery or repair is not reasonably possible. Ordinary design disagreement or “I no longer want this plan” after a successful download is not a defect.",
      },
      {
        heading: "1.4 How to report a defective file",
        body: "Contact support within seven (7) days of the transaction date at hello@planasia.com (or the channel published on our website). Include proof of payment, your order or listing reference, and a short description of the problem (screenshots or error messages help). We will investigate promptly and either redeliver a corrected file or, if the file cannot be fixed, consider a refund on a case-by-case basis. Late or incomplete requests may be declined.",
      },
      {
        heading: "1.5 Support and building-permit assistance",
        body: "Separately from refunds, Planasia provides customer support and guidance to help buyers prepare for building-permit applications and use purchased plans with local professionals. Permit guidance is educational and operational support only — it does not guarantee that any authority will approve a permit, and it does not replace licensed local architects or engineers.",
      },
      {
        heading: "1.6 Chargebacks and payment disputes",
        body: "If you open a payment dispute or chargeback for a completed digital download without a verified file defect under this policy, we may submit evidence to our payment processor (including Stripe), such as order records, download/grant logs, and your checkout acknowledgment of these Terms and Refund Policy. We encourage you to contact support first so we can redeliver a working file where a genuine defect exists.",
      },
      {
        heading: "1.7 Contact and governing framework",
        body: "Support: hello@planasia.com (or the contact channel published on our website). This policy is administered for buyers in Thailand and is intended to operate consistently with applicable Thai consumer-protection rules for digital goods and with clear disclosure practices expected by payment partners, without limiting any non-waivable rights you may have under law.",
      },
    ],
  },
  th: {
    title: "1. นโยบายการคืนเงินและการยกเลิก (Refund and Cancellation Policy)",
    sections: [
      {
        heading: "1.1 ขอบเขตและลักษณะสินค้า",
        body: "สินค้าหลักบนแพลตฟอร์ม Planasia เป็นสินค้าดิจิทัล — ไฟล์แบบบ้าน/แบบแปลนในรูปแบบ PDF (และแพ็กเกจดิจิทัลที่เกี่ยวข้อง) ซึ่งโดยทั่วไปสามารถดาวน์โหลดได้ทันทีหลังจากยืนยันการชำระเงินสำเร็จ นโยบายฉบับนี้ใช้กับการสั่งซื้อแบบบ้านบน Planasia ทั้งหมด แพ็กเกจเอกสารรูปเล่ม (หากเลือก) ใช้หลักการคืนเงินในทำนองเดียวกันเมื่อเริ่มผลิตหรือจัดส่งแล้ว เว้นแต่มีความบกพร่องเฉพาะของชุดเอกสารนั้น",
      },
      {
        heading: "1.2 นโยบายเข้มงวดหลังดาวน์โหลดสำเร็จ",
        body: "เมื่อท่านดาวน์โหลดไฟล์แบบแปลนสำเร็จแล้ว จะไม่มีการคืนเงินเพราะเปลี่ยนใจ เลือกแบบผิด เปลี่ยนความชอบในแบบ ยกเลิกโครงการ หรือเหตุผลในลักษณะเดียวกัน ไฟล์ดิจิทัลไม่สามารถ “ส่งคืน” ได้ และการเข้าถึงหลังดาวน์โหลดเสร็จไม่อาจเพิกถอนได้อย่างสมบูรณ์ กรุณาตรวจสอบภาพตัวอย่าง สเปก ราคา และเงื่อนไขสิทธิ์ใช้งานก่อนชำระเงิน ในขั้นตอนชำระเงิน ท่านต้องยืนยันว่าเข้าใจกฎการคืนเงินสำหรับสินค้าดิจิทัลนี้",
      },
      {
        heading: "1.3 กรณีที่อาจพิจารณาคืนเงินได้",
        body: "จะคืนเงินได้เฉพาะเมื่อไฟล์เสียหรือชำรุดจริงและไม่สามารถแก้ไขได้ สถานการณ์ที่มีสิทธิ์จำกัดเฉพาะข้อบกพร่องจากระบบหรือไฟล์ต้นฉบับของเรา เช่น: (ก) ข้อผิดพลาดทางเทคนิคทำให้ท่านไม่ได้รับลิงก์ดาวน์โหลดหรือเข้าถึง PDF ไม่ได้หลังชำระเงินสำเร็จ หรือ (ข) ไฟล์ PDF เสีย ชำรุด ไม่ครบ หรือใช้งานไม่ได้ และตรวจสอบแล้วพบว่าเป็นความบกพร่องจากไฟล์ต้นฉบับ แนวทางแรกคือซ่อมหรือจัดส่งไฟล์ที่ถูกต้องให้ใหม่โดยไม่มีค่าใช้จ่ายเพิ่ม การคืนเงินจะพิจารณาเฉพาะเมื่อไม่สามารถซ่อมหรือจัดส่งใหม่ได้อย่างสมเหตุสมผล ความไม่พอใจในดีไซน์หรือ “ไม่ต้องการแบบนี้แล้ว” หลังดาวน์โหลดสำเร็จ ไม่ถือเป็นไฟล์ชำรุด",
      },
      {
        heading: "1.4 การแจ้งปัญหาไฟล์ชำรุด",
        body: "ติดต่อฝ่ายสนับสนุนภายใน 7 วัน นับจากวันที่ทำรายการ ที่ hello@planasia.com (หรือช่องทางบนเว็บไซต์) พร้อมหลักฐานการชำระเงิน เลขอ้างอิงคำสั่งซื้อ/รายการสินค้า และคำอธิบายปัญหาโดยย่อ (ภาพหน้าจอหรือข้อความ error จะช่วยได้) เราจะตรวจสอบโดยเร็ว และจัดส่งไฟล์ที่ถูกต้องให้ใหม่ หรือหากไฟล์แก้ไม่ได้ จะพิจารณาคืนเงินเป็นรายกรณี คำขอที่ล่าช้าหรือข้อมูลไม่ครบอาจไม่ได้รับการพิจารณา",
      },
      {
        heading: "1.5 การสนับสนุนและคำแนะนำด้านใบอนุญาตก่อสร้าง",
        body: "นอกเหนือจากเรื่องคืนเงิน Planasia ให้บริการลูกค้าและคำแนะนำเพื่อช่วยผู้ซื้อเตรียมความพร้อมยื่นขออนุญาตก่อสร้าง และใช้แบบที่ซื้อร่วมกับผู้ประกอบวิชาชีพท้องถิ่น คำแนะนำด้านใบอนุญาตเป็นการสนับสนุนเชิงข้อมูลและการใช้งานเท่านั้น — ไม่การันตีว่าหน่วยงานจะอนุมัติ และไม่ทดแทนสถาปนิกหรือวิศวกรท้องถิ่นที่มีใบอนุญาต",
      },
      {
        heading: "1.6 การโต้แย้งการชำระเงิน (Chargeback)",
        body: "หากท่านเปิดข้อพิพาทหรือ chargeback สำหรับการดาวน์โหลดดิจิทัลที่เสร็จสมบูรณ์โดยไม่มีไฟล์ชำรุดที่ยืนยันตามนโยบายนี้ เราอาจส่งหลักฐานไปยังผู้ให้บริการชำระเงิน (รวมถึง Stripe) เช่น บันทึกคำสั่งซื้อ บันทึกการดาวน์โหลด/สิทธิ์ และคำยืนยันของท่านตอนชำระเงิน เราขอให้ติดต่อฝ่ายสนับสนุนก่อนเสมอ เพื่อให้เราจัดส่งไฟล์ที่ใช้งานได้ในกรณีที่มีความบกพร่องจริง",
      },
      {
        heading: "1.7 ช่องทางติดต่อและกรอบกฎหมาย",
        body: "ฝ่ายสนับสนุน: hello@planasia.com (หรือช่องทางที่ประกาศบนเว็บไซต์) นโยบายนี้จัดทำสำหรับผู้ซื้อในประเทศไทย มุ่งให้สอดคล้องกับกฎหมายคุ้มครองผู้บริโภคไทยเกี่ยวกับสินค้าดิจิทัล และการเปิดเผยข้อมูลที่ชัดเจนตามแนวทางของพันธมิตรการชำระเงิน โดยไม่ตัดสิทธิ์ใด ๆ ที่กฎหมายห้ามสละ",
      },
    ],
  },
  hi: {
    title: "1. Refund and Cancellation Policy",
    sections: [
      {
        heading: "Digital PDF products",
        body: "After a successful blueprint download, Planasia does not refund for change of mind. Refunds apply only if the file is genuinely corrupted/defective and cannot be fixed. Contact support within 7 days with payment proof. We also offer permit-application guidance (not a guarantee).",
      },
    ],
  },
  vi: {
    title: "1. Chính sách hoàn tiền và hủy đơn",
    sections: [
      {
        heading: "Sản phẩm PDF số",
        body: "Sau khi tải bản vẽ thành công, Planasia không hoàn tiền vì đổi ý. Chỉ hoàn khi tệp thực sự hỏng/lỗi và không sửa được. Liên hệ hỗ trợ trong 7 ngày kèm chứng từ. Chúng tôi cũng hướng dẫn xin phép xây (không bảo đảm duyệt).",
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
        body: "If you do not receive a digital download link, cannot access your files after payment, or have questions about the delivery of a supplementary three-set document order, contact our support team through the contact channels published on the website at any time. Please include your order reference and proof of payment so we can investigate and assist promptly. Technical delivery failures attributable to our systems are also addressed under our Refund and Cancellation Policy.",
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
        body: "หากท่านไม่ได้รับลิงก์ดาวน์โหลดไฟล์ดิจิทัล ไม่สามารถเข้าถึงไฟล์หลังชำระเงิน หรือมีข้อสงสัยเกี่ยวกับการจัดส่งเอกสารชุดเสริม 3 ชุด กรุณาติดต่อทีมสนับสนุนของเราได้ตลอดเวลาผ่านช่องทางติดต่อบนเว็บไซต์ พร้อมระบุเลขอ้างอิงคำสั่งซื้อและหลักฐานการชำระเงิน เพื่อให้เราตรวจสอบและช่วยเหลือท่านอย่างรวดเร็ว กรณีปัญหาทางเทคนิคด้านการจัดส่งที่เกิดจากระบบของเรา อาจอยู่ในขอบเขตนโยบายการคืนเงินและการยกเลิกด้วย",
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
