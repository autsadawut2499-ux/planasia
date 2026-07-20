import type { Metadata } from "next";
import { Suspense } from "react";
import { buildWorkspaceMetadata } from "@/lib/seo/metadata";
import WorkspacePage from "./WorkspaceClient";

export const metadata: Metadata = buildWorkspaceMetadata();

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <WorkspacePage />
    </Suspense>
  );
}
