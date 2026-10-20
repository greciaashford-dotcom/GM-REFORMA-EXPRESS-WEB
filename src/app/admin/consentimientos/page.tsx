import React from "react";
import db from "@/lib/db";
import { ShieldCheck, User, Clock, CheckCircle2 } from "lucide-react";

export default async function AdminConsentimientosPage() {
  const consents = await db.consentRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            19. Registro de Consentimientos RGPD / LOPD-GDD
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Trazabilidad legal preceptiva de aceptaciones de cookies, privacidad, presupuestos y marketing.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Registros: {consents.length}
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Identificador / Email</th>
                <th className="px-6 py-4">Finalidad / Propósito</th>
                <th className="px-6 py-4">Versión Política</th>
                <th className="px-6 py-4">Dirección IP</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {consents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-graphite-500">
                    No constan registros de consentimiento almacenados todavía.
                  </td>
                </tr>
              ) : (
                consents.map((c) => (
                  <tr key={c.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4 text-graphite-500 font-mono text-[11px] whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-bold text-graphite-900 dark:text-white">
                      {c.subject}
                    </td>
                    <td className="px-6 py-4 uppercase font-semibold text-graphite-600 dark:text-slate-300">
                      {c.purpose}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      v{c.version}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {c.ipAddress || "Anonimizada"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.granted
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {c.granted ? "OTORGADO" : "REVOCADO"}
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
