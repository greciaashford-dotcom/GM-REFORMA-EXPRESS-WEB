"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, CheckCircle2, AlertCircle, Search, ArrowRight } from "lucide-react";
import { isPostalCodeCovered } from "@/lib/constants";

export default function ZonasServicioPage() {
  const params = useParams();
  const locale = (params.locale as string) || "es";

  const [inputCp, setInputCp] = useState("");
  const [result, setResult] = useState<{ checked: boolean; covered: boolean } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCp) return;
    const covered = isPostalCodeCovered(inputCp.trim());
    setResult({ checked: true, covered });
  };

  const capitalDistricts = [
    "Centro (28004, 28012, 28013)",
    "Salamanca (28001, 28006, 28028)",
    "Chamberí (28003, 28010, 28015)",
    "Chamartín (28002, 28016, 28036)",
    "Retiro (28007, 28009, 28014)",
    "Moncloa - Aravaca (28008, 28023, 28040)",
    "Tetuán (28020, 28039)",
    "Fuencarral - El Pardo (28034, 28049, 28050)",
    "Ciudad Lineal (28017, 28027, 28033)",
    "Hortaleza (28043, 28055)",
    "Arganzuela (28005, 28045)",
    "Latina y Carabanchel (28019, 28025, 28044, 28047)",
  ];

  const metroMunicipalities = [
    "Pozuelo de Alarcón (28223, 28224)",
    "Majadahonda y Las Rozas (28220, 28231, 28232)",
    "Alcobendas y San Sebastián de los Reyes (28100, 28701, 28702)",
    "Getafe y Leganés (28901 - 28919)",
    "Alcorcón y Móstoles (28921 - 28938)",
    "Fuenlabrada y Pinto (28941 - 28984)",
    "Coslada y San Fernando de Henares (28821, 28830)",
    "Torrejón de Ardoz y Alcalá de Henares (28850, 28801 - 28807)",
    "Rivas-Vaciamadrid y Arganda del Rey (28521, 28500)",
    "Boadilla del Monte y Villaviciosa de Odón (28660, 28670)",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950/60 text-petroleum-800 dark:text-petroleum-300 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5" /> Cobertura en la Comunidad de Madrid
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-graphite-900 dark:text-white tracking-tight">
          Zonas de Actuación y Cobertura Operativa
        </h1>
        <p className="text-sm sm:text-base text-graphite-600 dark:text-slate-300 leading-relaxed">
          Realizamos reformas integrales y parciales en todos los distritos de Madrid Capital y los principales municipios de la corona metropolitana.
        </p>
      </div>

      {/* Interactive Postal Code Checker */}
      <div className="p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-bold text-graphite-900 dark:text-white text-center">
          Compruebe la cobertura en su código postal
        </h2>
        <form onSubmit={handleCheck} className="flex gap-2">
          <input
            type="text"
            maxLength={5}
            value={inputCp}
            onChange={(e) => setInputCp(e.target.value.replace(/\D/g, ""))}
            placeholder="Ej. 28001"
            className="flex-1 px-4 py-3 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-warm-50 dark:bg-graphite-800 text-graphite-900 dark:text-white text-sm focus:ring-2 focus:ring-petroleum-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Comprobar
          </button>
        </form>

        {result?.checked && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-3 ${
              result.covered
                ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200"
            }`}
          >
            {result.covered ? (
              <>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>
                  <strong>¡Excelente noticia!</strong> El código postal <strong>{inputCp}</strong> cuenta con cobertura técnica directa de GM REFORMA EXPRESS con desplazamiento y valoración presencial disponible.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>
                  El código postal <strong>{inputCp}</strong> se encuentra actualmente fuera de nuestra zona de actuación inmediata. Puede consultarnos telefónicamente para proyectos especiales en provincias colindantes.
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-petroleum-700 dark:text-petroleum-400 font-bold text-sm uppercase tracking-wider">
            <MapPin className="w-4 h-4" /> Madrid Ciudad (28001 - 28055)
          </div>
          <h3 className="text-xl font-bold text-graphite-900 dark:text-white">
            Distritos de la Capital
          </h3>
          <p className="text-xs text-graphite-500">
            Equipos propios y coordinación de permisos de ocupación de vía pública y contenedores de escombros en Madrid Central y distritos:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-graphite-700 dark:text-slate-300 pt-2">
            {capitalDistricts.map((d, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-petroleum-700" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-petroleum-700 dark:text-petroleum-400 font-bold text-sm uppercase tracking-wider">
            <MapPin className="w-4 h-4" /> Comunidad de Madrid (28100 - 28991)
          </div>
          <h3 className="text-xl font-bold text-graphite-900 dark:text-white">
            Municipios y Corona Metropolitana
          </h3>
          <p className="text-xs text-graphite-500">
            Desplazamiento técnico para viviendas unifamiliares, pisos y locales comerciales en las zonas norte, sur, este y oeste:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-graphite-700 dark:text-slate-300 pt-2">
            {metroMunicipalities.map((m, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-petroleum-700" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center">
        <Link
          href={`/${locale}/reservar`}
          className="px-8 py-3.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm transition-all inline-flex items-center gap-2 shadow-md"
        >
          Solicitar Visita Técnica en su Zona <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
