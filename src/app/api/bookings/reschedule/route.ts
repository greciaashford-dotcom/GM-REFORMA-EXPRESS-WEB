import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rescheduleBookingByToken } from "@/lib/booking/engine";

const rescheduleSchema = z.object({
  token: z.string().min(1, "El token de reprogramación es obligatorio"),
  startTimeUtc: z.string().datetime("Formato de fecha inválido"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = rescheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const booking = await rescheduleBookingByToken(parsed.data.token, parsed.data.startTimeUtc);

    return NextResponse.json({
      success: true,
      message: "Reserva reprogramada exitosamente",
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        startTimeUtc: booking.startTimeUtc,
        endTimeUtc: booking.endTimeUtc,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al reprogramar la reserva" },
      { status: 400 }
    );
  }
}
