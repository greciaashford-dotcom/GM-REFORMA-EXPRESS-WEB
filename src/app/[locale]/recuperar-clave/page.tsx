"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Locale, BRAND } from "@/lib/constants";
import Logo from "@/components/brand/Logo";
import { Mail, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

interface RecuperarClavePageProps {
  params: { locale: string };
}

export default function RecuperarClavePage({ params }: RecuperarClavePageProps) {
  const locale = (params.locale as Locale) || "es";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-8 sm:p-10 rounded-3xl shadow-sm">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-20 sm:h-24 w-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            Recuperar contraseña
          </h1>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400">
            Introduzca el correo electrónico asociado a su cuenta de cliente en {BRAND.name}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Solicitud procesada
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Si la dirección <strong>{email}</strong> figura en nuestra base de datos de clientes activos, recibirá en unos minutos un enlace temporal para restablecer su contraseña.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#03203d] text-white font-bold text-xs hover:bg-[#05305a] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Iniciar Sesión</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Correo electrónico registrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-graphite-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#03203d] hover:bg-[#05305a] text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando instrucciones...</span>
                </>
              ) : (
                <span>Enviar enlace de recuperación</span>
              )}
            </button>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-graphite-800/60 border border-slate-200 dark:border-graphite-700 flex items-start gap-2.5 text-[11px] text-graphite-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#c9932a] shrink-0 mt-0.5" />
              <span>
                Por motivos de seguridad RGPD, si necesita asistencia inmediata con su expediente de obra puede llamarnos al{" "}
                <a href={BRAND.phoneTel} className="font-bold underline text-graphite-900 dark:text-white">
                  {BRAND.phoneVisible}
                </a>.
              </span>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-graphite-100 dark:border-graphite-800 text-center text-xs text-graphite-500">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1.5 font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al acceso de clientes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
