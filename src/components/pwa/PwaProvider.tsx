import type { ReactNode } from "react";
import { PwaMobileInstallWatcher } from "@/components/pwa/PwaMobileInstallWatcher";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export function PwaProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <PwaMobileInstallWatcher />
      {children}
    </>
  );
}
