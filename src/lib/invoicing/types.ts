export interface InvoiceRecipient {
  name: string;
  taxId?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  email: string;
}

export interface InvoiceIssuer {
  commercialName: string;
  legalName?: string;
  taxId: string;
  taxIdVerified: boolean;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface InvoiceLineItem {
  concept: string;
  quantity: number;
  unitPriceCents: number;
  vatRatePercent: number;
  vatAmountCents: number;
  totalCents: number;
}

export interface CreateInvoiceParams {
  paymentId?: string;
  quoteId?: string;
  customerId: string;
  type?: "STANDARD" | "ADVANCE" | "MILESTONE" | "RECTIFICATIVE";
  rectifiesInvoiceId?: string;
  rectificationReason?: string;
  lines: InvoiceLineItem[];
  subtotalCents: number;
  vatRatePercent: number;
  vatAmountCents: number;
  totalCents: number;
  currency?: string;
  recipient: InvoiceRecipient;
}

export interface InvoiceProviderResult {
  success: boolean;
  providerId: string;
  pdfUrl?: string;
  isTestDocument: boolean;
  watermarkText?: string;
  error?: string;
}

export interface InvoiceProvider {
  name: string;
  issueInvoice(params: {
    invoiceNumber: string;
    series: string;
    issueDate: Date;
    issuer: InvoiceIssuer;
    recipient: InvoiceRecipient;
    lines: InvoiceLineItem[];
    subtotalCents: number;
    vatRatePercent: number;
    vatAmountCents: number;
    totalCents: number;
    currency: string;
    isTest: boolean;
    rectifiesInvoiceNumber?: string;
  }): Promise<InvoiceProviderResult>;
}
