import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Locale } from "@/lib/constants";
import db from "@/lib/db";
import { Receipt, Download, FileText, ShieldAlert, ArrowLeft } from "lucide-react";

interface FacturasClientePageProps {
  params: { locale: string };
}

export default async function FacturasClientePage({ params }: FacturasClientePageProps) {
  const locale = params.locale as Locale;
  const user = (await getCurrentUser())!;

  const invoices = await db.invoice.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      lines: true,
      payment: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
          Facturas y Documentos Fiscales
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Descargue sus documentos contables acreditativos de pagos efectuados.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-center text-sm text-graphite-500">
          No hay facturas emitidas todavía para su cuenta. Se generarán automáticamente al confirmarse sus abonos de obra.
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-graphite-100 dark:border-graphite-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300 flex items-center justify-center font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-graphite-900 dark:text-white">
                      {inv.fullNumber}
                    </span>
                    <span className="text-xs text-graphite-500 block">
                      Fecha: {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(inv.issueDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {inv.isDraftOrTest && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold dark:bg-amber-950 dark:text-amber-300">
                      Entorno de Pruebas
                    </span>
                  )}
                  <span className="text-lg font-extrabold text-graphite-900 dark:text-white">
                    {(inv.totalCents / 100).toFixed(2)} €
                  </span>
                </div>
              </div>

              {inv.isDraftOrTest && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>
                    DOCUMENTO EMITIDO EN ENTORNO DE PRUEBAS / NO VÁLIDO COMO FACTURA FISCAL
                  </span>
                </div>
              )}

              {/* Items */}
              <div className="space-y-1 text-xs text-graphite-600 dark:text-slate-300">
                {inv.lines.map((line) => (
                  <div key={line.id} className="flex justify-between py-1">
                    <span>{line.concept}</span>
                    <span className="font-mono">{(line.totalCents / 100).toFixed(2)} €</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-graphite-100 dark:border-graphite-800 flex items-center justify-between text-xs">
                <span className="text-graphite-500">
                  Base: {(inv.subtotalCents / 100).toFixed(2)} € · IVA {inv.vatRatePercent}%: {(inv.vatAmountCents / 100).toFixed(2)} €
                </span>
                <a
                  href={`/api/invoices/download/${inv.id}`}
                  className="px-4 py-2 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
