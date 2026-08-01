import { redirect } from "next/navigation";

/** Legacy path — keep bookmarks working. */
export default function PlanIncludesRedirectPage() {
  redirect("/whats-included");
}
