import React from "react";
import db from "@/lib/db";
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Database, CreditCard, Mail, Globe } from "lucide-react";

export default async function AdminIntegracionesPage() {
  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });

  const hasDb = Boolean(settings);
  const hasStripeKey = Boolean(process.env.STRIPE_SECRET_KEY);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL || settings?.domainCanonical);

  const integrations = [
    {
      name: "Base de Datos PostgreSQL (Prisma ORM)",
      status: hasDb ? "OPERATIVO" : "DESCONECTADO",
      description: "Esquema relacional con 28 modelos, auditoría y control de concurrencia.",
      icon: Database,
      isOk: hasDb,
    },
    {
      name: "Pasarela de Cobros Stripe",
      status: hasStripeKey ? "CONFIGURADO (Test Mode)" : "PENDIENTE DE CLAVES",
      description: "Checkout sessions, webhook events y conciliación de importes.",
      icon: CreditCard,
      isOk: hasStripeKey,
    },
    {
      name: "Servicio Transaccional de Correos (Resend / SMTP)",
      status: hasResend ? "CONFIGURADO" : "MODO CONSOLA DEV",
      description: "Envío de confirmaciones de presupuesto, verificación de cuentas y avisos de visitas.",
      icon: Mail,
      isOk: hasResend,
    },
    {
      name: "Dominio Canónico y SSL",
      status: hasSiteUrl ? "ACTIVO" : "PENDIENTE",
      description: "https://www.reformaexpress.com con redirección HTTPS forzada y sitemap XML.",
      icon: Globe,
      isOk: hasSiteUrl,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          20. Estado de Integraciones y Servicios Externos
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Monitorización en tiempo real del ecosistema de conectores y pasarelas de la aplicación.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 flex items-center justify-center text-petroleum-800 dark:text-petroleum-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-graphite-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    item.isOk
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-graphite-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
