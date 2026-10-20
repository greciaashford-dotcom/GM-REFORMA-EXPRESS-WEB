import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/marketing/engine";
import { sendEmail } from "@/lib/email/sender";
import { doubleOptInTemplate } from "@/lib/email/templates";
import { BRAND, Locale } from "@/lib/constants";

const subscribeSchema = z.object({
  email: z.string().email("Dirección de correo electrónico inválida"),
  name: z.string().optional(),
  locale: z.enum(["es", "en", "fr", "de"]).optional().default("es"),
  interests: z.array(z.string()).optional(),
  source: z.string().optional().default("web_footer"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { email, name, locale, interests, source } = parsed.data;

    const result = await subscribeToNewsletter({
      email,
      name,
      locale,
      interests,
      source,
      ipAddress,
      userAgent,
    });

    if (result.status === "ALREADY_CONFIRMED") {
      return NextResponse.json({
        success: true,
        status: "ALREADY_CONFIRMED",
        message: "Esta dirección ya se encuentra suscrita y verificada.",
      });
    }

    // Send the double opt-in email
    const confirmUrl = `${BRAND.siteUrl}/${locale}/newsletter/confirmar?token=${result.subscriber.doubleOptInToken}`;
    const emailData = doubleOptInTemplate({
      confirmUrl,
      locale: locale as Locale,
    });

    try {
      await sendEmail({
        to: email,
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (mailErr) {
      console.error("[Double Opt-In Email Error]", mailErr);
    }

    return NextResponse.json({
      success: true,
      status: "PENDING_CONFIRMATION",
      message: "Hemos enviado un enlace de confirmación a su correo para verificar la suscripción.",
    });
  } catch (error: any) {
    console.error("[Newsletter Subscribe Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar la suscripción" },
      { status: 400 }
    );
  }
}
