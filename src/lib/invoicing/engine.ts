import db from "../db";
import { BRAND } from "../constants";
import { TestInvoiceProvider } from "./test-provider";
import { CreateInvoiceParams, InvoiceIssuer, InvoiceProvider } from "./types";

function getProvider(): InvoiceProvider {
  return new TestInvoiceProvider();
}

export async function issueInvoiceForPayment(params: CreateInvoiceParams) {
  // 1. Fetch current Site Settings
  let settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await db.siteSettings.create({
      data: {
        id: "default",
        commercialName: BRAND.commercialName,
        taxId: BRAND.taxId,
        taxIdVerified: false,
        taxIdNotes: BRAND.taxIdWarning,
        phone: BRAND.phone,
        phoneVisible: BRAND.phoneVisible,
        email: BRAND.email,
        commercialArea: BRAND.area,
        whatsappUrl: BRAND.whatsappUrl,
      },
    });
  }

  // 2. Strict compliance check: Is real fiscal issuance enabled and verified?
  const canIssueRealFiscal =
    settings.fiscalIssuanceEnabled &&
    settings.taxIdVerified &&
    Boolean(settings.legalName?.trim()) &&
    Boolean(settings.taxAddress?.trim());

  const isTest = !canIssueRealFiscal;
  const fiscalStatus = canIssueRealFiscal ? "ISSUED" : "TEST_MODE";

  // 3. Determine series and next number
  const series = params.type === "RECTIFICATIVE" ? "R2026" : "F2026";

  const latestInvoice = await db.invoice.findFirst({
    where: { series },
    orderBy: { number: "desc" },
  });

  const nextNumber = (latestInvoice?.number || 0) + 1;
  const fullNumber = `${series}-${String(nextNumber).padStart(5, "0")}`;

  // 4. Create issuer snapshot
  const issuerSnapshot: InvoiceIssuer = {
    commercialName: settings.commercialName,
    legalName: settings.legalName || "GM REFORMA EXPRESS (Titular persona física)",
    taxId: settings.taxId,
    taxIdVerified: settings.taxIdVerified,
    address: settings.taxAddress || "Madrid, España (Dirección fiscal pendiente de confirmación)",
    phone: settings.phone,
    email: settings.email,
  };

  // 5. Invoke provider
  const provider = getProvider();
  const providerResult = await provider.issueInvoice({
    invoiceNumber: fullNumber,
    series,
    issueDate: new Date(),
    issuer: issuerSnapshot,
    recipient: params.recipient,
    lines: params.lines,
    subtotalCents: params.subtotalCents,
    vatRatePercent: params.vatRatePercent,
    vatAmountCents: params.vatAmountCents,
    totalCents: params.totalCents,
    currency: params.currency || "EUR",
    isTest,
  });

  // 6. Persist invoice to database in a transaction
  const invoice = await db.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        paymentId: params.paymentId,
        quoteId: params.quoteId,
        customerId: params.customerId,
        series,
        number: nextNumber,
        fullNumber,
        type: params.type || "STANDARD",
        rectifiesInvoiceId: params.rectifiesInvoiceId,
        rectificationReason: params.rectificationReason,
        issueDate: new Date(),
        operationDate: new Date(),
        subtotalCents: params.subtotalCents,
        vatRatePercent: params.vatRatePercent,
        vatAmountCents: params.vatAmountCents,
        totalCents: params.totalCents,
        currency: params.currency || "EUR",
        isDraftOrTest: isTest,
        fiscalStatus,
        issuerSnapshot: JSON.stringify(issuerSnapshot),
        recipientSnapshot: JSON.stringify(params.recipient),
        pdfUrl: providerResult.pdfUrl,
        fiscalProvider: provider.name,
        fiscalProviderId: providerResult.providerId,
        lines: {
          create: params.lines.map((l) => ({
            concept: l.concept,
            quantity: l.quantity,
            unitPriceCents: l.unitPriceCents,
            vatRatePercent: l.vatRatePercent,
            vatAmountCents: l.vatAmountCents,
            totalCents: l.totalCents,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    // Create durable outbox event for email delivery of the invoice
    await tx.outboxEvent.create({
      data: {
        eventType: "INVOICE_DELIVERY",
        payload: JSON.stringify({
          invoiceId: created.id,
          recipientEmail: params.recipient.email,
          fullNumber,
          totalCents: params.totalCents,
          isTest,
        }),
      },
    });

    return created;
  });

  return {
    invoice,
    providerResult,
    isTestDocument: isTest,
  };
}
