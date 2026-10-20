"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Locale, BRAND, isPostalCodeCovered } from "@/lib/constants";
import { BOOKING_TYPES } from "@/lib/booking/engine";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

interface BookingPageProps {
  params: { locale: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  const locale = params.locale as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("servicio") || "reformas-banos-madrid";

  const [step, setStep] = useState(1);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [serviceKey, setServiceKey] = useState(preselectedService);
  const [serviceTitle, setServiceTitle] = useState("Reformas de baños");
  const [bookingType, setBookingType] = useState<"ORIENTATION_CALL" | "VALUATION_VISIT">("VALUATION_VISIT");
  const [postalCode, setPostalCode] = useState("28001");
  const [postalCovered, setPostalCovered] = useState(true);
  const [address, setAddress] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectDetails, setProjectDetails] = useState("");

  // Slot selection
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    // If tomorrow is Sunday, skip to Monday
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Available services list for step 1
  const serviceOptions = [
    { key: "reformas-banos-madrid", title: "Reformas de baños" },
    { key: "reformas-cocinas-madrid", title: "Reformas de cocinas" },
    { key: "reformas-integrales-madrid", title: "Reformas integrales" },
    { key: "cambio-banera-ducha-madrid", title: "Cambio de bañera por ducha" },
    { key: "suelos-tarima-madrid", title: "Suelos y tarima" },
    { key: "fontaneria-madrid", title: "Fontanería y tuberías" },
    { key: "electricidad-iluminacion-madrid", title: "Electricidad e iluminación" },
    { key: "ventanas-cerramientos-madrid", title: "Ventanas y cerramientos" },
    { key: "accesibilidad-viviendas-madrid", title: "Viviendas accesibles" },
    { key: "reformas-comunidades-madrid", title: "Comunidades de propietarios" },
  ];

  // Fetch slots whenever date or type changes
  useEffect(() => {
    if (step === 5) {
      fetchSlots();
    }
  }, [step, selectedDate, bookingType]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setErrorMessage("");
    setSelectedSlot(null);

    try {
      const res = await fetch(
        `/api/bookings/available-slots?date=${selectedDate}&type=${bookingType}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar horarios");
      setAvailableSlots(data.slots || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al comprobar disponibilidad");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPostalCode(val);
    if (val.length === 5) {
      setPostalCovered(isPostalCodeCovered(val));
    }
  };

  const handleNextStep = () => {
    setErrorMessage("");

    if (step === 3) {
      if (!isPostalCodeCovered(postalCode)) {
        setErrorMessage("El código postal introducido no está en nuestra área de cobertura inicial de Madrid (prefijos 280-289).");
        return;
      }
    }

    if (step === 4) {
      if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
        setErrorMessage("Por favor, rellene su nombre, correo electrónico y teléfono de contacto.");
        return;
      }
    }

    if (step === 5) {
      if (!selectedSlot) {
        setErrorMessage("Por favor, seleccione un horario disponible.");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceKey,
          serviceTitle,
          type: bookingType,
          postalCode,
          address,
          clientName,
          clientEmail,
          clientPhone,
          projectDetails,
          startTimeUtc: selectedSlot.startTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al confirmar la reserva");
      }

      router.push(`/${locale}/reservar/confirmacion?id=${data.booking.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "No fue posible completar la reserva");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Wizard Header */}
      <div className="space-y-2 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-petroleum-800 dark:text-petroleum-400">
          Paso {step} de 6
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-graphite-900 dark:text-white">
          Reservar cita o visita técnica
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-400">
          Atención técnica en Madrid con agenda en tiempo real y confirmación inmediata
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-graphite-200 dark:bg-graphite-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-petroleum-800 dark:bg-petroleum-400 h-full transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        ></div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Servicio */}
      {step === 1 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-6">
          <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
            1. Seleccione el servicio que desea valorar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setServiceKey(opt.key);
                  setServiceTitle(opt.title);
                }}
                className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all min-h-[44px] ${
                  serviceKey === opt.key
                    ? "border-petroleum-800 bg-petroleum-50 text-petroleum-900 dark:bg-petroleum-950/60 dark:text-petroleum-300 dark:border-petroleum-500 shadow-sm"
                    : "border-graphite-200 dark:border-graphite-700 hover:border-graphite-400 text-graphite-800 dark:text-slate-200"
                }`}
              >
                {opt.title}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Tipo de Cita */}
      {step === 2 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-6">
          <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
            2. Elija la modalidad de la cita
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setBookingType("VALUATION_VISIT")}
              className={`p-5 rounded-2xl border text-left space-y-2 transition-all ${
                bookingType === "VALUATION_VISIT"
                  ? "border-petroleum-800 bg-petroleum-50 text-petroleum-900 dark:bg-petroleum-950/60 dark:text-petroleum-300 dark:border-petroleum-500 shadow-sm"
                  : "border-graphite-200 dark:border-graphite-700 hover:border-graphite-400 text-graphite-800 dark:text-slate-200"
              }`}
            >
              <div className="font-bold text-base flex items-center justify-between">
                <span>{BOOKING_TYPES.VALUATION_VISIT.label}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-petroleum-100 dark:bg-petroleum-900 text-petroleum-800 dark:text-petroleum-300">
                  45 min
                </span>
              </div>
              <p className="text-xs text-graphite-600 dark:text-slate-400 leading-relaxed">
                {BOOKING_TYPES.VALUATION_VISIT.desc}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setBookingType("ORIENTATION_CALL")}
              className={`p-5 rounded-2xl border text-left space-y-2 transition-all ${
                bookingType === "ORIENTATION_CALL"
                  ? "border-petroleum-800 bg-petroleum-50 text-petroleum-900 dark:bg-petroleum-950/60 dark:text-petroleum-300 dark:border-petroleum-500 shadow-sm"
                  : "border-graphite-200 dark:border-graphite-700 hover:border-graphite-400 text-graphite-800 dark:text-slate-200"
              }`}
            >
              <div className="font-bold text-base flex items-center justify-between">
                <span>{BOOKING_TYPES.ORIENTATION_CALL.label}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-petroleum-100 dark:bg-petroleum-900 text-petroleum-800 dark:text-petroleum-300">
                  20 min
                </span>
              </div>
              <p className="text-xs text-graphite-600 dark:text-slate-400 leading-relaxed">
                {BOOKING_TYPES.ORIENTATION_CALL.desc}
              </p>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Cobertura y Código Postal */}
      {step === 3 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-6">
          <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
            3. Verificación de cobertura en Madrid
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label htmlFor="postal-code" className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Código postal del inmueble
              </label>
              <input
                id="postal-code"
                type="text"
                maxLength={5}
                value={postalCode}
                onChange={handlePostalCodeChange}
                placeholder="Ej. 28001"
                className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-base font-mono focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>

            {postalCode.length === 5 && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  postalCovered
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                {postalCovered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Zona con cobertura activa en la Comunidad de Madrid.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Código postal fuera del área de servicio inicial de Madrid.</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!postalCovered || postalCode.length !== 5}
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Datos de Contacto y Proyecto */}
      {step === 4 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-6">
          <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
            4. Datos de contacto y detalles de la vivienda
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                  Nombre y apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>

            {bookingType === "VALUATION_VISIT" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                  Dirección del inmueble en Madrid (Calle, número, piso)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle de Alcalá 120, 3º B"
                  className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Breve descripción de la reforma o dudas principales
              </label>
              <textarea
                rows={3}
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                placeholder="Ej. Queremos cambiar la bañera por plato de ducha y renovar el alicatado..."
                className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <span>Continuar a horarios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Fecha y Selección de Hueco Real */}
      {step === 5 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-6">
          <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
            5. Seleccione la fecha y franja horaria disponible
          </h2>

          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Fecha deseada
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>

            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-2">
                Horarios disponibles para el {selectedDate} (Hora de Madrid)
              </span>

              {loadingSlots ? (
                <div className="py-8 flex items-center justify-center gap-2 text-sm text-graphite-500">
                  <Loader2 className="w-5 h-5 animate-spin text-petroleum-700" />
                  <span>Calculando disponibilidad en tiempo real...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-warm-100 dark:bg-graphite-800 text-xs sm:text-sm text-graphite-600 dark:text-slate-400">
                  No hay franjas disponibles para esta fecha. Por favor, seleccione otro día (los domingos permanecemos cerrados).
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg text-xs font-semibold text-center transition-all min-h-[44px] ${
                        !slot.available
                          ? "bg-graphite-100 dark:bg-graphite-800 text-graphite-400 dark:text-graphite-600 cursor-not-allowed line-through"
                          : selectedSlot?.startTime === slot.startTime
                          ? "bg-petroleum-800 text-white font-bold shadow-md"
                          : "border border-graphite-200 dark:border-graphite-700 text-graphite-800 dark:text-slate-200 hover:border-petroleum-600 hover:bg-warm-50 dark:hover:bg-graphite-800"
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              <span>Ver resumen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Resumen, Condiciones y Confirmación */}
      {step === 6 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-6">
          <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
            6. Resumen de la reserva y confirmación
          </h2>

          <div className="p-5 rounded-2xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-graphite-200 dark:border-graphite-700 pb-2">
              <span className="text-graphite-500">Servicio solicitado:</span>
              <span className="font-bold text-graphite-900 dark:text-white">{serviceTitle}</span>
            </div>
            <div className="flex justify-between border-b border-graphite-200 dark:border-graphite-700 pb-2">
              <span className="text-graphite-500">Modalidad:</span>
              <span className="font-bold text-graphite-900 dark:text-white">
                {BOOKING_TYPES[bookingType].label} ({BOOKING_TYPES[bookingType].durationMinutes} min)
              </span>
            </div>
            <div className="flex justify-between border-b border-graphite-200 dark:border-graphite-700 pb-2">
              <span className="text-graphite-500">Fecha y hora:</span>
              <span className="font-bold text-graphite-900 dark:text-white">
                {selectedDate} a las {selectedSlot?.displayTime} (hora de Madrid)
              </span>
            </div>
            <div className="flex justify-between border-b border-graphite-200 dark:border-graphite-700 pb-2">
              <span className="text-graphite-500">Contacto:</span>
              <span className="font-bold text-graphite-900 dark:text-white">{clientName} ({clientPhone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite-500">Código postal:</span>
              <span className="font-bold text-graphite-900 dark:text-white">{postalCode} (Madrid)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 border border-petroleum-200 dark:border-petroleum-800 text-xs text-petroleum-900 dark:text-petroleum-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-petroleum-700" />
              Condiciones de la cita
            </p>
            <p className="leading-relaxed">
              Esta reserva no constituye por sí sola el inicio de obras ni sustituye el presupuesto o contrato formal. Recibirá un correo con el archivo .ics para incorporar a su calendario y los enlaces para reprogramar o cancelar si lo necesita.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep(5)}
              className="px-5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 text-graphite-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="px-8 py-3.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 min-h-[48px] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando reserva...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar mi reserva</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
