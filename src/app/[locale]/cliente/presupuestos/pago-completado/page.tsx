import React from "react";
import Link from "next/link";
import { Locale } from "@/lib/constants";
import { CheckCircle2, Receipt, FileCheck2, ArrowRight } from "lucide-react";

interface PagoCompletadoPageProps {
  params: { locale: string };
}

export default function PagoCompletadoPage({ params }: PagoCompletadoPageProps) {
  const locale = (params.locale as Locale) || "es";

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
          ¡Abono de presupuesto procesado con éxito!
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          Su pago verificado ha quedado registrado en nuestro sistema y se ha emitido automáticamente el documento acreditativo correspondiente en su área privada.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/${locale}/cliente/facturas`}
          className="px-6 py-3.5 rounded-xl bg-[#03203d] hover:bg-[#05305a] text-white font-bold text-xs sm:text-sm shadow transition-all flex items-center gap-2 min-h-[44px]"
        >
          <Receipt className="w-4 h-4 text-[#c9932a]" />
          <span>Ver y descargar factura / recibo</span>
          <ArrowRight className="w-4 h-4 text-[#c9932a]" />
        </Link>

        <Link
          href={`/${locale}/cliente/presupuestos`}
          className="px-6 py-3.5 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-800 dark:text-slate-200 hover:border-[#c9932a] font-bold text-xs sm:text-sm transition-all flex items-center gap-2 min-h-[44px]"
        >
          <FileCheck2 className="w-4 h-4 text-[#c9932a]" />
          <span>Volver a mis presupuestos</span>
        </Link>
      </div>
    </div>
  );
}
