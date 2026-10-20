import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Locale, BRAND } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import db from "@/lib/db";
import { ArrowRight, Bath, UtensilsCrossed, Home, ShowerHead, Layers, Wrench, Zap, Wind, Accessibility, Building2, Paintbrush, Hammer } from "lucide-react";

interface ServicesPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const canonical = `${BRAND.canonicalDomain}/${locale}/servicios`;

  return {
    title: "Catálogo de Servicios de Reformas en Madrid | GM REFORMA EXPRESS",
    description:
      "Catálogo completo de servicios de reformas para viviendas, baños, cocinas, instalaciones y comunidades de propietarios en Madrid.",
    alternates: {
      canonical,
      languages: {
        es: `${BRAND.canonicalDomain}/es/servicios`,
        en: `${BRAND.canonicalDomain}/en/servicios`,
        fr: `${BRAND.canonicalDomain}/fr/servicios`,
        de: `${BRAND.canonicalDomain}/de/servicios`,
        "x-default": `${BRAND.canonicalDomain}/es/servicios`,
      },
    },
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const locale = params.locale as Locale;

  let services: any[] = [];
  try {
    services = await db.service.findMany({
      where: { status: "APPROVED" },
      orderBy: { orderIndex: "asc" },
      include: {
        translations: {
          where: { locale },
        },
      },
    });
  } catch (err) {
    console.warn("[ServicesPage] Database query fallback:", err);
  }

  const residential = services.filter((s) => s.category === "REFORMAS_VIVIENDA");
  const installations = services.filter((s) => s.category === "INSTALACIONES_CONFORT");
  const accessibility = services.filter((s) => s.category === "ACCESIBILIDAD_COMUNIDADES");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-graphite-900 dark:text-white tracking-tight">
          Catálogo de Servicios de Reformas en Madrid
        </h1>
        <p className="text-base sm:text-lg text-graphite-600 dark:text-slate-300 leading-relaxed">
          Ejecución profesional con personal cualificado, replanteo técnico previo y presupuesto por partidas desglosadas en la Comunidad de Madrid.
        </p>
      </div>

      {/* Category 1: Reformas de vivienda */}
      <section className="space-y-6">
        <div className="border-b border-graphite-200 dark:border-graphite-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-petroleum-800 dark:text-petroleum-400">
            Reformas de vivienda
          </h2>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400">
            Baños, cocinas, redistribuciones integrales y acabados interiores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {residential.map((s) => {
            const trans = s.translations[0] || {};
            const slug = trans.slug || s.key;
            return (
              <Link
                key={s.id}
                href={`/${locale}/servicios/${slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-petroleum-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-graphite-900 dark:text-white group-hover:text-petroleum-800 dark:group-hover:text-petroleum-400 transition-colors">
                    {trans.navTitle || s.key}
                  </h3>
                  <p className="text-xs text-graphite-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {trans.shortDesc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-graphite-100 dark:border-graphite-800 flex items-center justify-between text-xs font-bold text-petroleum-800 dark:text-petroleum-400">
                  <span>Ver servicio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Category 2: Instalaciones y confort */}
      <section className="space-y-6">
        <div className="border-b border-graphite-200 dark:border-graphite-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-petroleum-800 dark:text-petroleum-400">
            Instalaciones y confort
          </h2>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400">
            Fontanería, electricidad, climatización, aislamientos y diagnóstico de humedades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {installations.map((s) => {
            const trans = s.translations[0] || {};
            const slug = trans.slug || s.key;
            return (
              <Link
                key={s.id}
                href={`/${locale}/servicios/${slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-petroleum-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-graphite-900 dark:text-white group-hover:text-petroleum-800 dark:group-hover:text-petroleum-400 transition-colors">
                    {trans.navTitle || s.key}
                  </h3>
                  <p className="text-xs text-graphite-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {trans.shortDesc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-graphite-100 dark:border-graphite-800 flex items-center justify-between text-xs font-bold text-petroleum-800 dark:text-petroleum-400">
                  <span>Ver servicio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Category 3: Accesibilidad y comunidades */}
      <section className="space-y-6">
        <div className="border-b border-graphite-200 dark:border-graphite-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-petroleum-800 dark:text-petroleum-400">
            Accesibilidad y comunidades
          </h2>
          <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400">
            Portales accesibles, bajada a cota cero, fachadas, cubiertas y mantenimiento de fincas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibility.map((s) => {
            const trans = s.translations[0] || {};
            const slug = trans.slug || s.key;
            return (
              <Link
                key={s.id}
                href={`/${locale}/servicios/${slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-petroleum-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-graphite-900 dark:text-white group-hover:text-petroleum-800 dark:group-hover:text-petroleum-400 transition-colors">
                    {trans.navTitle || s.key}
                  </h3>
                  <p className="text-xs text-graphite-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {trans.shortDesc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-graphite-100 dark:border-graphite-800 flex items-center justify-between text-xs font-bold text-petroleum-800 dark:text-petroleum-400">
                  <span>Ver servicio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
