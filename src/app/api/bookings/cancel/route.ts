import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cancelBookingByToken } from "@/lib/booking/engine";

const cancelSchema = z.object({
  token: z.string().min(1, "El token de cancelación es obligatorio"),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const booking = await cancelBookingByToken(parsed.data.token, parsed.data.reason);

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada correctamente",
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al cancelar la reserva" },
      { status: 400 }
    );
  }
}
