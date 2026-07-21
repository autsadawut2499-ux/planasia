import type { StoreListingSource } from "@/lib/templates/policy";
import type { ProjectInput } from "@/lib/ai/types";
import type { StorePriceBreakdown } from "@/lib/store/pricing";

export interface StoreListing {
  id: string;
  slug: string;
  planId: string;
  ownerId: string;
  creatorBrowserId: string;
  creatorSessionUserId?: string;
  creatorIp?: string;
  creatorWorkspaceSessionId?: string;
  name: string;
  description: string;
  beds: number;
  baths: number;
  floors: 1 | 2;
  area: string;
  style: string;
  image: string;
  floorPlanUrls: string[];
  price: number;
  priceBreakdown?: StorePriceBreakdown;
  projectSnapshot?: ProjectInput;
  source: StoreListingSource;
  createdAt: string;
}
