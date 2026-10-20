import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { hashPassword } from "@/lib/auth/jwt";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar la política de privacidad",
  }),
  marketingConsent: z.boolean().optional(),
  preferredLocale: z.string().default("es"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Datos del formulario incompletos" },
        { status: 400 }
      );
    }

    const { name, email, phone, password, marketingConsent, preferredLocale } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con esa dirección de correo." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = `verif_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Create user and profile (STRICTLY ROLE: CUSTOMER)
    const user = await db.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: "CUSTOMER", // Public registration NEVER assigns administrative privileges!
        isEmailVerified: false,
        verificationToken,
        customerProfile: {
          create: {
            phone: phone || null,
            preferredLocale,
            electronicInvoiceConsent: true,
            marketingConsent: Boolean(marketingConsent),
          },
        },
      },
    });

    // Schedule verification email outbox event
    await db.outboxEvent.create({
      data: {
        eventType: "VERIFICATION_EMAIL_SEND",
        payload: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          verificationToken,
          locale: preferredLocale,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta creada. Por favor, revise su correo para activarla.",
      userId: user.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error en el servidor al procesar el registro" },
      { status: 500 }
    );
  }
}
