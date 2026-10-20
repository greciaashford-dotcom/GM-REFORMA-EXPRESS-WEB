import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import db from "@/lib/db";
import { issueInvoiceForPayment } from "@/lib/invoicing/engine";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  // If webhook secret is configured, verify signature
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("[STRIPE WEBHOOK SIGNATURE ERROR]", err.message);
      return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 400 });
    }
  } else {
    // In production, signature verification is strictly required
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Firma de webhook requerida en producción" }, { status: 400 });
    }
    // If running in development without stripe CLI secret
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Cuerpo de evento JSON inválido" }, { status: 400 });
    }
  }

  // Deduplication check: Has this event already been processed?
  const existingEvent = await db.providerWebhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent) {
    console.info(`[STRIPE WEBHOOK] Evento duplicado ignorado: ${event.id}`);
    return NextResponse.json({ received: true, deduplicated: true });
  }

  // Record webhook event in DB
  await db.providerWebhookEvent.create({
    data: {
      eventId: event.id,
      provider: "stripe",
      eventType: event.type,
      payload: rawBody,
      status: "processing",
    },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId || session.client_reference_id;

      if (paymentId) {
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

        if (payment && payment.status !== "SUCCEEDED") {
          // Check amount and currency match
          const sessionAmount = session.amount_total || 0;
          if (sessionAmount === payment.amountCents) {
            await db.payment.update({
              where: { id: payment.id },
              data: {
                status: "SUCCEEDED",
                stripePaymentIntentId: (session.payment_intent as string) || null,
                paidAt: new Date(),
              },
            });

            // Automatically issue invoice
            const lines = payment.quote?.versions[0]?.lines?.map((l) => ({
              concept: l.concept,
              quantity: l.quantity,
              unitPriceCents: l.unitPriceCents,
              vatRatePercent: 10,
              vatAmountCents: Math.round(l.totalCents * 0.1),
              totalCents: Math.round(l.totalCents * 1.1),
            })) || [
              {
                concept: `Abono de obra s/presupuesto ${payment.quote?.quoteNumber || payment.paymentNumber}`,
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
                address: payment.customer.customerProfile?.billingAddress || "Madrid",
                postalCode: payment.customer.customerProfile?.billingPostalCode || "28001",
                city: "Madrid",
                country: "ES",
              },
            });
          }
        }
      }
    }

    // Mark event as processed
    await db.providerWebhookEvent.update({
      where: { eventId: event.id },
      data: { status: "processed" },
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[STRIPE WEBHOOK PROCESSING ERROR]", err);
    return NextResponse.json({ error: "Error al procesar evento de webhook" }, { status: 500 });
  }
}
