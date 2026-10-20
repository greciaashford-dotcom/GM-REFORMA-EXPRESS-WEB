import React from "react";
import db from "@/lib/db";
import { Mail, ShieldCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function AdminNewsletterPage() {
  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            17. Suscriptores de Newsletter (Double Opt-In RGPD)
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Registro de consentimientos con doble confirmación para envíos comerciales y consejos de reformas.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {subscribers.length} suscriptores
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4">Idioma</th>
                <th className="px-6 py-4">Fecha Solicitud</th>
                <th className="px-6 py-4">Fecha Confirmación</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-graphite-500">
                    No constan suscriptores todavía.
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-graphite-900 dark:text-white">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 uppercase font-mono text-[11px] text-slate-500">
                      {s.locale}
                    </td>
                    <td className="px-6 py-4 text-graphite-500 text-[11px] whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(s.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-graphite-500 text-[11px] whitespace-nowrap">
                      {s.confirmedAt
                        ? new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(s.confirmedAt)
                        : "Pendiente de clic"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : s.status === "UNSUBSCRIBED"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.status}
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
