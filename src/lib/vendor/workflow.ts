import type { VendorDashboardData } from "@/hooks/useVendorDashboard";

export type VendorStepId = "profile" | "listings" | "payout" | "verification";

export interface VendorWorkflowStep {
  id: VendorStepId;
  /** 1-based position — identity verification is always last. */
  step: number;
  label: string;
  /** What the vendor must do, shown when the step is still open. */
  todo: string;
  done: boolean;
}

/**
 * The onboarding order a vendor must follow. Identity verification sits at the
 * end on purpose: everything else can be prepared first, and passing KYC is
 * what releases the finished work to the marketplace.
 */
export function buildVendorWorkflow(data: VendorDashboardData | null): VendorWorkflowStep[] {
  const profile = data?.profile;
  const payout = data?.payout;

  const profileDone = Boolean(profile?.displayName?.trim() && profile?.avatarUrl);
  const listingsDone = (data?.listings.length ?? 0) > 0;
  const payoutDone = Boolean(
    payout?.bankName?.trim() &&
      payout?.accountName?.trim() &&
      payout?.accountNumber?.trim(),
  );

  return [
    {
      id: "profile",
      step: 1,
      label: "โปรไฟล์และรูปภาพ",
      todo: "กรอกชื่อที่แสดงและอัปโหลดรูปโปรไฟล์",
      done: profileDone,
    },
    {
      id: "listings",
      step: 2,
      label: "อัปโหลดผลงาน / แบบบ้าน",
      todo: "ส่งแบบบ้านพร้อมไฟล์แปลนและ BOQ อย่างน้อย 1 รายการ",
      done: listingsDone,
    },
    {
      id: "payout",
      step: 3,
      label: "ข้อมูลรับเงินและบัญชีธนาคาร",
      todo: "กรอกบัญชีธนาคารสำหรับรับรายได้",
      done: payoutDone,
    },
    {
      id: "verification",
      step: 4,
      label: "ยืนยันตัวตน",
      todo: "ส่งเอกสารยืนยันตัวตนเพื่อเผยแพร่ผลงานทั้งหมด",
      done: Boolean(data?.kycApproved),
    },
  ];
}

/** Steps that must be finished before identity verification can be submitted. */
export function unmetPrerequisites(steps: VendorWorkflowStep[]): VendorWorkflowStep[] {
  return steps.filter((s) => s.id !== "verification" && !s.done);
}
