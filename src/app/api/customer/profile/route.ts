import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  phone: z.string().optional(),
  workAddress: z.string().optional(),
  workPostalCode: z.string().optional(),
  workCity: z.string().optional().default("Madrid"),
  billingName: z.string().optional(),
  billingTaxId: z.string().optional(),
  billingAddress: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
  preferredLocale: z.string().optional().default("es"),
  electronicInvoiceConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { customerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.customerProfile,
        customerProfile: user.customerProfile,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Update User name
    await db.user.update({
      where: { id: session.user.id },
      data: { name: data.name },
    });

    // Upsert CustomerProfile
    const profile = await db.customerProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        phone: data.phone,
        workAddress: data.workAddress,
        workPostalCode: data.workPostalCode,
        workCity: data.workCity || "Madrid",
        billingName: data.billingName,
        billingTaxId: data.billingTaxId,
        billingAddress: data.billingAddress,
        billingPostalCode: data.billingPostalCode,
        billingCity: data.billingCity,
        preferredLocale: data.preferredLocale,
        electronicInvoiceConsent: data.electronicInvoiceConsent || false,
        marketingConsent: data.marketingConsent || false,
      },
      update: {
        phone: data.phone,
        workAddress: data.workAddress,
        workPostalCode: data.workPostalCode,
        workCity: data.workCity || "Madrid",
        billingName: data.billingName,
        billingTaxId: data.billingTaxId,
        billingAddress: data.billingAddress,
        billingPostalCode: data.billingPostalCode,
        billingCity: data.billingCity,
        preferredLocale: data.preferredLocale,
        ...(data.electronicInvoiceConsent !== undefined
          ? { electronicInvoiceConsent: data.electronicInvoiceConsent }
          : {}),
        ...(data.marketingConsent !== undefined
          ? { marketingConsent: data.marketingConsent }
          : {}),
      },
    });

    // Record GDPR consent changes
    if (data.marketingConsent !== undefined || data.electronicInvoiceConsent !== undefined) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const ua = req.headers.get("user-agent") || "unknown";

      if (data.marketingConsent !== undefined) {
        await db.consentRecord.create({
          data: {
            subject: session.user.email,
            purpose: "marketing_profile_toggle",
            granted: data.marketingConsent,
            locale: data.preferredLocale || "es",
            version: "1.0",
            ipAddress: ip,
            userAgent: ua,
          },
        });
      }

      if (data.electronicInvoiceConsent !== undefined) {
        await db.consentRecord.create({
          data: {
            subject: session.user.email,
            purpose: "electronic_invoicing",
            granted: data.electronicInvoiceConsent,
            locale: data.preferredLocale || "es",
            version: "1.0",
            ipAddress: ip,
            userAgent: ua,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
