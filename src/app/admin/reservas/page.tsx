import React from "react";
import db from "@/lib/db";
import { Calendar, Clock, MapPin, Phone, User, CheckCircle2, AlertCircle } from "lucide-react";

export default async function AdminReservasPage() {
  const bookings = await db.booking.findMany({
    include: {
      customer: true,
    },
    orderBy: { startTimeUtc: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            6. Agenda de Citas y Visitas Técnicas
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Llamadas de orientación y visitas técnicas de replanteo en la Comunidad de Madrid.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {bookings.length} reservas
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Fecha & Hora (Madrid)</th>
                <th className="px-6 py-4">Tipo & Servicio</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Ubicación / Dirección</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-graphite-500">
                    No constan reservas en la agenda todavía.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-petroleum-800 dark:text-petroleum-300 whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Europe/Madrid",
                      }).format(b.startTimeUtc)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {b.type === "VALUATION_VISIT" ? "Visita Técnica Presencial" : "Llamada de Orientación"}
                      </span>
                      <span className="text-[11px] text-graphite-500 block">
                        {b.serviceTitle} ({b.durationMinutes} min)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {b.clientName || b.customer?.name || "Cliente"}
                      </span>
                      <span className="text-[11px] text-graphite-500 block">
                        {b.clientEmail || b.customer?.email || "-"} · {b.clientPhone || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-graphite-900 dark:text-white block">
                        {b.address || "Por teléfono / videollamada"}
                      </span>
                      {b.postalCode && (
                        <span className="text-[11px] text-secondary font-semibold">
                          CP {b.postalCode} Madrid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : b.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
