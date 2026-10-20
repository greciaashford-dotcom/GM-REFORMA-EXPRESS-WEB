import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/booking/engine";
import { isPostalCodeCovered } from "@/lib/constants";
import { sendEmail } from "@/lib/email/sender";
import { bookingConfirmationTemplate } from "@/lib/email/templates";

const bookingSchema = z.object({
  serviceKey: z.string().min(1, "El servicio es obligatorio"),
  serviceTitle: z.string().min(1, "El título del servicio es obligatorio"),
  type: z.enum(["ORIENTATION_CALL", "VALUATION_VISIT"]),
  postalCode: z.string().regex(/^28\d{3}$/, "Debe ser un código postal válido de Madrid (28xxx)"),
  address: z.string().optional(),
  clientName: z.string().min(2, "El nombre es obligatorio"),
  clientEmail: z.string().email("Correo electrónico inválido"),
  clientPhone: z.string().min(9, "Teléfono de contacto inválido"),
  projectDetails: z.string().optional(),
  startTimeUtc: z.string().datetime(),
  customerId: z.string().optional(),
  locale: z.enum(["es", "en", "fr", "de"]).optional().default("es"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      serviceKey,
      serviceTitle,
      type,
      postalCode,
      address,
      clientName,
      clientEmail,
      clientPhone,
      projectDetails,
      startTimeUtc,
      customerId,
      locale,
    } = parsed.data;

    if (!isPostalCodeCovered(postalCode)) {
      return NextResponse.json(
        {
          success: false,
          error: `El código postal ${postalCode} se encuentra fuera de nuestra cobertura operativa en la Comunidad de Madrid.`,
        },
        { status: 422 }
      );
    }

    const booking = await createBooking({
      serviceKey,
      serviceTitle,
      type,
      postalCode,
      address,
      clientName,
      clientEmail,
      clientPhone,
      projectDetails,
      startTimeUtc,
      customerId,
    });

    // Send confirmation email
    try {
      const emailContent = bookingConfirmationTemplate({
        bookingNumber: booking.bookingNumber,
        clientName: booking.clientName,
        serviceTitle: booking.serviceTitle,
        type: booking.type as "ORIENTATION_CALL" | "VALUATION_VISIT",
        startTime: booking.startTimeUtc,
        address: booking.address,
        rescheduleToken: booking.rescheduleToken,
        cancelToken: booking.cancelToken,
        locale,
      });

      await sendEmail({
        to: booking.clientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailErr) {
      console.error("[Booking Notification Error]", emailErr);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        serviceTitle: booking.serviceTitle,
        type: booking.type,
        startTimeUtc: booking.startTimeUtc,
        endTimeUtc: booking.endTimeUtc,
        rescheduleToken: booking.rescheduleToken,
        cancelToken: booking.cancelToken,
      },
    });
  } catch (error: any) {
    console.error("[Booking Create Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al procesar la reserva" },
      { status: 500 }
    );
  }
}
