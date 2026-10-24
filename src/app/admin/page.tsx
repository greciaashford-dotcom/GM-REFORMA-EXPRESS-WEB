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
  Layers,
  Settings,
  BookOpen,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default async function AdminOverviewPage() {
  // Real database metrics
  const [
    quotesCount,
    quotesAcceptedCount,
    totalQuotesAmountResult,
    paymentsSucceeded,
    bookingsTotal,
    bookingsConfirmed,
    leadsCount,
    subscribersCount,
    servicesCount,
    servicesApprovedCount,
    pendingVerificationRequests,
    recentLeads,
  ] = await Promise.all([
    db.quote.count(),
    db.quote.count({ where: { status: "ACCEPTED" } }),
    db.quote.aggregate({ _sum: { totalCents: true } }),
    db.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amountCents: true },
      _count: true,
    }),
    db.booking.count(),
    db.booking.count({ where: { status: "CONFIRMED" } }),
    db.lead.count(),
    db.subscriber.count({ where: { status: "CONFIRMED" } }),
    db.service.count(),
    db.service.count({ where: { status: "APPROVED" } }),
    db.agreedAmountVerificationRequest.findMany({
      where: { status: { in: ["MISMATCH_ALERT", "PENDING"] } },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalQuotesAmountCents = totalQuotesAmountResult._sum.totalCents || 0;
  const totalPaidCents = paymentsSucceeded._sum.amountCents || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-[#03203d] bg-architectural-grid p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-[#02172d]">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#c9932a]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#c9932a]/40 text-[#c9932a] text-[11px] font-extrabold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monitorización en Tiempo Real · Madrid</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Resumen Ejecutivo del Negocio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Indicadores consolidados en PostgreSQL · Titular: <strong>ANDERSON BEJARANO VASQUEZ</strong> · Moneda: EUR · Zona horaria: Europe/Madrid
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/servicios"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#c9932a]" />
              <span>Editar Servicios ({servicesApprovedCount}/{servicesCount})</span>
            </Link>
            <Link
              href="/admin/presupuestos"
              className="px-5 py-2.5 rounded-xl bg-[#c9932a] hover:bg-amber-500 text-graphite-950 font-black text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-graphite-950" />
              <span>Gestión de Presupuestos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. AGREED AMOUNT MISMATCH DISCREPANCY ALERTS */}
      {pendingVerificationRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-800 space-y-3 shadow-md">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              Alertas Antifraude de Importe Acordado ({pendingVerificationRequests.length} pendientes de revisión)
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Un cliente ha intentado abonar un importe con una referencia que no coincide exactamente con el saldo aprobado en base de datos. El cobro ha sido bloqueado preventivamente.
          </p>
          <div className="space-y-2 pt-1">
            {pendingVerificationRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-graphite-900 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <span className="font-bold text-graphite-900 dark:text-white">{req.customer.name}</span>{" "}
                  <span className="text-graphite-500">({req.customer.email})</span> — Ref:{" "}
                  <span className="font-mono font-bold text-[#03203d] dark:text-[#c9932a]">
                    {req.quoteReference}
                  </span>
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 font-medium">
                    {req.discrepancyDetails}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-graphite-900 dark:text-white font-mono">
                    {(req.inputAmountCents / 100).toFixed(2)} €
                  </span>
                  <Link
                    href={`/admin/presupuestos?reviewId=${req.id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#03203d] text-white font-bold text-[11px] hover:bg-[#05305a] transition-colors"
                  >
                    Examinar discrepancia →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODERN KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Presupuestos */}
        <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#03203d]" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Presupuestos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#03203d]/10 dark:bg-[#c9932a]/15 flex items-center justify-center text-[#03203d] dark:text-[#c9932a]">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {quotesCount}
          </div>
          <div className="text-xs text-graphite-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-graphite-800">
            <span>Aprobados: <strong className="text-emerald-600">{quotesAcceptedCount}</strong></span>
            <span>Volumen: <strong className="text-graphite-900 dark:text-white">{(totalQuotesAmountCents / 100).toFixed(2)} €</strong></span>
          </div>
        </div>

        {/* Cobros reales */}
        <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#c9932a]" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Cobros Confirmados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#c9932a]/15 flex items-center justify-center text-[#c9932a]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {(totalPaidCents / 100).toFixed(2)} €
          </div>
          <div className="text-xs text-graphite-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-graphite-800">
            <span>Transacciones: <strong>{paymentsSucceeded._count}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
              Test Mode
            </span>
          </div>
        </div>

        {/* Citas y visitas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Agenda y Citas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {bookingsConfirmed}
          </div>
          <div className="text-xs text-graphite-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-graphite-800">
            <span>Total solicitadas: <strong>{bookingsTotal}</strong></span>
            <Link href="/admin/reservas" className="text-[#03203d] dark:text-[#c9932a] font-bold hover:underline">
              Ver agenda →
            </Link>
          </div>
        </div>

        {/* Catálogo & Suscriptores */}
        <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Leads y Comunidad
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-graphite-900 dark:text-white">
            {leadsCount + subscribersCount}
          </div>
          <div className="text-xs text-graphite-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-graphite-800">
            <span>Leads: <strong>{leadsCount}</strong></span>
            <span>Newsletter: <strong>{subscribersCount}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. QUICK MODULE SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/servicios"
          className="p-4 rounded-2xl bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 hover:border-[#c9932a] transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#03203d] text-[#c9932a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-graphite-900 dark:text-white block">
              Catálogo (20)
            </span>
            <span className="text-[11px] text-slate-500">Editar servicios</span>
          </div>
        </Link>

        <Link
          href="/admin/solicitudes"
          className="p-4 rounded-2xl bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 hover:border-[#c9932a] transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#03203d] text-[#c9932a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-graphite-900 dark:text-white block">
              Leads y Contactos
            </span>
            <span className="text-[11px] text-slate-500">Gestionar estado</span>
          </div>
        </Link>

        <Link
          href="/admin/blog"
          className="p-4 rounded-2xl bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 hover:border-[#c9932a] transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#03203d] text-[#c9932a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-graphite-900 dark:text-white block">
              Blog Editorial
            </span>
            <span className="text-[11px] text-slate-500">Artículos y SEO</span>
          </div>
        </Link>

        <Link
          href="/admin/configuracion"
          className="p-4 rounded-2xl bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 hover:border-[#c9932a] transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#03203d] text-[#c9932a] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-graphite-900 dark:text-white block">
              Configuración
            </span>
            <span className="text-[11px] text-slate-500">Datos fiscales</span>
          </div>
        </Link>
      </div>

      {/* 5. RECENT LEADS & SYSTEM INTEGRATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-graphite-800 pb-4">
            <h2 className="text-base font-extrabold text-graphite-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#c9932a]" />
              <span>Solicitudes Comerciales Recientes ({leadsCount})</span>
            </h2>
            <Link
              href="/admin/solicitudes"
              className="text-xs font-bold text-[#03203d] dark:text-[#c9932a] hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="text-xs text-graphite-500 py-6 text-center">
              No hay solicitudes nuevas de presupuesto registradas.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-graphite-800/60 border border-slate-200/70 dark:border-graphite-800 flex items-center justify-between gap-4 text-xs hover:border-[#c9932a]/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-graphite-900 dark:text-white block">
                      {lead.name}
                    </span>
                    <span className="text-graphite-500 block">
                      {lead.email} · Tel: {lead.phone}
                    </span>
                    <span className="text-[11px] text-[#03203d] dark:text-[#c9932a] font-semibold block pt-0.5">
                      CP {lead.postalCode || "Madrid"} · {lead.serviceName || lead.serviceSlug || "Consulta general"}
                    </span>
                  </div>
                  <span
                    className={`font-extrabold px-2.5 py-1 rounded-full text-[10px] ${
                      lead.status === "NEW"
                        ? "bg-amber-100 text-amber-800"
                        : lead.status === "CONTACTED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integration Status */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-graphite-800 pb-4">
            <h2 className="text-base font-extrabold text-graphite-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#c9932a]" />
              <span>Estado de Servicios e Integraciones</span>
            </h2>
            <Link
              href="/admin/integraciones"
              className="text-xs font-bold text-[#03203d] dark:text-[#c9932a] hover:underline"
            >
              Diagnóstico →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-graphite-800/50 border border-slate-200/60 dark:border-graphite-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">
                  Base de Datos PostgreSQL & Prisma
                </span>
                <span className="text-graphite-500">28 tablas activas con auditoría RBAC</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Conectado
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-graphite-800/50 border border-slate-200/60 dark:border-graphite-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">
                  Pasarela de Pagos Stripe
                </span>
                <span className="text-graphite-500">Checkout con validación antifraude de importe</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                Modo Pruebas
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-graphite-800/50 border border-slate-200/60 dark:border-graphite-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">
                  Motor de Facturación Fiscal
                </span>
                <span className="text-graphite-500">Series F2026 / R2026 correlativas</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                Test Adapter
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-graphite-800/50 border border-slate-200/60 dark:border-graphite-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-graphite-900 dark:text-white">
                  Servicio de Correo Transaccional Resend
                </span>
                <span className="text-graphite-500">Plantillas corporativas con pie oficial</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                Operativo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
