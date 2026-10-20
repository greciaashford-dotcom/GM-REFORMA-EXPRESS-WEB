import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { issueInvoiceForPayment } from "@/lib/invoicing/engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const successUrl = searchParams.get("successUrl");

  if (!paymentId || !successUrl) {
    return NextResponse.json({ error: "Parámetros de checkout no válidos" }, { status: 400 });
  }

  // Find payment
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      quote: {
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            include: { lines: true },
          },
        },
      },
      customer: {
        include: { customerProfile: true },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  // Idempotency: If already succeeded, simply redirect
  if (payment.status === "SUCCEEDED") {
    return NextResponse.redirect(successUrl);
  }

  // Mark payment as SUCCEEDED
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCEEDED",
      paidAt: new Date(),
    },
  });

  // Automatically trigger invoice creation
  const lines = payment.quote?.versions[0]?.lines?.map((l) => ({
    concept: l.concept,
    quantity: l.quantity,
    unitPriceCents: l.unitPriceCents,
    vatRatePercent: 10,
    vatAmountCents: Math.round(l.totalCents * 0.1),
    totalCents: Math.round(l.totalCents * 1.1),
  })) || [
    {
      concept: `Abono de obra según presupuesto ${payment.quote?.quoteNumber || payment.paymentNumber}`,
      quantity: 1,
      unitPriceCents: Math.round(payment.amountCents / 1.1),
      vatRatePercent: 10,
      vatAmountCents: payment.amountCents - Math.round(payment.amountCents / 1.1),
      totalCents: payment.amountCents,
    },
  ];

  const subtotalCents = Math.round(payment.amountCents / 1.1);
  const vatAmountCents = payment.amountCents - subtotalCents;

  await issueInvoiceForPayment({
    paymentId: payment.id,
    quoteId: payment.quoteId || undefined,
    customerId: payment.customerId,
    lines,
    subtotalCents,
    vatRatePercent: 10,
    vatAmountCents,
    totalCents: payment.amountCents,
    recipient: {
      name: payment.customer.name,
      email: payment.customer.email,
      address: payment.customer.customerProfile?.billingAddress || payment.customer.customerProfile?.workAddress || "Madrid",
      taxId: payment.customer.customerProfile?.billingTaxId || undefined,
      postalCode: payment.customer.customerProfile?.billingPostalCode || payment.customer.customerProfile?.workPostalCode || "28001",
      city: "Madrid",
      country: "ES",
    },
  });

  return NextResponse.redirect(successUrl);
}
