"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Locale, BRAND, isPostalCodeCovered } from "@/lib/constants";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Phone,
} from "lucide-react";

interface PresupuestoPageProps {
  params: { locale: string };
}

export default function PresupuestoPage({ params }: PresupuestoPageProps) {
  const locale = params.locale as Locale;
  const searchParams = useSearchParams();
  const preselected = searchParams.get("servicio") || "reformas-banos-madrid";

  const [serviceSlug, setServiceSlug] = useState(preselected);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("28001");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [preferredContactTime, setPreferredContactTime] = useState("Mañanas (09:00 - 14:00)");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!privacyConsent) {
      setErrorMessage("Debe aceptar la política de privacidad para procesar su solicitud de presupuesto.");
      return;
    }

    if (!isPostalCodeCovered(postalCode)) {
      setErrorMessage("El código postal indicado no se encuentra dentro del área de servicio inicial de la Comunidad de Madrid.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          name,
          email,
          phone,
          postalCode,
          address,
          description,
          preferredContactTime,
          preferredLocale: locale,
          marketingConsent,
        }),
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar la solicitud");

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-graphite-900 dark:text-white">
          ¡Solicitud de presupuesto enviada!
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
          Hemos recibido los detalles de su proyecto. Un técnico de GM REFORMA EXPRESS analizará su caso y se pondrá en contacto con usted en un plazo máximo de 24 horas laborables.
        </p>
        <div className="p-4 rounded-xl bg-warm-100 dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-xs text-graphite-600 max-w-md mx-auto">
          ¿Tiene alguna duda urgente? Puede llamarnos directamente al{" "}
          <a href={BRAND.phoneTel} className="font-bold underline text-graphite-900 dark:text-white">{BRAND.phoneVisible}</a>.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite-900 dark:text-white">
          Solicitar presupuesto de reforma
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-400 max-w-xl mx-auto">
          Cuéntanos los detalles de tu vivienda en Madrid y elaboraremos una propuesta técnica adaptada con partidas desglosadas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Servicio de reforma *
            </label>
            <select
              value={serviceSlug}
              onChange={(e) => setServiceSlug(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
            >
              <option value="reformas-banos-madrid">Reformas de baños</option>
              <option value="reformas-cocinas-madrid">Reformas de cocinas</option>
              <option value="reformas-integrales-madrid">Reformas integrales</option>
              <option value="cambio-banera-ducha-madrid">Cambio de bañera por ducha</option>
              <option value="pequenas-reformas-madrid">Pequeñas reformas del hogar</option>
              <option value="pintura-alisado-madrid">Pintura y alisado de paredes</option>
              <option value="suelos-tarima-madrid">Suelos y tarima</option>
              <option value="carpinteria-puertas-madrid">Carpintería interior y puertas</option>
              <option value="fontaneria-madrid">Fontanería e instalaciones</option>
              <option value="electricidad-iluminacion-madrid">Electricidad e iluminación</option>
              <option value="ventanas-cerramientos-madrid">Ventanas y cerramientos</option>
              <option value="aislamiento-madrid">Aislamiento térmico y acústico</option>
              <option value="climatizacion-aerotermia-madrid">Climatización y aerotermia</option>
              <option value="humedades-madrid">Diagnóstico y solución de humedades</option>
              <option value="accesibilidad-viviendas-madrid">Viviendas y baños accesibles</option>
              <option value="rehabilitacion-fachadas-madrid">Rehabilitación de fachadas</option>
              <option value="cubiertas-impermeabilizacion-madrid">Cubiertas e impermeabilización</option>
              <option value="reformas-comunidades-madrid">Reformas para comunidades</option>
              <option value="accesibilidad-portales-madrid">Accesibilidad en portales</option>
              <option value="acondicionamiento-locales-madrid">Acondicionamiento de locales</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Nombre y apellidos *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Laura García"
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Teléfono de contacto *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Código postal (Comunidad de Madrid) *
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="28001"
                className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Dirección de la obra (Opcional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, piso..."
              className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Descripción de las obras necesarias *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explícanos tu idea, metros aproximados de la estancia, materiales que te gustaría incorporar..."
              className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Horario preferente de contacto
            </label>
            <select
              value={preferredContactTime}
              onChange={(e) => setPreferredContactTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary min-h-[44px]"
            >
              <option value="Mañanas (09:00 - 14:00)">Mañanas (09:00 - 14:00)</option>
              <option value="Tardes (15:00 - 19:00)">Tardes (15:00 - 19:00)</option>
              <option value="Cualquier hora">Cualquier momento</option>
            </select>
          </div>
        </div>

        {/* Legal Consent Checkboxes */}
        <div className="space-y-3 pt-2 border-t border-graphite-100 dark:border-graphite-800">
          <div className="flex items-start gap-2.5">
            <input
              id="privacy-check"
              type="checkbox"
              required
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-secondary mt-1 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="privacy-check" className="text-xs text-graphite-600 dark:text-slate-400 leading-normal cursor-pointer">
              He leído y acepto la <a href={`/${locale}/privacidad`} target="_blank" className="underline font-semibold text-primary dark:text-secondary">política de privacidad</a> para la gestión precontractual de mi solicitud de presupuesto. *
            </label>
          </div>

          <div className="flex items-start gap-2.5">
            <input
              id="marketing-check"
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-secondary mt-1 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="marketing-check" className="text-xs text-graphite-600 dark:text-slate-400 leading-normal cursor-pointer">
              (Opcional) Deseo recibir consejos técnicos, guías y novedades sobre reformas de GM REFORMA EXPRESS (hasta dos envíos semanales, baja inmediata en cualquier momento).
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-secondary hover:bg-gold-600 text-graphite-950 font-black text-base shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando solicitud...</span>
            </>
          ) : (
            <>
              <ClipboardCheck className="w-5 h-5 text-graphite-950" />
              <span>Solicitar presupuesto detallado</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
