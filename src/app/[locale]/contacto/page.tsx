"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { BRAND, isPostalCodeCovered } from "@/lib/constants";
import { Phone, Mail, MessageSquare, Clock, MapPin, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

export default function ContactoPage() {
  const params = useParams();
  const locale = (params.locale as string) || "es";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("28001");
  const [message, setMessage] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!privacyConsent) {
      setErrorMessage("Debe aceptar la política de privacidad para enviar su consulta.");
      return;
    }

    if (!isPostalCodeCovered(postalCode)) {
      setErrorMessage("El código postal indicado se encuentra fuera de nuestra área de cobertura inicial de Madrid.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          postalCode,
          description: message,
          preferredLocale: locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar mensaje");

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al enviar el mensaje de contacto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950/60 text-petroleum-800 dark:text-petroleum-300 text-xs font-bold">
          Atención al Cliente en Madrid
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-graphite-900 dark:text-white tracking-tight">
          Hablemos de su proyecto
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Llámenos directamente, escríbanos por WhatsApp o complete el formulario para recibir respuesta de un técnico en menos de 24 horas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <a
            href={BRAND.phoneTel}
            className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm block hover:border-petroleum-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-petroleum-100 dark:bg-petroleum-950/60 text-petroleum-800 dark:text-petroleum-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-graphite-900 dark:text-white">
              Teléfono Directo
            </h3>
            <p className="text-base font-extrabold text-petroleum-700 dark:text-petroleum-400 mt-1">
              {BRAND.phoneVisible}
            </p>
            <p className="text-xs text-graphite-500 mt-1">
              Lunes a Viernes 09:00 - 19:00, Sábados 10:00 - 14:00
            </p>
          </a>

          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm block hover:border-emerald-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-graphite-900 dark:text-white">
              WhatsApp Oficial
            </h3>
            <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              +34 640 677 948
            </p>
            <p className="text-xs text-graphite-500 mt-1">
              Envío de planos, fotos y consultas rápidas sin esperas.
            </p>
          </a>

          <div className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-graphite-800 text-graphite-800 dark:text-slate-200 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-petroleum-700" />
            </div>
            <h3 className="text-sm font-bold text-graphite-900 dark:text-white">
              Correo Electrónico
            </h3>
            <p className="text-xs font-bold text-graphite-700 dark:text-slate-300 mt-1 break-all">
              {BRAND.email}
            </p>
            <p className="text-xs text-graphite-500 mt-1">
              Notificaciones oficiales y envío de pliegos técnicos.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-graphite-900 dark:text-white">
                ¡Mensaje recibido con éxito!
              </h2>
              <p className="text-sm text-graphite-600 dark:text-slate-300 max-w-md mx-auto">
                Hemos registrado su consulta. Un técnico de GM REFORMA EXPRESS le responderá en un plazo máximo de 24 horas laborables.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-graphite-900 dark:text-white">
                Envíenos un mensaje directo
              </h2>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-200 text-xs">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Su nombre"
                    className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                    Teléfono de contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="600 000 000"
                    className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="su-email@ejemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                    Código Postal (Madrid) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="28001"
                    className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                  Consulta o descripción de su reforma *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explíquenos brevemente qué tipo de reforma necesita (baño, cocina, integral, climatización...)"
                  className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-petroleum-700 focus:ring-petroleum-600 border-graphite-300"
                />
                <label htmlFor="privacy" className="text-xs text-graphite-600 dark:text-slate-400 leading-relaxed">
                  He leído y acepto la{" "}
                  <a href={`/${locale}/privacidad`} target="_blank" className="text-petroleum-700 underline font-medium">
                    política de privacidad
                  </a>{" "}
                  para la gestión y respuesta a mi consulta técnica en la Comunidad de Madrid.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando consulta...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Consulta Técnica
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
