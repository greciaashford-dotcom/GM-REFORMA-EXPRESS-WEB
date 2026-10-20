import React from "react";
import db from "@/lib/db";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Calendar } from "lucide-react";

export default async function AdminProyectosPage() {
  const projects = await db.project.findMany({
    include: {
      customer: true,
      milestones: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            7. Proyectos y Ejecución de Obra
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Seguimiento de obras en curso, replanteo, hitos de avance y certificaciones en Madrid.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {projects.length} proyectos
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Proyecto & Cliente</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Presupuesto Vinculado</th>
                <th className="px-6 py-4">Hitos Completados</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-graphite-500">
                    No constan proyectos activos en ejecución actualmente.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const completedMilestones = p.milestones.filter((m) => m.status === "COMPLETED").length;
                  const totalMilestones = p.milestones.length;
                  return (
                    <tr key={p.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-graphite-900 dark:text-white block">
                          {p.title}
                        </span>
                        <span className="text-[11px] text-graphite-500 block">
                          {p.customer.name} ({p.customer.email})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-graphite-600 dark:text-slate-300">
                        {p.address}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-petroleum-800 dark:text-petroleum-300">
                        {p.code || p.quoteId || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-graphite-900 dark:text-white">
                          {completedMilestones} de {totalMilestones} hitos
                        </span>
                        <div className="w-24 bg-slate-200 dark:bg-graphite-700 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-secondary h-full"
                            style={{
                              width: totalMilestones > 0 ? `${(completedMilestones / totalMilestones) * 100}%` : "0%",
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : p.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-graphite-100 text-graphite-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
