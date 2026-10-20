import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Locale, BRAND } from "@/lib/constants";
import db from "@/lib/db";
import { CheckCircle2, Calendar, Phone, ArrowLeft, Clock, MapPin, Download } from "lucide-react";

interface ConfirmationPageProps {
  params: { locale: string };
  searchParams: { id?: string };
}

export default async function BookingConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const locale = params.locale as Locale;
  const bookingId = searchParams.id;

  if (!bookingId) {
    notFound();
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(booking.startTimeUtc));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-graphite-900 dark:text-white">
          ¡Cita confirmada con éxito!
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Hemos registrado su solicitud y enviado un correo con todos los detalles a{" "}
          <strong className="text-graphite-900 dark:text-white">{booking.clientEmail}</strong>.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-graphite-100 dark:border-graphite-800 pb-3">
          <span className="text-xs uppercase font-bold text-petroleum-800 dark:text-petroleum-400">
            Número de reserva
          </span>
          <span className="font-mono font-bold text-sm text-graphite-900 dark:text-white">
            {booking.bookingNumber}
          </span>
        </div>

        <div className="space-y-2 text-sm text-graphite-700 dark:text-slate-300">
          <p><strong>Servicio:</strong> {booking.serviceTitle}</p>
          <p><strong>Fecha y hora:</strong> {formattedDate} (hora de Madrid)</p>
          <p><strong>Titular:</strong> {booking.clientName} ({booking.clientPhone})</p>
          <p><strong>Código postal:</strong> {booking.postalCode} (Madrid)</p>
          {booking.address && <p><strong>Dirección:</strong> {booking.address}</p>}
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-graphite-100 dark:border-graphite-800 flex flex-wrap gap-3">
          <a
            href={`/api/bookings/ics?id=${booking.id}`}
            download={`${booking.bookingNumber}.ics`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Descargar archivo .ics</span>
          </a>
          <Link
            href={`/${locale}/reservar/reprogramar/${booking.rescheduleToken}`}
            className="py-2.5 px-4 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 font-semibold text-xs hover:bg-warm-50 dark:hover:bg-graphite-800 transition-colors flex items-center justify-center min-h-[44px]"
          >
            Reprogramar
          </Link>
          <Link
            href={`/${locale}/reservar/cancelar/${booking.cancelToken}`}
            className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 font-semibold text-xs hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center min-h-[44px]"
          >
            Cancelar
          </Link>
        </div>
      </div>

      <div className="text-xs text-graphite-500 space-y-1">
        <p>¿Necesita modificar algún dato urgentemente? Llámenos al <a href={BRAND.phoneTel} className="font-bold underline">{BRAND.phoneVisible}</a>.</p>
        <p>GM REFORMA EXPRESS · Madrid, España</p>
      </div>

      <div className="pt-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la página de inicio</span>
        </Link>
      </div>
    </div>
  );
}
