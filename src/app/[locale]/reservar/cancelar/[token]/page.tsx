"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  const params = useParams();
  const token = params.token as string;
  const locale = (params.locale as string) || "es";
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cancelar la reserva");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al cancelar la cita");
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
          Cita Cancelada
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Su reserva ha sido cancelada correctamente en nuestro sistema y la franja horaria ha quedado liberada.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/reservar`}
            className="px-6 py-3 rounded-xl bg-petroleum-800 text-white font-bold text-sm hover:bg-petroleum-900 transition-colors inline-block"
          >
            Reservar Nueva Cita
          </Link>
          <Link
            href={`/${locale}`}
            className="px-6 py-3 rounded-xl bg-warm-200 dark:bg-graphite-800 text-graphite-800 dark:text-white font-bold text-sm hover:bg-warm-300 transition-colors inline-block"
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
          Cancelar Cita Reservada
        </h1>
        <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 mt-2">
          ¿Desea cancelar su visita de valoración o llamada técnica con el equipo de GM REFORMA EXPRESS?
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCancel} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-2">
            Motivo de la cancelación (Opcional)
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Cambio de planes, ya contraté otro servicio, prefiero posponerlo..."
            className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
          />
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
          Si lo prefiere, puede optar por <strong>reprogramar</strong> la cita en lugar de cancelarla definitivamente para no perder su prioridad técnica.
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Confirmar Cancelación
              </>
            )}
          </button>
          <Link
            href={`/${locale}`}
            className="py-3.5 px-6 rounded-xl bg-warm-200 dark:bg-graphite-800 text-graphite-800 dark:text-white font-bold text-sm text-center hover:bg-warm-300 transition-colors"
          >
            Mantener Cita
          </Link>
        </div>
      </form>
    </div>
  );
}
