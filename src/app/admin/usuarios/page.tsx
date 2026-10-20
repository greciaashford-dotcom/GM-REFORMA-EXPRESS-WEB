import React from "react";
import db from "@/lib/db";
import { UserCog, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

export default async function AdminUsuariosPage() {
  const users = await db.user.findMany({
    where: {
      role: { not: "CUSTOMER" },
    },
    orderBy: { createdAt: "asc" },
  });

  const auditLogs = await db.auditLog.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            21. Usuarios del Sistema y Registro de Auditoría (RBAC)
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Cuentas del personal administrativo, control de acceso y registro forense de modificaciones.
          </p>
        </div>
      </div>

      {/* Internal Staff Users */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white">
          Equipo Administrativo y Operativo ({users.length})
        </h2>
        <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4">Rol Asignado</th>
                  <th className="px-6 py-4">Estado Cuenta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40">
                    <td className="px-6 py-4 font-bold text-graphite-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-graphite-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ACTIVO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Audit Logs */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-secondary" />
          <span>Últimos Eventos de Auditoría (Trazabilidad)</span>
        </h2>
        <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Operador</th>
                  <th className="px-6 py-4">Entidad</th>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-graphite-500">
                      No constan registros de auditoría recientes.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40">
                      <td className="px-6 py-4 text-graphite-500 font-mono text-[11px] whitespace-nowrap">
                        {new Intl.DateTimeFormat("es-ES", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-bold text-graphite-900 dark:text-white">
                        {log.user?.name || log.user?.email || "Sistema"}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 font-semibold">
                        {log.entityType}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-graphite-800 text-slate-700 dark:text-slate-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-graphite-600 dark:text-slate-300 max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
