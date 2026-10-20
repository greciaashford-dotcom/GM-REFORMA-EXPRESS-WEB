"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Locale, BRAND } from "@/lib/constants";
import Logo from "@/components/brand/Logo";
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface LoginPageProps {
  params: { locale: string };
}

export default function LoginPage({ params }: LoginPageProps) {
  const locale = params.locale as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback") || `/${locale}/cliente`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      // Check role to direct to /admin or customer area
      if (data.user.role !== "CUSTOMER") {
        router.push("/admin");
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-8 sm:p-10 rounded-3xl shadow-sm">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-20 sm:h-24 w-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            Iniciar sesión
          </h1>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400">
            Acceda a su área privada de cliente o panel de administración
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
              Correo electrónico
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300">
                Contraseña
              </label>
              <Link
                href={`/${locale}/recuperar-clave`}
                className="text-xs text-petroleum-800 dark:text-petroleum-400 hover:underline"
              >
                ¿Olvidó su clave?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-graphite-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
              />
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
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <span>Acceder al área privada</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-graphite-100 dark:border-graphite-800 text-center text-xs text-graphite-500">
          ¿No dispone de cuenta todavía?{" "}
          <Link
            href={`/${locale}/registro`}
            className="font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline"
          >
            Regístrese aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
