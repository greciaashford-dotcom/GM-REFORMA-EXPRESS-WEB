import React from "react";
import db from "@/lib/db";
import { Languages, CheckCircle2 } from "lucide-react";
import { LOCALES } from "@/lib/constants";

export default async function AdminTraduccionesPage() {
  const serviceCount = await db.service.count();
  const serviceTranslations = await db.serviceTranslation.groupBy({
    by: ["locale"],
    _count: true,
  });

  const postTranslations = await db.postTranslation.groupBy({
    by: ["locale"],
    _count: true,
  });

  const localeSummary = [
    { code: "es", name: "Español (Principal)", flag: "🇪🇸" },
    { code: "en", name: "English (Inglés)", flag: "🇬🇧" },
    { code: "fr", name: "Français (Francés)", flag: "🇫🇷" },
    { code: "de", name: "Deutsch (Alemán)", flag: "🇩🇪" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          16. Cobertura de Traducciones e Idiomas
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Supervisión de localización de servicios, artículos de blog y términos comerciales.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {localeSummary.map((loc) => {
          const sCount = serviceTranslations.find((st) => st.locale === loc.code)?._count || 0;
          const pCount = postTranslations.find((pt) => pt.locale === loc.code)?._count || 0;

          return (
            <div
              key={loc.code}
              className="p-5 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{loc.flag}</span>
                  <div>
                    <h3 className="font-bold text-sm text-graphite-900 dark:text-white">
                      {loc.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      locale: {loc.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-graphite-100 dark:border-graphite-800 space-y-1.5 text-xs text-graphite-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Servicios traducidos:</span>
                  <strong className="font-bold text-petroleum-800 dark:text-petroleum-300">
                    {sCount} / {serviceCount}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Artículos de blog:</span>
                  <strong className="font-bold text-petroleum-800 dark:text-petroleum-300">
                    {pCount}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
