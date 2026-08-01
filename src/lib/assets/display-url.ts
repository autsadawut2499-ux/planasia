import { isPrivateAssetRef } from "@/lib/supabase/private-asset-ref";

/** Client-safe: map stored asset refs to a browser-loadable URL. */
export function displayAssetUrl(url: string): string {
  if (!url) return url;
  if (isPrivateAssetRef(url)) {
    return `/api/vendor/assets/view?ref=${encodeURIComponent(url)}`;
  }
  return url;
}
