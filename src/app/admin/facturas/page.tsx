import React from "react";
import db from "@/lib/db";
import { Receipt, Download, ShieldAlert, AlertTriangle } from "lucide-react";

export default async function AdminFacturasPage() {
  const invoices = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      lines: true,
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          9. Facturación y Series Fiscales (F2026 / R2026)
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Numeración correlativa sin saltos, snapshots inmutables de datos fiscales del emisor y destinatario, y flujo de rectificación.
        </p>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Serie y Número</th>
                <th className="px-6 py-4">Cliente Destinatario</th>
                <th className="px-6 py-4">Fecha Emisión</th>
                <th className="px-6 py-4">Régimen</th>
                <th className="px-6 py-4">Base + IVA</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-graphite-500">
                    No se han emitido facturas todavía.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40">
                    <td className="px-6 py-4 font-mono font-bold text-petroleum-800 dark:text-petroleum-300">
                      {inv.fullNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-graphite-900 dark:text-white block">
                        {inv.customer.name}
                      </span>
                      <span className="text-[11px] text-graphite-400 block">
                        {inv.customer.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-graphite-600 dark:text-slate-400">
                      {new Intl.DateTimeFormat("es-ES", { dateStyle: "short" }).format(inv.issueDate)}
                    </td>
                    <td className="px-6 py-4">
                      {inv.isDraftOrTest ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          PRUEBA / NO FISCAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          OFICIAL ISSUED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-graphite-500">
                      {(inv.subtotalCents / 100).toFixed(2)} € + {inv.vatRatePercent}%
                    </td>
                    <td className="px-6 py-4 font-mono font-extrabold text-graphite-900 dark:text-white">
                      {(inv.totalCents / 100).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/api/invoices/download/${inv.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-petroleum-800 text-white font-semibold text-[11px] hover:bg-petroleum-900 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
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
