import React from "react";
import db from "@/lib/db";
import { CreditCard, CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";

export default async function AdminPagosPage() {
  const payments = await db.payment.findMany({
    include: {
      customer: true,
      quote: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            8. Registro de Cobros y Transacciones (Stripe)
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Libro de transacciones, importes recibidos y estado de pagos de clientes.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {payments.length} transacciones
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Presupuesto / Referencia</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Importe</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-graphite-500">
                    No constan pagos registrados todavía en este entorno.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                    <td className="px-6 py-4 text-graphite-500 font-mono text-[11px] whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(p.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {p.customer.name}
                      </span>
                      <span className="text-[11px] text-graphite-500 block">
                        {p.customer.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-petroleum-800 dark:text-petroleum-300">
                      {p.paymentNumber || p.quote?.quoteNumber || "-"}
                    </td>
                    <td className="px-6 py-4 uppercase font-semibold text-graphite-600 dark:text-slate-400">
                      {p.method}
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-sm text-graphite-900 dark:text-white">
                      {(p.amountCents / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === "SUCCEEDED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : p.status === "REFUNDED"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
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
