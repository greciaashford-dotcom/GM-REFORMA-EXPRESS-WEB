"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const token = searchParams.get("token");
  const locale = (params.locale as string) || "es";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("No se ha proporcionado un token de confirmación válido.");
      setLoading(false);
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch(`/api/newsletter/confirm?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
        } else {
          setErrorMessage(data.error || "No se pudo confirmar la suscripción.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Error al verificar el token.");
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [token]);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-petroleum-700 mx-auto" />
          <h1 className="text-xl font-bold text-graphite-900 dark:text-white">
            Verificando su suscripción...
          </h1>
          <p className="text-xs text-graphite-500">
            Validando consentimiento conforme a la normativa RGPD/AEPD.
          </p>
        </div>
      ) : success ? (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-graphite-900 dark:text-white">
            ¡Suscripción Confirmada!
          </h1>
          <p className="text-sm text-graphite-600 dark:text-slate-300 max-w-md mx-auto">
            Gracias por validar su dirección de correo electrónico. A partir de ahora recibirá nuestras promociones exclusivas, guías de reforma e ideas para su hogar en Madrid (máximo 2 comunicaciones semanales).
          </p>
          <div className="pt-6">
            <Link
              href={`/${locale}`}
              className="px-6 py-3 rounded-xl bg-petroleum-800 text-white font-bold text-sm hover:bg-petroleum-900 transition-colors inline-block"
            >
              Ir a la Portada
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            Enlace No Válido o Caducado
          </h1>
          <p className="text-sm text-graphite-600 dark:text-slate-300">
            {errorMessage}
          </p>
          <div className="pt-6">
            <Link
              href={`/${locale}`}
              className="px-6 py-3 rounded-xl bg-warm-200 dark:bg-graphite-800 text-graphite-900 dark:text-white font-bold text-sm hover:bg-warm-300 transition-colors inline-block"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
