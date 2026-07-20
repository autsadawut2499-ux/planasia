import type {
  ClarificationAnswer,
  ProjectInput,
  QuestionnaireInput,
  QuestionnaireUploads,
} from "@/lib/ai/types";
import { L, type LocalizedText } from "@/lib/i18n/localized-text";
import { isAffirmativeAnswer } from "@/lib/i18n/localized-text";

export interface ClarificationIssue {
  id: string;
  field: string;
  severity: "error" | "warning";
  question: LocalizedText;
  reason: LocalizedText;
}

export interface ClarificationResult {
  ready: boolean;
  issues: ClarificationIssue[];
  nextQuestion: ClarificationIssue | null;
  resolvedCount: number;
  totalIssues: number;
}

function isResolved(issueId: string, answers: ClarificationAnswer[]): boolean {
  return answers.some((a) => a.issueId === issueId);
}

/** Rule-based clarification — never guess; ask user when ambiguous */
export function analyzeClarificationNeeds(
  project: ProjectInput,
  questionnaire: QuestionnaireInput,
  uploads: QuestionnaireUploads,
  answers: ClarificationAnswer[] = [],
): ClarificationResult {
  const issues: ClarificationIssue[] = [];

  if (!uploads.sitePlan) {
    issues.push({
      id: "upload-site",
      field: "uploads.sitePlan",
      severity: "error",
      question: L(
        "Please upload a site/floor area plan (Slot 1). With or without dimensions is OK — please tell us which.",
        "กรุณาอัปโหลดแปลนพื้นที่ (ช่องที่ 1) — มีหรือไม่มีขนาดก็ได้ แต่ช่วยระบุให้ชัดเจน",
        "कृपया साइट/फ़्लोर एरिया प्लान (स्लॉट 1) अपलोड करें — आयाम हो या न हों, बताएं।",
        "Vui lòng tải bản vẽ mặt bằng/khu đất (Ô 1) — có hoặc không có kích thước đều được, hãy cho biết.",
      ),
      reason: L(
        "Site plan is required for layout and setback analysis.",
        "แปลนพื้นที่จำเป็นสำหรับวิเคราะห์การจัดวางและระยะร่น",
        "लेआउट और सेटबैक विश्लेषण के लिए साइट प्लान आवश्यक है।",
        "Bản vẽ mặt bằng cần thiết để phân tích bố trí và khoảng lùi.",
      ),
    });
  } else if (questionnaire.sitePlanHasDimensions === null) {
    issues.push({
      id: "site-dimensions",
      field: "questionnaire.sitePlanHasDimensions",
      severity: "warning",
      question: L(
        "Does your uploaded site plan (Slot 1) include dimension lines / scale?",
        "แปลนพื้นที่ที่อัปโหลด (ช่อง 1) มีเส้นขนาดหรือมาตราส่วนหรือไม่?",
        "क्या अपलोड किए गए साइट प्लान (स्लॉट 1) में आयाम रेखाएँ/स्केल है?",
        "Bản vẽ mặt bằng (Ô 1) có đường kích thước hoặc tỷ lệ không?",
      ),
      reason: L(
        "We cannot assume dimensions — this affects scale accuracy.",
        "ระบบไม่เดาขนาดเอง — ส่งผลต่อความแม่นยำของมาตราส่วน",
        "हम आयाम अनुमान नहीं लगाते — इससे स्केल की सटीकता प्रभावित होती है।",
        "Chúng tôi không tự suy đoán kích thước — ảnh hưởng đến độ chính xác tỷ lệ.",
      ),
    });
  }

  if (!uploads.elevationSection) {
    issues.push({
      id: "upload-elevation",
      field: "uploads.elevationSection",
      severity: "error",
      question: L(
        "Please upload an elevation, front view, or section drawing (Slot 2).",
        "กรุณาอัปโหลดรูปด้าน รูปหน้าตรง หรือรูปตัด (ช่องที่ 2)",
        "कृपया elevation, सामने का दृश्य या section (स्लॉट 2) अपलोड करें।",
        "Vui lòng tải hình mặt đứng, mặt tiền hoặc mặt cắt (Ô 2).",
      ),
      reason: L(
        "Architectural proportions cannot be inferred without a reference.",
        "ไม่สามารถอนุมานสัดส่วนสถาปัตยกรรมได้หากไม่มีไฟล์อ้างอิง",
        "संदर्भ के बिना वास्तु अनुपात अनुमानित नहीं किए जा सकते।",
        "Không thể suy ra tỷ lệ kiến trúc nếu thiếu tài liệu tham chiếu.",
      ),
    });
  }

  if (!uploads.frontView3d) {
    issues.push({
      id: "upload-3d-front",
      field: "uploads.frontView3d",
      severity: "error",
      question: L(
        "Please upload a front-facing 3D view (Slot 3) — front elevation only.",
        "กรุณาอัปโหลดรูป 3D มุมหน้าตรง (ช่องที่ 3) เท่านั้น",
        "कृपया सामने का 3D दृश्य (स्लॉट 3) अपलोड करें — केवल front elevation।",
        "Vui lòng tải hình 3D mặt tiền (Ô 3) — chỉ góc nhìn chính diện.",
      ),
      reason: L(
        "3D preview must be a front view per platform standard.",
        "ภาพ 3D ที่แสดงต้องเป็นมุมหน้าตรงตามมาตรฐานแพลตฟอร์ม",
        "3D पूर्वावलोकन प्लेटफ़ॉर्म मानक के अनुसार सामने का दृश्य होना चाहिए।",
        "Hình 3D phải là góc nhìn chính diện theo tiêu chuẩn nền tảng.",
      ),
    });
  } else if (questionnaire.frontViewConfirmed !== true) {
    issues.push({
      id: "confirm-3d-front",
      field: "questionnaire.frontViewConfirmed",
      severity: "warning",
      question: L(
        "Confirm: Is Slot 3 a true front-facing view (not angled)?",
        "ยืนยัน: รูปช่อง 3 เป็นมุมหน้าตรงจริงหรือไม่ (ไม่ใช่มุมเฉียง)?",
        "पुष्टि करें: क्या स्लॉट 3 सच्चा सामने का दृश्य है (कोणीय नहीं)?",
        "Xác nhận: Ô 3 có phải góc nhìn chính diện (không xiên) không?",
      ),
      reason: L(
        "Angled views distort the main preview.",
        "มุมเฉียงทำให้การแสดงผลหลักผิดเพี้ยน",
        "कोणीय दृश्य मुख्य पूर्वावलोकन को искажित करते हैं।",
        "Góc xiên làm méo hình ảnh xem trước chính.",
      ),
    });
  }

  const requiredFloors = project.floors;
  const uploadedFloors = uploads.floorPlans.filter(Boolean).length;
  if (uploadedFloors < requiredFloors) {
    issues.push({
      id: "upload-floor-plans",
      field: "uploads.floorPlans",
      severity: "error",
      question: L(
        `Selected ${requiredFloors} floor(s) but uploaded ${uploadedFloors} floor plan(s). Upload all in Slot 4.`,
        `เลือก ${requiredFloors} ชั้น แต่อัปโหลดแปลนพื้น ${uploadedFloors} แปลน — กรุณาอัปโหลดครบ (ช่อง 4)`,
        `${requiredFloors} मंजिल चुनी लेकिन ${uploadedFloors} फ़्लोर प्लान अपलोड — स्लॉट 4 में सभी अपलोड करें।`,
        `Chọn ${requiredFloors} tầng nhưng chỉ tải ${uploadedFloors} mặt bằng — vui lòng tải đủ (Ô 4).`,
      ),
      reason: L(
        "Floor plan count must match building floors.",
        "จำนวนแปลนพื้นต้องตรงกับจำนวนชั้น",
        "फ़्लोर प्लान की संख्या भवन की मंजिलों से मेल खानी चाहिए।",
        "Số mặt bằng phải khớp số tầng của công trình.",
      ),
    });
  }

  if (!project.projectName.trim()) {
    issues.push({
      id: "field-project-name",
      field: "project.projectName",
      severity: "warning",
      question: L(
        "What is the project name for the title block?",
        "ชื่อโครงการสำหรับกรอบชื่อแบบคืออะไร?",
        "title block के लिए परियोजना का नाम क्या है?",
        "Tên dự án trên khung tên bản vẽ là gì?",
      ),
      reason: L(
        "Required for permit drawing title block.",
        "จำเป็นสำหรับกรอบชื่อแบบยื่นอนุญาต",
        "परमिट ड्रॉइंग title block के लिए आवश्यक।",
        "Cần thiết cho khung tên bản vẽ nộp hồ sơ.",
      ),
    });
  }

  if (!project.location.trim()) {
    issues.push({
      id: "field-location",
      field: "project.location",
      severity: "error",
      question: L(
        "Where is the construction site (province/district)?",
        "สถานที่ก่อสร้างอยู่ที่ไหน (จังหวัด/อำเภอ)?",
        "निर्माण स्थल कहाँ है (राज्य/ज़िला)?",
        "Công trường ở đâu (tỉnh/huyện)?",
      ),
      reason: L(
        "Location determines local building code.",
        "สถานที่กำหนดกฎหมายท้องถิ่น",
        "स्थान स्थानीय भवन नियम निर्धारित करता है।",
        "Vị trí quyết định quy chuẩn xây dựng địa phương.",
      ),
    });
  }

  if (!project.ownerName.trim()) {
    issues.push({
      id: "field-owner",
      field: "project.ownerName",
      severity: "warning",
      question: L(
        "Owner name for the drawing set?",
        "ชื่อเจ้าของอาคารสำหรับชุดแบบ?",
        "ड्रॉइंग सेट के लिए मालिक का नाम?",
        "Tên chủ sở hữu trên bộ bản vẽ?",
      ),
      reason: L(
        "Owner name appears on every sheet.",
        "ชื่อเจ้าของปรากฏในทุกแผ่นแบบ",
        "मालिक का नाम हर शीट पर दिखता है।",
        "Tên chủ sở hữu xuất hiện trên mọi tờ bản vẽ.",
      ),
    });
  }

  if (!questionnaire.primaryMaterial.trim()) {
    issues.push({
      id: "field-material",
      field: "questionnaire.primaryMaterial",
      severity: "warning",
      question: L(
        "Primary exterior material (e.g. concrete block, brick)?",
        "วัสดุผนังภายนอกหลักคืออะไร?",
        "मुख्य बाहरी सामग्री (जैसे कंक्रीट ब्लॉक, ईंट)?",
        "Vật liệu mặt ngoài chính (ví dụ: gạch block, gạch đất nung)?",
      ),
      reason: L(
        "Material affects elevations and specs.",
        "วัสดุส่งผลต่อรูปด้านและสเปค",
        "सामग्री elevation और specs को प्रभावित करती है।",
        "Vật liệu ảnh hưởng mặt đứng và thông số kỹ thuật.",
      ),
    });
  }

  const pendingIssues = issues.filter((i) => !isResolved(i.id, answers));

  return {
    ready: pendingIssues.length === 0,
    issues: pendingIssues,
    nextQuestion: pendingIssues[0] ?? null,
    resolvedCount: issues.length - pendingIssues.length,
    totalIssues: issues.length,
  };
}

export function applyClarificationAnswer(
  answers: ClarificationAnswer[],
  issueId: string,
  value: string,
  field?: string,
): ClarificationAnswer[] {
  return [
    ...answers.filter((a) => a.issueId !== issueId),
    { issueId, field, value, timestamp: new Date().toISOString() },
  ];
}

export function mergeClarificationAnswers(
  project: ProjectInput,
  questionnaire: QuestionnaireInput,
  answers: ClarificationAnswer[],
): { project: ProjectInput; questionnaire: QuestionnaireInput } {
  const p = { ...project };
  const q = { ...questionnaire };

  for (const a of answers) {
    const key = a.field ?? a.issueId;
    if (key.includes("projectName") || a.issueId === "field-project-name") p.projectName = a.value;
    if (key.includes("location") || a.issueId === "field-location") p.location = a.value;
    if (key.includes("ownerName") || a.issueId === "field-owner") p.ownerName = a.value;
    if (key.includes("sitePlanHasDimensions") || a.issueId === "site-dimensions") {
      q.sitePlanHasDimensions = isAffirmativeAnswer(a.value);
    }
    if (key.includes("frontViewConfirmed") || a.issueId === "confirm-3d-front") {
      q.frontViewConfirmed = isAffirmativeAnswer(a.value);
    }
    if (key.includes("primaryMaterial") || a.issueId === "field-material") {
      q.primaryMaterial = a.value;
    }
    if (key.includes("specialConstraints") || a.issueId === "field-constraints-vague") {
      q.specialConstraints = a.value;
    }
  }

  return { project: p, questionnaire: q };
}
