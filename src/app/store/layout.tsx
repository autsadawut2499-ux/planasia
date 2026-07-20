import { Suspense } from "react";
import { StoreCartShell } from "@/components/store/StoreCartShell";
import { StoreFavoritesDrawer } from "@/components/store/StoreFavoritesDrawer";
import { StoreBrowseProvider } from "@/context/StoreBrowseContext";
import { StoreCartProvider } from "@/context/StoreCartContext";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreCartProvider>
      <StoreBrowseProvider>
        {children}
        <Suspense fallback={null}>
          <StoreCartShell />
        </Suspense>
        <StoreFavoritesDrawer />
      </StoreBrowseProvider>
    </StoreCartProvider>
  );
}
