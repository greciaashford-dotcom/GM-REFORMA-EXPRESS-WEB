import React from "react";
import db from "@/lib/db";
import { FileCheck2, AlertCircle, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminPresupuestosPage() {
  const quotes = await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      versions: {
        include: { lines: true },
      },
    },
  });

  const verificationRequests = await db.agreedAmountVerificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          5. Presupuestos, Contratos y Verificación de Importe Acordado
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Control de presupuestos aprobados e inspección de solicitudes con discrepancia de importe.
        </p>
      </div>

      {/* Discrepancies & Verification Requests */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-petroleum-700" />
          Solicitudes de validación de importe acordado ({verificationRequests.length})
        </h2>

        {verificationRequests.length === 0 ? (
          <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-xs text-graphite-500">
            No constan discrepancias de importe pendientes de revisión.
          </div>
        ) : (
          <div className="space-y-3">
            {verificationRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-graphite-900 dark:text-white">
                      {req.customer.name}
                    </span>
                    <span className="text-graphite-500">({req.customer.email})</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-petroleum-100 text-petroleum-800">
                      Ref: {req.quoteReference}
                    </span>
                  </div>
                  <p className="text-graphite-600 dark:text-slate-300">
                    Importe introducido por cliente:{" "}
                    <strong className="text-graphite-900 dark:text-white font-mono">
                      {(req.inputAmountCents / 100).toFixed(2)} €
                    </strong>
                  </p>
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                    {req.discrepancyDetails}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === "MATCHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "MISMATCH_ALERT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-graphite-200 text-graphite-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quotes Table */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white">
          Presupuestos de obra en sistema ({quotes.length})
        </h2>

        <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Referencia</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Base + IVA</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40">
                  <td className="px-6 py-4 font-mono font-bold text-petroleum-800 dark:text-petroleum-300">
                    {q.quoteNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold text-graphite-900 dark:text-white">
                    {q.customer.name}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-graphite-600 dark:text-slate-300">
                    {q.title}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        q.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-graphite-500 font-mono">
                    {(q.subtotalCents / 100).toFixed(2)} € + {q.vatRatePercent}%
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-graphite-900 dark:text-white font-mono">
                    {(q.totalCents / 100).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
