import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyCustomerAgreedAmount } from "@/lib/pricing/agreed-amount";
import { z } from "zod";

const verifySchema = z.object({
  quoteReference: z.string().min(1),
  inputAmountCents: z.number().int().positive(),
  serviceKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Debe iniciar sesión para verificar un presupuesto" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos de validación incorrectos. El importe debe ser un número entero positivo en céntimos." },
        { status: 400 }
      );
    }

    const { quoteReference, inputAmountCents, serviceKey } = parsed.data;

    // Call server-side verification engine
    const result = await verifyCustomerAgreedAmount({
      customerId: user.id,
      quoteReference,
      inputAmountCents,
      serviceKey,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error en el servidor al verificar el importe acordado" },
      { status: 500 }
    );
  }
}
