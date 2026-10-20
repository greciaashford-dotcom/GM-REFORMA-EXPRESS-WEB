import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import {
  FileCheck2,
  CreditCard,
  Receipt,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Inbox,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default async function AdminOverviewPage() {
  // Real database metrics
  const quotesCount = await db.quote.count();
  const quotesAcceptedCount = await db.quote.count({ where: { status: "ACCEPTED" } });

  const totalQuotesAmountResult = await db.quote.aggregate({
    _sum: { totalCents: true },
  });
  const totalQuotesAmountCents = totalQuotesAmountResult._sum.totalCents || 0;

  const paymentsSucceeded = await db.payment.aggregate({
    where: { status: "SUCCEEDED" },
    _sum: { amountCents: true },
    _count: true,
  });
  const totalPaidCents = paymentsSucceeded._sum.amountCents || 0;

  const bookingsTotal = await db.booking.count();
  const bookingsConfirmed = await db.booking.count({ where: { status: "CONFIRMED" } });

  const leadsCount = await db.lead.count();
  const subscribersCount = await db.subscriber.count({ where: { status: "CONFIRMED" } });

  // Discrepancy alerts in agreed amounts
  const pendingVerificationRequests = await db.agreedAmountVerificationRequest.findMany({
    where: { status: { in: ["MISMATCH_ALERT", "PENDING"] } },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Recent leads
  const recentLeads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
            Resumen Ejecutivo del Negocio
          </h1>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400 mt-1">
            Indicadores reales en base de datos · Moneda: EUR · Zona horaria: Europe/Madrid
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/presupuestos"
            className="px-4 py-2 rounded-xl bg-petroleum-800 text-white font-bold text-xs hover:bg-petroleum-900 transition-colors"
          >
            Nuevo Presupuesto
          </Link>
        </div>
      </div>

      {/* Agreed Amount Mismatch Discrepancy Alerts */}
      {pendingVerificationRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              Alertas de verificación de importe acordado ({pendingVerificationRequests.length} pendientes de revisión)
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Un cliente ha intentado abonar un importe con una referencia que no coincide exactamente con el saldo aprobado en base de datos. El cobro ha sido bloqueado preventivamente.
          </p>
          <div className="space-y-2 pt-1">
            {pendingVerificationRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-white dark:bg-graphite-900 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-graphite-900 dark:text-white">{req.customer.name}</span>{" "}
                  <span className="text-graphite-500">({req.customer.email})</span> — Ref:{" "}
                  <span className="font-mono font-bold text-petroleum-800 dark:text-petroleum-300">
                    {req.quoteReference}
                  </span>
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">{req.discrepancyDetails}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-graphite-900 dark:text-white">
                    {(req.inputAmountCents / 100).toFixed(2)} €
                  </span>
                  <Link
                    href={`/admin/presupuestos?reviewId=${req.id}`}
                    className="px-3 py-1.5 rounded-lg bg-petroleum-800 text-white font-semibold text-[11px]"
                  >
                    Examinar discrepancia
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Presupuestos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Presupuestos Emitidos</span>
            <FileCheck2 className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {quotesCount}
          </div>
          <div className="text-xs text-graphite-500 flex items-center justify-between">
            <span>Aprobados: <strong>{quotesAcceptedCount}</strong></span>
            <span>Volumen: <strong>{(totalQuotesAmountCents / 100).toFixed(2)} €</strong></span>
          </div>
        </div>

        {/* Cobros reales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Cobros Confirmados</span>
            <CreditCard className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {(totalPaidCents / 100).toFixed(2)} €
          </div>
          <div className="text-xs text-graphite-500 flex items-center justify-between">
            <span>Transacciones: {paymentsSucceeded._count}</span>
            <span className="text-amber-600 font-semibold text-[11px]">Modo pruebas</span>
          </div>
        </div>

        {/* Citas y visitas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Agenda y Citas</span>
            <Calendar className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {bookingsConfirmed}
          </div>
          <div className="text-xs text-graphite-500">
            Total solicitadas: <strong>{bookingsTotal}</strong> en Madrid
          </div>
        </div>

        {/* Suscriptores Newsletter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Suscriptores Doble Opt-in</span>
            <Users className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {subscribersCount}
          </div>
          <div className="text-xs text-graphite-500">
            2 envíos semanales programados
          </div>
        </div>
      </div>

      {/* Recent Leads and Integration Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads */}
        <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-petroleum-700" />
              Solicitudes comerciales recientes ({leadsCount})
            </h2>
            <Link href="/admin/solicitudes" className="text-xs font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline">
              Ver todas →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="text-xs text-graphite-500 py-4">No hay solicitudes nuevas de presupuesto.</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 rounded-xl bg-warm-50/60 dark:bg-graphite-800/60 border border-graphite-100 dark:border-graphite-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-graphite-900 dark:text-white">{lead.name}</span>
                    <span className="text-graphite-500 block">{lead.email} · Tel: {lead.phone}</span>
                    <span className="text-[11px] text-petroleum-800 dark:text-petroleum-300 font-medium">
                      CP {lead.postalCode} · {lead.serviceSlug || "Consulta general"}
                    </span>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded bg-graphite-200 dark:bg-graphite-700 text-graphite-700 dark:text-slate-200 text-[10px]">
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integration Status (Real & Honest States) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-petroleum-700" />
            Estado de Integraciones Técnicas
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-warm-50 dark:bg-graphite-800/50 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">Pasarela de Pagos Stripe</span>
                <span className="text-graphite-500">Checkout alojado con verificación de firmas</span>
              </div>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                Modo Pruebas (Test Mode)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-warm-50 dark:bg-graphite-800/50 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">Motor de Facturación Fiscal</span>
                <span className="text-graphite-500">Proveedor español / VERI*FACTU</span>
              </div>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                Test Adapter (No fiscal)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-warm-50 dark:bg-graphite-800/50 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">Servicio de Correo Resend</span>
                <span className="text-graphite-500">Transaccional y Broadcasts bisemanales</span>
              </div>
              <span className="px-2 py-1 rounded bg-petroleum-100 text-petroleum-800 text-[11px] font-bold">
                Adaptador Activo
              </span>
            </div>

            <div className="p-3 rounded-xl bg-warm-50 dark:bg-graphite-800/50 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">Google Search Console & GA4</span>
                <span className="text-graphite-500">Metadatos de verificación preparados</span>
              </div>
              <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                Pendiente de autorización
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
