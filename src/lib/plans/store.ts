export { savePlanDocument, loadPlanDocument } from "@/lib/supabase/plans";
import { randomBytes } from "crypto";

export function createPlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
