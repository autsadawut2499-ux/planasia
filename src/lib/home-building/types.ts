/** Types for รับสร้างบ้าน (home builders / contractors). */

export type HomeBuilderStatus = "pending" | "approved" | "rejected";

export interface HomeBuilder {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  lineId: string;
  serviceAreas: string;
  yearsExperience: number;
  expertise: string;
  logoUrl: string | null;
  portfolioUrls: string[];
  companyCertificateUrl: string | null;
  verificationDocumentUrl: string | null;
  privacyAccepted: boolean;
  termsAccepted: boolean;
  status: HomeBuilderStatus;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeBuilderRegistrationInput {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  lineId: string;
  serviceAreas: string;
  yearsExperience: number;
  expertise?: string;
  logoUrl?: string | null;
  portfolioUrls: string[];
  companyCertificateUrl?: string | null;
  verificationDocumentUrl?: string | null;
  privacyAccepted: boolean;
  termsAccepted: boolean;
}

export const MAX_PORTFOLIO_IMAGES = 20;
