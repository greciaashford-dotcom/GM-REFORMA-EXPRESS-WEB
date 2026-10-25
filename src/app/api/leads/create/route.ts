import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { isPostalCodeCovered } from "@/lib/constants";
import { subscribeNewsletter } from "@/lib/marketing/engine";
import { sendEmail } from "@/lib/email/sender";
import { getEmailHeaderHtml, getEmailFooterHtml } from "@/lib/email/templates";

const leadSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(9, "Teléfono de contacto inválido"),
  serviceSlug: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  description: z.string().min(5, "Describa brevemente su necesidad"),
  estimatedBudget: z.string().optional(),
  preferredContactTime: z.string().optional(),
  preferredLocale: z.string().optional().default("es"),
  marketingConsent: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      serviceSlug,
      postalCode,
      address,
      description,
      estimatedBudget,
      preferredContactTime,
      preferredLocale,
      marketingConsent,
    } = parsed.data;

    if (postalCode && !isPostalCodeCovered(postalCode)) {
      return NextResponse.json(
        {
          success: false,
          error: `El código postal ${postalCode} se encuentra fuera de nuestra área de cobertura inicial de Madrid.`,
        },
        { status: 422 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create lead record
    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone,
        serviceSlug,
        serviceName: serviceSlug ? serviceSlug.replace(/-/g, " ") : undefined,
        postalCode,
        address,
        description,
        estimatedBudget,
        preferredContactTime,
        preferredLocale,
        marketingConsent,
        ipAddress,
        userAgent,
      },
    });

    // If customer also consented to marketing updates, register double opt-in
    if (marketingConsent) {
      try {
        await subscribeNewsletter({
          email,
          name,
          locale: preferredLocale,
          source: "quote_wizard",
          ipAddress,
          userAgent,
        });
      } catch (newsletterErr) {
        console.error("[Lead Newsletter Subscribe Error]", newsletterErr);
      }
    }

    // Send confirmation email to customer
    try {
      await sendEmail({
        to: email,
        subject: "Hemos recibido su solicitud de presupuesto - GM REFORMA EXPRESS",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${getEmailHeaderHtml("GM REFORMA EXPRESS", "Solicitud de Presupuesto Recibida")}
            <p style="font-size: 16px;">Estimado/a <strong>${name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.5;">Hemos recibido los detalles de su proyecto para el área de Madrid. Uno de nuestros técnicos especializados revisará su petición y se pondrá en contacto con usted en un plazo máximo de 24 horas laborables.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #03203d; padding: 14px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 4px 0;"><strong>Servicio:</strong> ${lead.serviceName || "Reforma general"}</p>
              <p style="margin: 4px 0;"><strong>Código Postal:</strong> ${postalCode || "Madrid"}</p>
              <p style="margin: 4px 0;"><strong>Preferencia de contacto:</strong> ${preferredContactTime || "Cualquiera"}</p>
            </div>
            ${getEmailFooterHtml()}
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[Lead Confirmation Email Error]", emailErr);
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Solicitud registrada correctamente",
    });
  } catch (error: any) {
    console.error("[Lead Create Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
