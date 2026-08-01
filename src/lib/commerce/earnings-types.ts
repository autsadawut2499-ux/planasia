/** Shared (client-safe) types for the vendor earnings / commission ledger. */

export type EarningStatus = "pending" | "available" | "paid_out";

export interface VendorEarning {
  id: string;
  ownerKey: string;
  listingId: string;
  cartOrderId: string;
  grossThb: number;
  vendorAmountThb: number;
  platformAmountThb: number;
  vendorShare: number;
  platformShare: number;
  currency: string;
  status: EarningStatus;
  createdAt: string;
  paidOutAt?: string;
  paidOutBy?: string;
  payoutBatchId?: string;
  payoutNote?: string;
}

export interface VendorEarningsSummary {
  salesCount: number;
  grossThb: number;
  vendorEarnedThb: number;
  platformFeeThb: number;
  pendingThb: number;
  availableThb: number;
  paidOutThb: number;
  recent: VendorEarning[];
}

/** One vendor row for admin payout ops. */
export interface VendorPayoutDueRow {
  ownerKey: string;
  displayName: string | null;
  contactEmail: string | null;
  availableThb: number;
  availableLineCount: number;
  paidOutThb: number;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  promptPay?: string;
  hasBankDetails: boolean;
  earningIds: string[];
}

export interface PayoutBatch {
  id: string;
  createdAt: string;
  createdBy: string;
  note?: string;
  ownerKeys: string[];
  earningIds: string[];
  vendorTotalThb: number;
  lineCount: number;
}
