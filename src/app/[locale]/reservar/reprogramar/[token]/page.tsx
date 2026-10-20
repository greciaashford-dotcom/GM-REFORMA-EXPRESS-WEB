"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReschedulePage() {
  const params = useParams();
  const token = params.token as string;
  const locale = (params.locale as string) || "es";
  const router = useRouter();

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!date) return;
    fetchSlots();
  }, [date]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/bookings/available-slots?date=${date}&type=ORIENTATION_CALL`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage("Por favor, seleccione un horario disponible.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          startTimeUtc: selectedSlot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al reprogramar la cita");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al reprogramar la cita");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-graphite-900 dark:text-white">
          ¡Cita Reprogramada con Éxito!
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Su reserva ha sido actualizada a la nueva fecha y hora solicitadas. Hemos enviado una actualización a su correo electrónico.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-graphite-500 hover:text-petroleum-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-graphite-900 dark:text-white tracking-tight">
          Reprogramar Cita Técnica o Consulta
        </h1>
        <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 mt-2">
          Seleccione una nueva fecha y franja horaria disponible en nuestro calendario de Madrid.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleReschedule} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-2">
            Seleccionar Nueva Fecha
          </label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-2">
            Horarios Disponibles para Madrid (Europa/Madrid)
          </label>
          {loadingSlots ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs text-graphite-500">
              <Loader2 className="w-4 h-4 animate-spin text-petroleum-700" />
              Cargando disponibilidad de técnicos...
            </div>
          ) : slots.length === 0 ? (
            <div className="p-4 rounded-xl bg-warm-100 dark:bg-graphite-800 text-xs text-graphite-600 text-center">
              No hay horarios libres en la fecha seleccionada. Por favor escoja otro día laborable.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSelectedSlot(s.startTime)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    !s.available
                      ? "opacity-30 cursor-not-allowed bg-graphite-100 dark:bg-graphite-800 border-transparent text-graphite-400"
                      : selectedSlot === s.startTime
                      ? "bg-petroleum-800 text-white border-petroleum-800 shadow-sm"
                      : "bg-white dark:bg-graphite-800 border-graphite-200 dark:border-graphite-700 hover:border-petroleum-600 text-graphite-800 dark:text-slate-200"
                  }`}
                >
                  {s.displayTime}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedSlot}
          className="w-full py-3.5 px-6 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Actualizando cita...
            </>
          ) : (
            "Confirmar Nueva Fecha y Hora"
          )}
        </button>
      </form>
    </div>
  );
}
