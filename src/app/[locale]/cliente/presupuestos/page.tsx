"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Locale } from "@/lib/constants";
import {
  FileCheck2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Lock,
} from "lucide-react";

interface PresupuestosClientePageProps {
  params: { locale: string };
}

export default function PresupuestosClientePage({ params }: PresupuestosClientePageProps) {
  const locale = params.locale as Locale;
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  // Agreed amount verification form state
  const [quoteReference, setQuoteReference] = useState(initialRef);
  const [inputAmountEuros, setInputAmountEuros] = useState("");
  const [serviceKey, setServiceKey] = useState("reformas-banos-madrid");

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    canPay: boolean;
    match: boolean;
    reason: string;
    quoteId?: string;
    verifiedAmountCents?: number;
    verificationRequestId?: string;
  } | null>(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Quotes list
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const res = await fetch("/api/quotes/my-quotes");
      const data = await res.json();
      if (res.ok) {
        setQuotes(data.quotes || []);
        // Pre-fill if ref matches
        if (initialRef && data.quotes) {
          const match = data.quotes.find((q: any) => q.quoteNumber === initialRef);
          if (match) {
            setInputAmountEuros((match.totalCents / 100).toFixed(2));
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationResult(null);

    const amountFloat = parseFloat(inputAmountEuros.replace(",", "."));
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setVerificationResult({
        canPay: false,
        match: false,
        reason: "Por favor, introduzca un importe numérico válido superior a 0 €.",
      });
      setVerifying(false);
      return;
    }

    const inputAmountCents = Math.round(amountFloat * 100);

    try {
      const res = await fetch("/api/quotes/verify-agreed-amount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteReference: quoteReference.trim(),
          inputAmountCents,
          serviceKey,
        }),
      });

      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult({
        canPay: false,
        match: false,
        reason: "Error de red al verificar el importe acordado.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleProceedToStripeCheckout = async () => {
    if (!verificationResult || !verificationResult.canPay || !verificationResult.quoteId) {
      return;
    }

    setCheckoutLoading(true);

    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: verificationResult.quoteId,
          // Notice: The backend retrieves and uses the VERIFIED DATABASE AMOUNT,
          // never trusting the client-submitted amount!
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al inicializar la pasarela de pago");
      }

      // Redirect to Stripe Checkout URL (or mock checkout if in test mode)
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(`Error en el pago: ${err.message}`);
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. CRITICAL SECTION: ABONAR IMPORTE ACORDADO */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Pago seguro con comprobación de importe acordado</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-graphite-900 dark:text-white">
            Abonar importe acordado de obra
          </h1>
          <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300">
            Introduzca la referencia de su presupuesto y el importe acordado. Nuestro sistema verificará en tiempo real la coincidencia exacta contra los datos aprobados en base de datos antes de habilitar la pasarela de pago.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Referencia del presupuesto *
              </label>
              <input
                type="text"
                required
                value={quoteReference}
                onChange={(e) => setQuoteReference(e.target.value)}
                placeholder="Ej. PRE-2026-001"
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Importe acordado en euros (€) *
              </label>
              <input
                type="text"
                required
                value={inputAmountEuros}
                onChange={(e) => setInputAmountEuros(e.target.value)}
                placeholder="Ej. 4800.00"
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Servicio
              </label>
              <select
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              >
                <option value="reformas-banos-madrid">Reformas de baños</option>
                <option value="reformas-cocinas-madrid">Reformas de cocinas</option>
                <option value="reformas-integrales-madrid">Reformas integrales</option>
                <option value="cambio-banera-ducha-madrid">Bañera por ducha</option>
                <option value="suelos-tarima-madrid">Suelos y tarima</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-graphite-500">
              * El servidor calcula y valida los impuestos según la base de datos.
            </span>
            <button
              type="submit"
              disabled={verifying}
              className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Comprobando en base de datos...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar coincidencia de importe</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Verification Result Feedback */}
        {verificationResult && (
          <div
            className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-3 animate-in fade-in duration-150 ${
              verificationResult.canPay
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {verificationResult.canPay ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {verificationResult.canPay
                    ? "¡Importe validado con éxito!"
                    : "Cobro bloqueado por discrepancia de importe"}
                </p>
                <p className="leading-relaxed">{verificationResult.reason}</p>
                {verificationResult.verificationRequestId && !verificationResult.canPay && (
                  <p className="text-xs opacity-80 pt-1 font-mono">
                    ID de solicitud de revisión para administración: {verificationResult.verificationRequestId}
                  </p>
                )}
              </div>
            </div>

            {verificationResult.canPay && (
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={handleProceedToStripeCheckout}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition-all flex items-center gap-2 min-h-[44px] disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Conectando con Stripe Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>
                        Pagar {(verificationResult.verifiedAmountCents! / 100).toFixed(2)} € mediante Stripe
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. LIST OF APPROVED QUOTES */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
          Mis presupuestos registrados
        </h2>

        {loadingQuotes ? (
          <div className="p-8 text-center text-sm text-graphite-500">
            Cargando presupuestos...
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-center text-sm text-graphite-500">
            No constan presupuestos en su cuenta.
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-graphite-100 dark:border-graphite-800 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-petroleum-100 dark:bg-petroleum-900 text-petroleum-800 dark:text-petroleum-300">
                      {q.quoteNumber}
                    </span>
                    <h3 className="font-bold text-base text-graphite-900 dark:text-white mt-1">
                      {q.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-graphite-500 block">Total con IVA</span>
                    <span className="text-lg font-extrabold text-graphite-900 dark:text-white">
                      {(q.totalCents / 100).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Lines breakdown */}
                {q.versions?.[0]?.lines && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-graphite-500">Partidas presupuestadas:</span>
                    <div className="space-y-1.5 text-xs text-graphite-700 dark:text-slate-300">
                      {q.versions[0].lines.map((l: any) => (
                        <div key={l.id} className="flex justify-between py-1 border-b border-graphite-50 dark:border-graphite-800/60">
                          <span>{l.concept}</span>
                          <span className="font-mono font-medium">{(l.totalCents / 100).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-graphite-500">
                    Base imponible: {(q.subtotalCents / 100).toFixed(2)} € · {q.vatRatePercent}% IVA: {(q.vatAmountCents / 100).toFixed(2)} €
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteReference(q.quoteNumber);
                      setInputAmountEuros((q.totalCents / 100).toFixed(2));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 rounded-xl bg-petroleum-50 text-petroleum-800 hover:bg-petroleum-100 dark:bg-petroleum-950 dark:text-petroleum-300 text-xs font-bold transition-colors min-h-[44px]"
                  >
                    Usar para pago de importe acordado →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
