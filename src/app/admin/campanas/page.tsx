import React from "react";
import db from "@/lib/db";
import { Send, Calendar, Clock, CheckCircle2, ShieldCheck, Mail, Eye } from "lucide-react";

export default async function AdminCampanasPage() {
  const campaigns = await db.campaign.findMany({
    orderBy: [{ weekNumber: "asc" }, { slotNumber: "asc" }],
    include: {
      translations: true,
      _count: { select: { deliveries: true } },
    },
  });

  const subscribersCount = await db.subscriber.count({
    where: { status: "CONFIRMED" },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            18. Campañas de Email Marketing y Automatizaciones
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Programación bisemanal automatizada (Martes y Jueves a las 10:00 Europe/Madrid). Límite estricto de 2 promociones por semana por suscriptor.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-graphite-500 block">Audiencia activa con doble opt-in:</span>
          <span className="text-lg font-bold text-petroleum-800 dark:text-petroleum-400 font-mono">
            {subscribersCount} suscriptores
          </span>
        </div>
      </div>

      {/* 4 Weeks Editorial Calendar */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white">
          Calendario editorial de 4 semanas (8 envíos en 4 idiomas)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((c) => {
            const esTrans = c.translations.find((t) => t.locale === "es") || c.translations[0] || {};
            const slotDay = c.slotNumber === 1 ? "Martes 10:00" : "Jueves 10:00";
            return (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
                      Semana {c.weekNumber} · {slotDay}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-graphite-900 dark:text-white">
                      {c.internalName}
                    </h3>
                    <p className="text-xs font-medium text-graphite-600 dark:text-slate-400 mt-1">
                      Asunto (ES): <em>&quot;{esTrans.subject}&quot;</em>
                    </p>
                    <p className="text-[11px] text-graphite-500 dark:text-slate-500 line-clamp-2 mt-1">
                      Preencabezado: {esTrans.preheader}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-graphite-100 dark:border-graphite-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-graphite-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Traducido a ES, EN, FR, DE</span>
                  </div>
                  <span className="font-mono text-petroleum-800 dark:text-petroleum-400 font-bold">
                    Entregas: {c._count.deliveries}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
