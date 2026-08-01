import fs from "fs";

const p = "src/lib/i18n/index.ts";
let s = fs.readFileSync(p, "utf8");

s = s.replaceAll(
  '"inputStage.fileFormats": "JPG or PNG"',
  '"inputStage.fileFormats": "PNG, JPEG, or PDF"',
);
s = s.replaceAll(
  '"inputStage.fileFormats": "รองรับ JPG และ PNG"',
  '"inputStage.fileFormats": "รองรับ PNG, JPEG และ PDF"',
);
s = s.replaceAll(
  '"inputStage.bothReady": "Both images ready. AI will lock your geometry and enhance materials and lighting."',
  '"inputStage.bothReady": "All 3 assets ready. AI will lock geometry from both floor plans and the elevation."',
);
s = s.replaceAll(
  '"inputStage.needBoth": "Upload both a floor plan and a front elevation to continue."',
  '"inputStage.needBoth": "Upload first floor plan, second floor plan, and front elevation to continue."',
);
s = s.replaceAll(
  '"inputStage.bothReady": "พร้อมทั้งสองภาพแล้ว AI จะล็อกโครงสร้างและปรับวัสดุกับแสงให้"',
  '"inputStage.bothReady": "ครบทั้ง 3 ไฟล์แล้ว AI จะล็อกโครงสร้างจากแปลนทั้งสองชั้นและรูปหน้าบ้าน"',
);
s = s.replaceAll(
  '"inputStage.needBoth": "อัปโหลดทั้งแปลนและรูปหน้าตรงเพื่อดำเนินการต่อ"',
  '"inputStage.needBoth": "อัปโหลดแปลนชั้น 1, แปลนชั้น 2 และรูปหน้าบ้านเพื่อดำเนินการต่อ"',
);

if (!s.includes('"inputStage.floorPlan1": "First floor plan"')) {
  s = s.replace(
    '"inputStage.floorPlanHint": "Line drawing or sketch of the floor layout",\n    "inputStage.elevation":',
    '"inputStage.floorPlanHint": "Line drawing or sketch of the floor layout",\n    "inputStage.floorPlan1": "First floor plan",\n    "inputStage.floorPlan1Hint": "Ground floor / แปลนชั้น 1 — PNG, JPEG, or PDF",\n    "inputStage.floorPlan2": "Second floor plan",\n    "inputStage.floorPlan2Hint": "Upper floor / แปลนชั้น 2 — PNG, JPEG, or PDF",\n    "inputStage.elevation":',
  );
}

if (!s.includes('"inputStage.floorPlan1": "แปลนชั้น 1"')) {
  s = s.replace(
    '"inputStage.floorPlanHint": "ไฟล์แปลนชั้นลายเส้น ใช้กำหนดโครงสร้างและสัดส่วนห้อง",\n    "inputStage.elevation":',
    '"inputStage.floorPlanHint": "ไฟล์แปลนชั้นลายเส้น ใช้กำหนดโครงสร้างและสัดส่วนห้อง",\n    "inputStage.floorPlan1": "แปลนชั้น 1",\n    "inputStage.floorPlan1Hint": "ผังพื้นชั้นล่าง — รองรับ PNG, JPEG, PDF",\n    "inputStage.floorPlan2": "แปลนชั้น 2",\n    "inputStage.floorPlan2Hint": "ผังพื้นชั้นบน — รองรับ PNG, JPEG, PDF",\n    "inputStage.elevation":',
  );
}

s = s.replaceAll(
  '"inputStage.floorPlanHint": "Line drawing — room proportions and layout",\n    "inputStage.elevation":',
  '"inputStage.floorPlanHint": "Line drawing — room proportions and layout",\n    "inputStage.floorPlan1": "First floor plan",\n    "inputStage.floorPlan1Hint": "Ground floor — PNG, JPEG, or PDF",\n    "inputStage.floorPlan2": "Second floor plan",\n    "inputStage.floorPlan2Hint": "Upper floor — PNG, JPEG, or PDF",\n    "inputStage.elevation":',
);

fs.writeFileSync(p, s);
const count = (s.match(/"inputStage\.floorPlan1":/g) || []).length;
console.log("floorPlan1 keys:", count);
