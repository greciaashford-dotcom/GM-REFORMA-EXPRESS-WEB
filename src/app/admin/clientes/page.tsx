import React from "react";
import db from "@/lib/db";
import { Users, Phone, Mail, FileText, Calendar, CheckCircle2 } from "lucide-react";

export default async function AdminClientesPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      customerProfile: true,
      customerQuotes: true,
      customerBookings: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            4. Directorio de Clientes y Propietarios
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Usuarios registrados con acceso al portal de cliente y seguimiento de proyectos en Madrid.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {customers.length} clientes registrados
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Presupuestos</th>
                <th className="px-6 py-4">Reservas</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-graphite-500">
                    No constan clientes dados de alta todavía.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-graphite-400 block font-mono">
                        {c.customerProfile?.billingTaxId || "Sin NIF/NIE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-graphite-900 dark:text-white block">
                        {c.email}
                      </span>
                      <span className="text-[11px] text-graphite-500 block">
                        {c.customerProfile?.phone || "Sin teléfono"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-petroleum-800 dark:text-petroleum-300">
                      {c.customerQuotes.length} emitidos
                    </td>
                    <td className="px-6 py-4 text-graphite-600 dark:text-slate-300">
                      {c.customerBookings.length} citas
                    </td>
                    <td className="px-6 py-4 text-graphite-500 text-[11px]">
                      {new Intl.DateTimeFormat("es-ES", { dateStyle: "short" }).format(c.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isEmailVerified
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {c.isEmailVerified ? "EMAIL VERIFICADO" : "PENDIENTE"}
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
