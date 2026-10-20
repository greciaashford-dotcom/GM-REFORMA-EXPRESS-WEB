import { InvoiceProvider, InvoiceProviderResult } from "./types";

export class TestInvoiceProvider implements InvoiceProvider {
  name = "test-adapter";

  async issueInvoice(params: {
    invoiceNumber: string;
    series: string;
    issueDate: Date;
    issuer: any;
    recipient: any;
    lines: any[];
    subtotalCents: number;
    vatRatePercent: number;
    vatAmountCents: number;
    totalCents: number;
    currency: string;
    isTest: boolean;
    rectifiesInvoiceNumber?: string;
  }): Promise<InvoiceProviderResult> {
    const isTestDoc = true; // Always true for test adapter or unverified fiscal data
    const watermarkText = "PRUEBA / NO VÁLIDO COMO FACTURA FISCAL";

    const simulatedDocId = `TEST-DOC-${params.series}-${params.invoiceNumber}-${Date.now()}`;
    const pdfUrl = `/api/invoices/documents/${simulatedDocId}?test=true`;

    return {
      success: true,
      providerId: simulatedDocId,
      pdfUrl,
      isTestDocument: isTestDoc,
      watermarkText,
    };
  }
}
