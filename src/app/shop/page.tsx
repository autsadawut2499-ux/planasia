import { permanentRedirect } from "next/navigation";

/** /shop is deprecated — canonical marketplace is /store. */
export default function ShopRedirectPage() {
  permanentRedirect("/store");
}
