import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateIcsCalendar } from "@/lib/booking/engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingNumber = searchParams.get("bookingNumber");
  const id = searchParams.get("id");

  if (!bookingNumber && !id) {
    return new NextResponse("Identificador de reserva no especificado", { status: 400 });
  }

  const booking = await db.booking.findFirst({
    where: {
      OR: [
        ...(bookingNumber ? [{ bookingNumber }] : []),
        ...(id ? [{ id }] : []),
      ],
    },
  });

  if (!booking) {
    return new NextResponse("Reserva no encontrada", { status: 404 });
  }

  const icsContent = generateIcsCalendar(booking);

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.bookingNumber}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
