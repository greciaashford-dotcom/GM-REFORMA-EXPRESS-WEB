import React from "react";
import db from "@/lib/db";
import { Inbox, Phone, Mail, Calendar, MapPin, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function AdminSolicitudesPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            3. Solicitudes y Captación Comercial (Leads)
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Gestión de solicitudes entrantes de presupuesto y contacto procedentes de la web en Madrid.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {leads.length} solicitudes
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente / Contacto</th>
                <th className="px-6 py-4">Servicio & Zona</th>
                <th className="px-6 py-4">Detalle Solicitud</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-graphite-500">
                    No constan solicitudes entrantes todavía.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4 text-graphite-500 font-mono text-[11px] whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(l.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {l.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-graphite-500">
                        <a href={`tel:${l.phone}`} className="hover:text-secondary flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {l.phone}
                        </a>
                        <span>·</span>
                        <a href={`mailto:${l.email}`} className="hover:text-secondary flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {l.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-graphite-900 dark:text-white block">
                        {l.serviceName || l.serviceSlug || "Reforma General"}
                      </span>
                      <span className="text-[11px] text-graphite-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-secondary" />
                        {l.postalCode ? `CP ${l.postalCode} Madrid` : "Madrid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="line-clamp-2 text-graphite-600 dark:text-slate-300 text-xs">
                        {l.description}
                      </p>
                      {l.preferredContactTime && (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Preferencia: {l.preferredContactTime}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          l.status === "NEW"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : l.status === "CONTACTED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : l.status === "QUOTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-graphite-100 text-graphite-700"
                        }`}
                      >
                        {l.status}
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
