import { addMinutes, format, isBefore, isWeekend, parseISO, setHours, setMinutes, startOfDay } from "date-fns";
import db from "../db";
import { isPostalCodeCovered } from "../constants";

export interface TimeSlot {
  startTime: string; // ISO UTC
  endTime: string;   // ISO UTC
  displayTime: string; // e.g. "10:00"
  available: boolean;
}

export const BOOKING_TYPES = {
  ORIENTATION_CALL: {
    durationMinutes: 20,
    bufferMinutes: 10,
    label: "Llamada de orientación",
    desc: "Consulta telefónica para resolver dudas iniciales y definir necesidades.",
  },
  VALUATION_VISIT: {
    durationMinutes: 45,
    bufferMinutes: 30, // displacement buffer
    label: "Visita técnica de valoración",
    desc: "Inspección in situ en su inmueble de Madrid para tomar medidas y valorar el alcance.",
  },
} as const;

export async function getAvailableSlots(dateStr: string, bookingType: "ORIENTATION_CALL" | "VALUATION_VISIT"): Promise<TimeSlot[]> {
  const targetDate = parseISO(dateStr);
  const config = BOOKING_TYPES[bookingType] || BOOKING_TYPES.ORIENTATION_CALL;
  const slotDuration = config.durationMinutes;
  const buffer = config.bufferMinutes;

  // Working hours: Mon-Fri 09:00-19:00, Sat 10:00-14:00, Sun closed
  const dayOfWeek = targetDate.getDay();
  if (dayOfWeek === 0) {
    // Sunday closed
    return [];
  }

  const startHour = dayOfWeek === 6 ? 10 : 9;
  const endHour = dayOfWeek === 6 ? 14 : 19;

  const dayStart = startOfDay(targetDate);
  const windowStart = setHours(setMinutes(dayStart, 0), startHour);
  const windowEnd = setHours(setMinutes(dayStart, 0), endHour);

  // Fetch existing non-cancelled bookings for that day
  const dayEnd = setHours(setMinutes(dayStart, 59), 23);
  const existingBookings = await db.booking.findMany({
    where: {
      status: { notIn: ["CANCELLED"] },
      startTimeUtc: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  const slots: TimeSlot[] = [];
  let current = windowStart;
  const now = new Date();

  while (isBefore(addMinutes(current, slotDuration), windowEnd)) {
    const slotEnd = addMinutes(current, slotDuration);
    const slotStartIso = current.toISOString();
    const slotEndIso = slotEnd.toISOString();

    // Check if in the past
    const isPast = isBefore(current, now);

    // Check collision with existing bookings (considering buffer)
    const hasCollision = existingBookings.some((b) => {
      const bStart = new Date(b.startTimeUtc);
      const bEnd = new Date(b.endTimeUtc);
      const bStartWithBuffer = addMinutes(bStart, -buffer);
      const bEndWithBuffer = addMinutes(bEnd, buffer);

      return (
        (current >= bStartWithBuffer && current < bEndWithBuffer) ||
        (slotEnd > bStartWithBuffer && slotEnd <= bEndWithBuffer) ||
        (current <= bStartWithBuffer && slotEnd >= bEndWithBuffer)
      );
    });

    slots.push({
      startTime: slotStartIso,
      endTime: slotEndIso,
      displayTime: format(current, "HH:mm"),
      available: !isPast && !hasCollision,
    });

    current = addMinutes(current, slotDuration + 15); // 15-minute slot increment
  }

  return slots;
}

export async function createBooking(params: {
  serviceKey: string;
  serviceTitle: string;
  type: "ORIENTATION_CALL" | "VALUATION_VISIT";
  postalCode: string;
  address?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectDetails?: string;
  startTimeUtc: string;
  customerId?: string;
}) {
  // Validate coverage
  if (!isPostalCodeCovered(params.postalCode)) {
    throw new Error(
      `El código postal ${params.postalCode} se encuentra fuera de nuestra área de cobertura inicial de Madrid.`
    );
  }

  const startTime = new Date(params.startTimeUtc);
  const config = BOOKING_TYPES[params.type] || BOOKING_TYPES.ORIENTATION_CALL;
  const duration = config.durationMinutes;
  const endTime = addMinutes(startTime, duration);

  // Anti-collision / concurrency lock in a transaction
  return await db.$transaction(async (tx) => {
    const collision = await tx.booking.findFirst({
      where: {
        status: { notIn: ["CANCELLED"] },
        startTimeUtc: { lt: endTime },
        endTimeUtc: { gt: startTime },
      },
    });

    if (collision) {
      throw new Error("La franja horaria seleccionada acaba de ser reservada. Por favor, seleccione otro horario.");
    }

    const latest = await tx.booking.findFirst({
      orderBy: { createdAt: "desc" },
    });
    const nextNum = (latest ? parseInt(latest.bookingNumber.replace("RES-2026-", ""), 10) || 0 : 0) + 1;
    const bookingNumber = `RES-2026-${String(nextNum).padStart(4, "0")}`;

    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        customerId: params.customerId,
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        clientPhone: params.clientPhone,
        serviceKey: params.serviceKey,
        serviceTitle: params.serviceTitle,
        type: params.type,
        status: "CONFIRMED",
        postalCode: params.postalCode,
        address: params.address,
        projectDetails: params.projectDetails,
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        durationMinutes: duration,
      },
    });

    // Schedule outbox notification for booking confirmation
    await tx.outboxEvent.create({
      data: {
        eventType: "BOOKING_CONFIRMATION",
        payload: JSON.stringify({
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          clientEmail: booking.clientEmail,
          clientName: booking.clientName,
          startTime: booking.startTimeUtc,
          type: booking.type,
          rescheduleToken: booking.rescheduleToken,
          cancelToken: booking.cancelToken,
        }),
      },
    });

    return booking;
  });
}

export function generateIcsCalendar(booking: {
  bookingNumber: string;
  clientName: string;
  serviceTitle: string;
  type: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  address?: string | null;
}): string {
  const formatUtcDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const start = formatUtcDate(new Date(booking.startTimeUtc));
  const end = formatUtcDate(new Date(booking.endTimeUtc));
  const summary = `Cita GM REFORMA EXPRESS: ${booking.serviceTitle} (${booking.bookingNumber})`;
  const description = `Cita con GM REFORMA EXPRESS para ${booking.serviceTitle}. Cliente: ${booking.clientName}. Tel: +34 640 677 948`;
  const location = booking.address || "Madrid, España";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GM REFORMA EXPRESS//Citas v1.0//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.bookingNumber}@reformaexpress.com`,
    `DTSTAMP:${formatUtcDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function cancelBookingByToken(cancelToken: string, reason?: string) {
  const booking = await db.booking.findUnique({
    where: { cancelToken },
  });

  if (!booking) {
    throw new Error("Reserva no encontrada o enlace de cancelación inválido");
  }

  if (booking.status === "CANCELLED") {
    return booking;
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      cancelReason: reason || "Cancelado por el usuario",
    },
  });


  return updated;
}

export async function rescheduleBookingByToken(rescheduleToken: string, newStartTimeUtc: string) {
  const booking = await db.booking.findUnique({
    where: { rescheduleToken },
  });

  if (!booking) {
    throw new Error("Reserva no encontrada o enlace de reprogramación inválido");
  }

  const startTime = new Date(newStartTimeUtc);
  const endTime = addMinutes(startTime, booking.durationMinutes);

  return await db.$transaction(async (tx) => {
    const collision = await tx.booking.findFirst({
      where: {
        id: { not: booking.id },
        status: { notIn: ["CANCELLED"] },
        startTimeUtc: { lt: endTime },
        endTimeUtc: { gt: startTime },
      },
    });

    if (collision) {
      throw new Error("El horario seleccionado ya no está disponible. Por favor elija otra hora.");
    }

    const updated = await tx.booking.update({
      where: { id: booking.id },
      data: {
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        status: "CONFIRMED",
      },
    });

    return updated;
  });
}

