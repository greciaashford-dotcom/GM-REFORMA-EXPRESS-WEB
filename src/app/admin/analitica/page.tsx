import React from "react";
import db from "@/lib/db";
import { BarChart3, TrendingUp, Users, FileCheck2, CreditCard, Inbox, ArrowUpRight } from "lucide-react";

export default async function AdminAnaliticaPage() {
  const [leadsCount, quotesCount, quotesAcceptedCount, bookingsCount, subscribersCount] = await Promise.all([
    db.lead.count(),
    db.quote.count(),
    db.quote.count({ where: { status: "ACCEPTED" } }),
    db.booking.count(),
    db.subscriber.count({ where: { status: "CONFIRMED" } }),
  ]);

  const paymentsAggregate = await db.payment.aggregate({
    where: { status: "SUCCEEDED" },
    _sum: { amountCents: true },
    _count: true,
  });

  const quotesVolume = await db.quote.aggregate({
    _sum: { totalCents: true },
  });

  const conversionRate = leadsCount > 0 ? ((quotesAcceptedCount / leadsCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          2. Analítica de Conversión y Rendimiento Comercial
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Métricas calculadas sobre datos consolidados en la base de datos de Madrid.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Tasa de Conversión</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {conversionRate}%
          </div>
          <span className="text-[11px] text-graphite-500 block">
            Presupuestos aceptados sobre leads totales
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Volumen Presupuestado</span>
            <FileCheck2 className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {((quotesVolume._sum.totalCents || 0) / 100).toLocaleString("es-ES")} €
          </div>
          <span className="text-[11px] text-graphite-500 block">
            {quotesCount} propuestas técnicas emitidas
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Facturación Cobrada</span>
            <CreditCard className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {((paymentsAggregate._sum.amountCents || 0) / 100).toLocaleString("es-ES")} €
          </div>
          <span className="text-[11px] text-graphite-500 block">
            {paymentsAggregate._count} transacciones confirmadas
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Comunidad Activa</span>
            <Users className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {subscribersCount + bookingsCount}
          </div>
          <span className="text-[11px] text-graphite-500 block">
            {bookingsCount} citas y {subscribersCount} suscriptores
          </span>
        </div>
      </div>
    </div>
  );
}
