import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { Layers, CheckCircle2, AlertCircle, Edit3, Eye, ShieldAlert } from "lucide-react";

export default async function AdminServiciosPage() {
  const services = await db.service.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      translations: {
        where: { locale: "es" },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            10. Catálogo de Servicios y Revisión Técnica (20 Servicios)
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Los servicios especializados requieren validación técnica antes de publicarse como promesas comerciales (Estado DRAFT vs APPROVED).
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Orden</th>
                <th className="px-6 py-4">Servicio & Clave</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">SEO H1 (ES)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {services.map((s) => {
                const trans = s.translations[0] || {};
                const isApproved = s.status === "APPROVED";
                return (
                  <tr key={s.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-petroleum-800 dark:text-petroleum-300">
                      #{s.orderIndex}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {trans.navTitle || s.key}
                      </span>
                      <span className="font-mono text-[11px] text-graphite-400 block">
                        {s.key}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-graphite-100 dark:bg-graphite-800 text-graphite-600 dark:text-slate-300 font-medium">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {isApproved ? "APROBADO" : "BORRADOR / REVISIÓN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate text-graphite-600 dark:text-slate-300">
                      {trans.h1 || "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/servicios/${s.id}/editar`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-petroleum-800 dark:text-petroleum-300 hover:text-secondary dark:hover:text-secondary transition-colors px-2.5 py-1 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 hover:border-secondary shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-secondary" />
                        <span>Editar</span>
                      </Link>
                      <Link
                        href={`/es/servicios/${trans.slug || s.key}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-lg hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver web</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
