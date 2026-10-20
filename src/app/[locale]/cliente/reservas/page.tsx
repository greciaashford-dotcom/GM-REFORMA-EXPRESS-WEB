import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Locale } from "@/lib/constants";
import db from "@/lib/db";
import { Calendar, Download, Clock, MapPin } from "lucide-react";

interface ReservasClientePageProps {
  params: { locale: string };
}

export default async function ReservasClientePage({ params }: ReservasClientePageProps) {
  const locale = params.locale as Locale;
  const user = (await getCurrentUser())!;

  const bookings = await db.booking.findMany({
    where: {
      OR: [
        { customerId: user.id },
        { clientEmail: user.email },
      ],
    },
    orderBy: { startTimeUtc: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
          Mis Citas y Visitas Técnicas
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Consulte o reprograme sus citas de valoración y llamadas de orientación en Madrid.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-center text-sm text-graphite-500 space-y-4">
          <p>No tiene citas programadas actualmente.</p>
          <Link
            href={`/${locale}/reservar`}
            className="inline-flex px-5 py-2.5 rounded-xl bg-petroleum-800 text-white font-bold text-xs"
          >
            Reservar nueva visita técnica
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const formattedDate = new Intl.DateTimeFormat("es-ES", {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: "Europe/Madrid",
            }).format(b.startTimeUtc);

            return (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-graphite-100 dark:border-graphite-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-petroleum-100 dark:bg-petroleum-900 text-petroleum-800 dark:text-petroleum-300">
                      {b.bookingNumber}
                    </span>
                    <h3 className="font-bold text-base text-graphite-900 dark:text-white">
                      {b.serviceTitle}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      b.status === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : b.status === "CANCELLED"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-graphite-700 dark:text-slate-300 space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-petroleum-700" />
                    <span>{formattedDate} (hora de Madrid)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-petroleum-700" />
                    <span>Duración estimada: {b.durationMinutes} minutos</span>
                  </p>
                  {b.address && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-petroleum-700" />
                      <span>{b.address} (CP {b.postalCode})</span>
                    </p>
                  )}
                </div>

                {b.status !== "CANCELLED" && (
                  <div className="pt-3 border-t border-graphite-100 dark:border-graphite-800 flex flex-wrap gap-3">
                    <a
                      href={`/api/bookings/ics?id=${b.id}`}
                      download={`${b.bookingNumber}.ics`}
                      className="px-3.5 py-2 rounded-xl bg-petroleum-50 text-petroleum-800 hover:bg-petroleum-100 dark:bg-petroleum-950 dark:text-petroleum-300 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar .ics</span>
                    </a>
                    <Link
                      href={`/${locale}/reservar/reprogramar/${b.rescheduleToken}`}
                      className="px-3.5 py-2 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 text-xs font-semibold hover:bg-warm-50 dark:hover:bg-graphite-800 transition-colors flex items-center min-h-[44px]"
                    >
                      Reprogramar
                    </Link>
                    <Link
                      href={`/${locale}/reservar/cancelar/${b.cancelToken}`}
                      className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40 transition-colors flex items-center min-h-[44px]"
                    >
                      Cancelar cita
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
