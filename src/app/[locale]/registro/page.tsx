"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale, BRAND } from "@/lib/constants";
import Logo from "@/components/brand/Logo";
import { Lock, Mail, User, Phone, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface RegisterPageProps {
  params: { locale: string };
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const locale = params.locale as Locale;
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas introducidas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!privacyConsent) {
      setError("Debe aceptar la política de privacidad para crear una cuenta.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          privacyConsent,
          marketingConsent,
          preferredLocale: locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar la cuenta");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            ¡Cuenta creada con éxito!
          </h1>
          <p className="text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
            Hemos enviado un correo de verificación a <strong>{email}</strong>. Por favor, revise su bandeja de entrada para activar su cuenta.
          </p>
          <div className="pt-4">
            <Link
              href={`/${locale}/login`}
              className="inline-flex px-6 py-3 rounded-xl bg-petroleum-800 text-white font-bold text-xs"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-8 sm:p-10 rounded-3xl shadow-sm">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-20 sm:h-24 w-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            Crear cuenta de cliente
          </h1>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400">
            Acceda a sus presupuestos, citas y facturas de obra
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Nombre y apellidos *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-graphite-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Correo electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-graphite-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
              Teléfono (opcional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-graphite-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 8 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Confirmar clave *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetir clave"
                className="w-full px-3.5 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
            </div>
          </div>

          {/* Consents */}
          <div className="space-y-3 pt-2 border-t border-graphite-100 dark:border-graphite-800 text-xs text-graphite-600 dark:text-slate-400">
            <div className="flex items-start gap-2.5">
              <input
                id="reg-privacy"
                type="checkbox"
                required
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-0.5 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="reg-privacy" className="cursor-pointer leading-normal">
                He leído y acepto la <a href={`/${locale}/privacidad`} target="_blank" className="underline font-semibold text-petroleum-800 dark:text-petroleum-300">política de privacidad</a> para la gestión de mi cuenta y presupuestos. *
              </label>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="reg-marketing"
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-0.5 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="reg-marketing" className="cursor-pointer leading-normal">
                (Opcional) Deseo recibir el boletín técnico bisemanal con consejos y novedades sobre reformas.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando cuenta...</span>
              </>
            ) : (
              <span>Crear mi cuenta</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-graphite-100 dark:border-graphite-800 text-center text-xs text-graphite-500">
          ¿Ya tiene cuenta?{" "}
          <Link
            href={`/${locale}/login`}
            className="font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline"
          >
            Inicie sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
