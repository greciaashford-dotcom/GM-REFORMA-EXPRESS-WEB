"use client";

import React, { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const token = searchParams.get("token") || "";
  const locale = (params.locale as string) || "es";

  const [emailInput, setEmailInput] = useState("");
  const [reason, setReason] = useState("Demasiados correos");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || emailInput,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la baja");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al solicitar la baja");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-graphite-100 dark:bg-graphite-800 text-graphite-600 dark:text-slate-300 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-graphite-900 dark:text-white">
          Baja Tramitada
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300 max-w-md mx-auto">
          Su dirección de correo ha sido añadida a la lista de exclusión (supresión de comunicaciones comerciales). No volverá a recibir nuestros boletines periódicos.
        </p>
        <div className="pt-4">
          <Link
            href={`/${locale}`}
            className="px-6 py-3 rounded-xl bg-petroleum-800 text-white font-bold text-sm hover:bg-petroleum-900 transition-colors inline-block"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-graphite-500 hover:text-petroleum-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-graphite-900 dark:text-white tracking-tight">
          Darse de baja del boletín informativo
        </h1>
        <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 mt-2">
          Lamentamos que decida marcharse. Complete el formulario para no recibir más promociones ni novedades.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleUnsubscribe} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-6">
        {!token && (
          <div>
            <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-2">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="su-correo@ejemplo.com"
              className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-2">
            Motivo (Opcional)
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
          >
            <option value="Demasiados correos">Recibo demasiados correos</option>
            <option value="Ya no resido en Madrid">Ya no resido en la Comunidad de Madrid</option>
            <option value="Reforma ya finalizada">Ya finalicé las obras en mi hogar</option>
            <option value="Contenido no relevante">El contenido no me resulta relevante</option>
            <option value="Otro">Otro motivo</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-xl bg-graphite-800 hover:bg-black text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando baja...
            </>
          ) : (
            "Confirmar Baja Definitiva"
          )}
        </button>
      </form>
    </div>
  );
}
