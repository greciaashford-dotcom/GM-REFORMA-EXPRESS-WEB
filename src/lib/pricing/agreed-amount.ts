import db from "../db";

export interface VerificationResult {
  canPay: boolean;
  match: boolean;
  reason: string;
  quoteId?: string;
  verifiedAmountCents?: number;
  currency?: string;
  verificationRequestId?: string;
}

/**
 * Validates the customer-entered agreed amount against actual database quotes.
 * Always works in integer cents.
 */
export async function verifyCustomerAgreedAmount(params: {
  customerId: string;
  quoteReference: string;
  inputAmountCents: number;
  serviceKey?: string;
}): Promise<VerificationResult> {
  const { customerId, quoteReference, inputAmountCents, serviceKey } = params;

  if (inputAmountCents <= 0) {
    return {
      canPay: false,
      match: false,
      reason: "El importe debe ser superior a cero.",
    };
  }

  const cleanRef = quoteReference.trim().toUpperCase();

  // Search for the quote in database belonging to this customer
  const quote = await db.quote.findFirst({
    where: {
      customerId,
      OR: [
        { quoteNumber: cleanRef },
        { id: cleanRef },
      ],
    },
    include: {
      payments: {
        where: {
          status: "SUCCEEDED",
        },
      },
    },
  });

  if (!quote) {
    // No matching approved quote found for this customer -> create verification request for admin
    const request = await db.agreedAmountVerificationRequest.create({
      data: {
        customerId,
        quoteReference: cleanRef,
        serviceKey,
        inputAmountCents,
        status: "MISMATCH_ALERT",
        discrepancyDetails: `No se encontró ningún presupuesto con la referencia '${cleanRef}' asociado a este cliente.`,
      },
    });

    return {
      canPay: false,
      match: false,
      reason:
        "No existe ningún presupuesto aprobado con esa referencia para su cuenta. Se ha enviado una solicitud de revisión al equipo de administración.",
      verificationRequestId: request.id,
    };
  }

  // Check if quote is approved/accepted or sent
  if (quote.status !== "ACCEPTED" && quote.status !== "SENT") {
    const request = await db.agreedAmountVerificationRequest.create({
      data: {
        customerId,
        quoteReference: cleanRef,
        serviceKey,
        inputAmountCents,
        status: "MISMATCH_ALERT",
        discrepancyDetails: `El presupuesto '${quote.quoteNumber}' existe pero su estado actual es '${quote.status}' (requiere estado ACCEPTED o SENT).`,
      },
    });

    return {
      canPay: false,
      match: false,
      reason: `El presupuesto '${quote.quoteNumber}' se encuentra en estado '${quote.status}'. Debe estar aprobado y activo antes de proceder al pago.`,
      verificationRequestId: request.id,
    };
  }

  // Calculate already paid amount
  const alreadyPaidCents = quote.payments.reduce((acc, p) => acc + p.amountCents, 0);
  const remainingBalanceCents = quote.totalCents - alreadyPaidCents;

  if (remainingBalanceCents <= 0) {
    return {
      canPay: false,
      match: false,
      reason: `El presupuesto '${quote.quoteNumber}' ya ha sido liquidado en su totalidad.`,
    };
  }

  // Exact match check: Does inputAmountCents match the remaining balance or the full quote total?
  const isExactMatch = inputAmountCents === remainingBalanceCents || inputAmountCents === quote.totalCents;

  if (!isExactMatch) {
    // Mismatch detected! Block payment and notify admin
    const request = await db.agreedAmountVerificationRequest.create({
      data: {
        customerId,
        quoteReference: cleanRef,
        serviceKey,
        inputAmountCents,
        status: "MISMATCH_ALERT",
        discrepancyDetails: `Discrepancia de importe: el cliente introdujo ${ (inputAmountCents / 100).toFixed(2) } € pero el saldo exigible en base de datos es ${ (remainingBalanceCents / 100).toFixed(2) } € (Total presupuesto: ${ (quote.totalCents / 100).toFixed(2) } €).`,
      },
    });

    return {
      canPay: false,
      match: false,
      quoteId: quote.id,
      reason: `El importe introducido (${ (inputAmountCents / 100).toFixed(2) } €) no coincide con el saldo exigible de la base de datos (${ (remainingBalanceCents / 100).toFixed(2) } €). Se ha bloqueado el cobro y generado una solicitud de validación para el administrador.`,
      verificationRequestId: request.id,
    };
  }


  // Valid match! Record verification success
  const request = await db.agreedAmountVerificationRequest.create({
    data: {
      customerId,
      quoteReference: cleanRef,
      serviceKey,
      inputAmountCents: remainingBalanceCents, // Verified DB amount!
      status: "MATCHED",
      discrepancyDetails: "Coincidencia exacta validada contra presupuesto aprobado en base de datos.",
    },
  });

  return {
    canPay: true,
    match: true,
    reason: "Importe y presupuesto validados correctamente contra la base de datos.",
    quoteId: quote.id,
    verifiedAmountCents: remainingBalanceCents, // Always returns server-verified cents!
    currency: quote.currency,
    verificationRequestId: request.id,
  };
}

export function parseCurrencyToCents(val: string | number): number {
  if (typeof val === "number") {
    return Math.round(val * 100);
  }
  const clean = val
    .replace(/[^\d.,]/g, "")
    .replace(/\.(?=\d{3})/g, "") // Remove thousands dot
    .replace(",", "."); // Convert decimal comma to dot
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function formatCurrency(cents: number, locale = "es-ES", currency = "EUR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export const verifyAgreedAmount = async (params: {
  customerId: string;
  quoteReference: string;
  inputAmountCents: number;
  serviceKey?: string;
}) => {
  const res = await verifyCustomerAgreedAmount(params);
  const quote = res.quoteId
    ? await db.quote.findUnique({ where: { id: res.quoteId } })
    : null;

  return {
    isValid: res.canPay && res.match,
    quote,
    discrepancy: !res.match
      ? {
          differenceCents: quote ? Math.abs(quote.totalCents - params.inputAmountCents) : params.inputAmountCents,
          reason: res.reason,
        }
      : undefined,
    result: res,
  };
};

