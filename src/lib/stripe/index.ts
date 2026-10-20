import Stripe from "stripe";
import db from "../db";
import { BRAND } from "../constants";

const stripeApiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";

export const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2024-09-30.acacia" as any,
  typescript: true,
});

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder"));
}

export function isStripeLiveMode(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_"));
}

export async function createCheckoutSessionForQuote(params: {
  quoteId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  amountCents: number; // Server-verified amount in cents!
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  milestoneId?: string;
}) {
  const { quoteId, customerId, customerEmail, customerName, amountCents, currency = "eur", successUrl, cancelUrl, milestoneId } = params;

  // Verify quote in DB
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote || quote.customerId !== customerId) {
    throw new Error("Presupuesto no encontrado o no pertenece al usuario autenticado.");
  }

  // Generate an idempotency key
  const idempotencyKey = `PAY-${quote.quoteNumber}-${Date.now()}`;

  // Pre-create Payment record in PENDING state
  const payment = await db.payment.create({
    data: {
      paymentNumber: idempotencyKey,
      customerId,
      quoteId,
      milestoneId,
      amountCents,
      currency: currency.toUpperCase(),
      status: "PENDING",
      idempotencyKey,
      method: "stripe_checkout",
    },
  });

  // If Stripe is not fully configured with real keys, provide mock checkout flow for development/testing
  if (!isStripeConfigured()) {
    const mockSessionId = `mock_session_${payment.id}`;
    await db.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: mockSessionId },
    });

    return {
      sessionId: mockSessionId,
      url: `/api/payments/mock-checkout?paymentId=${payment.id}&successUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`,
      paymentId: payment.id,
      isMock: true,
    };
  }

  // Real Stripe Checkout Session creation
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: customerEmail,
    client_reference_id: payment.id,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Pago de obras: ${quote.title} (${quote.quoteNumber})`,
            description: `GM REFORMA EXPRESS — Pago asociado al presupuesto ${quote.quoteNumber}. Titular: ${customerName}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cancelUrl}?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      paymentId: payment.id,
      quoteId: quote.id,
      customerId,
      milestoneId: milestoneId || "",
    },
  });

  await db.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: session.id },
  });

  return {
    sessionId: session.id,
    url: session.url,
    paymentId: payment.id,
    isMock: false,
  };
}
