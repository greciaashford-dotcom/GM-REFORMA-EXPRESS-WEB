import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createCheckoutSessionForQuote } from "@/lib/stripe";
import db from "@/lib/db";
import { BRAND } from "@/lib/constants";
import { z } from "zod";

const checkoutSchema = z.object({
  quoteId: z.string().min(1),
  milestoneId: z.string().optional(),
  locale: z.string().default("es"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos de solicitud inválidos" }, { status: 400 });
    }

    const { quoteId, milestoneId, locale } = parsed.data;

    // Fetch quote from DB verifying customer ownership
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        payments: {
          where: { status: "SUCCEEDED" },
        },
      },
    });

    if (!quote || quote.customerId !== user.id) {
      return NextResponse.json(
        { error: "Presupuesto no encontrado o no pertenece al usuario autenticado." },
        { status: 403 }
      );
    }

    // Check quote status
    if (quote.status !== "ACCEPTED" && quote.status !== "SENT") {
      return NextResponse.json(
        { error: `El presupuesto se encuentra en estado '${quote.status}'. Debe estar aprobado para admitir cobros.` },
        { status: 400 }
      );
    }

    // Calculate verified database remaining balance in cents
    const alreadyPaidCents = quote.payments.reduce((acc, p) => acc + p.amountCents, 0);
    const remainingBalanceCents = quote.totalCents - alreadyPaidCents;

    if (remainingBalanceCents <= 0) {
      return NextResponse.json(
        { error: "Este presupuesto ya se encuentra totalmente liquidado." },
        { status: 400 }
      );
    }

    const siteUrl = BRAND.siteUrl;
    const successUrl = `${siteUrl}/${locale}/cliente/presupuestos/pago-completado`;
    const cancelUrl = `${siteUrl}/${locale}/cliente/presupuestos`;

    // Create session strictly using the verified database balance in integer cents
    const result = await createCheckoutSessionForQuote({
      quoteId: quote.id,
      customerId: user.id,
      customerEmail: user.email,
      customerName: user.name,
      amountCents: remainingBalanceCents, // Server-verified DB cents!
      currency: quote.currency.toLowerCase(),
      successUrl,
      cancelUrl,
      milestoneId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error al inicializar sesión de pago" },
      { status: 500 }
    );
  }
}
