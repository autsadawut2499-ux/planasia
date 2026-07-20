import type { ReactNode } from "react";
import { PwaLoginInstallWatcher } from "@/components/pwa/PwaLoginInstallWatcher";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export function PwaProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <PwaLoginInstallWatcher />
      {children}
    </>
  );
}
