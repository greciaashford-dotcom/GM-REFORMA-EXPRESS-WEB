import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Locale } from "@/lib/constants";
import db from "@/lib/db";
import {
  FileCheck2,
  Calendar,
  Receipt,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface ClientePageProps {
  params: { locale: string };
}

export default async function ClienteOverviewPage({ params }: ClientePageProps) {
  const locale = params.locale as Locale;
  const user = (await getCurrentUser())!;

  // Fetch customer quotes
  const quotes = await db.quote.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      payments: { where: { status: "SUCCEEDED" } },
    },
  });

  // Fetch customer bookings
  const bookings = await db.booking.findMany({
    where: {
      OR: [
        { customerId: user.id },
        { clientEmail: user.email },
      ],
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: { startTimeUtc: "asc" },
  });

  // Fetch customer invoices
  const invoices = await db.invoice.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Calculate pending balance
  let totalApprovedCents = 0;
  let totalPaidCents = 0;

  for (const q of quotes) {
    if (q.status === "ACCEPTED" || q.status === "SENT") {
      totalApprovedCents += q.totalCents;
      const paid = q.payments.reduce((acc, p) => acc + p.amountCents, 0);
      totalPaidCents += paid;
    }
  }

  const pendingBalanceCents = Math.max(0, totalApprovedCents - totalPaidCents);

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
          Bienvenido a su área privada, {user.name}
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Desde aquí puede consultar sus presupuestos detallados, abonar los importes acordados mediante Stripe, revisar sus citas y descargar facturas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Presupuestos</span>
            <FileCheck2 className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {quotes.length}
          </div>
          <Link
            href={`/${locale}/cliente/presupuestos`}
            className="text-xs font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Ver presupuestos</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Saldo pendiente</span>
            <CreditCard className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {(pendingBalanceCents / 100).toFixed(2)} €
          </div>
          <Link
            href={`/${locale}/cliente/presupuestos`}
            className="text-xs font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Pagar hito acordado</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Citas activas</span>
            <Calendar className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {bookings.length}
          </div>
          <Link
            href={`/${locale}/cliente/reservas`}
            className="text-xs font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Gestionar citas</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-graphite-500">
            <span className="text-xs font-bold uppercase">Facturas</span>
            <Receipt className="w-4 h-4 text-petroleum-700" />
          </div>
          <div className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            {invoices.length}
          </div>
          <Link
            href={`/${locale}/cliente/facturas`}
            className="text-xs font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Descargar facturas</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Quotes */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
          Presupuestos de obra recientes
        </h2>

        {quotes.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-center text-sm text-graphite-500">
            No tiene presupuestos emitidos todavía. Puede solicitar uno nuevo desde la web pública.
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-petroleum-100 dark:bg-petroleum-900 text-petroleum-800 dark:text-petroleum-300">
                      {q.quoteNumber}
                    </span>
                    <span className="font-bold text-sm text-graphite-900 dark:text-white">
                      {q.title}
                    </span>
                  </div>
                  <p className="text-xs text-graphite-500">
                    Total: <strong className="text-graphite-900 dark:text-white">{(q.totalCents / 100).toFixed(2)} €</strong> (Base: {(q.subtotalCents / 100).toFixed(2)} € + {q.vatRatePercent}% IVA)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      q.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {q.status === "ACCEPTED" ? "Aprobado" : q.status}
                  </span>
                  <Link
                    href={`/${locale}/cliente/presupuestos?ref=${q.quoteNumber}`}
                    className="px-4 py-2 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-semibold text-xs transition-colors min-h-[44px] flex items-center"
                  >
                    Detalles y pago
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
