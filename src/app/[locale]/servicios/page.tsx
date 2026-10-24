import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Locale, BRAND } from "@/lib/constants";
import db from "@/lib/db";
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  Home,
  Wrench,
  Building2,
} from "lucide-react";

interface ServicesPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const canonical = `${BRAND.canonicalDomain}/${locale}/servicios`;

  return {
    title: "Catálogo de Servicios de Reformas en Madrid | GM REFORMA EXPRESS",
    description:
      "Catálogo completo de los 20 servicios de reformas para viviendas, baños, cocinas, instalaciones y comunidades de propietarios en Madrid. Reserva tu visita técnica online.",
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

  const renderServiceCard = (s: any) => {
    const trans = s.translations[0] || {};
    const slug = trans.slug || s.key;
    const title = trans.navTitle || s.key;

    return (
      <div
        key={s.id}
        className="group p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 hover:border-[#c9932a] dark:hover:border-[#c9932a] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-[#03203d]/10 dark:bg-white/10 text-[#03203d] dark:text-[#c9932a]">
              #{String(s.orderIndex).padStart(2, "0")} · Madrid
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              Disponible
            </span>
          </div>

          <Link href={`/${locale}/servicios/${slug}`} className="block">
            <h3 className="font-extrabold text-lg text-graphite-900 dark:text-white group-hover:text-[#03203d] dark:group-hover:text-[#c9932a] transition-colors leading-snug">
              {title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {trans.shortDesc}
          </p>
        </div>

        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-graphite-800 space-y-2.5">
          <Link
            href={`/${locale}/reservar?servicio=${s.key}`}
            className="w-full px-4 py-3 rounded-xl bg-[#c9932a] hover:bg-amber-400 text-graphite-950 font-black text-xs sm:text-sm shadow-md shadow-[#c9932a]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Calendar className="w-4 h-4 text-graphite-950 shrink-0" />
            <span>Reservar visita técnica</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/${locale}/servicios/${slug}`}
              className="px-3 py-2.5 rounded-xl bg-[#03203d] hover:bg-[#05305a] text-white font-bold text-xs transition-all flex items-center justify-center gap-1 min-h-[40px]"
            >
              <span>Ver ficha</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#c9932a]" />
            </Link>
            <Link
              href={`/${locale}/presupuesto?servicio=${s.key}`}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-graphite-700 hover:border-[#c9932a] text-graphite-800 dark:text-slate-200 hover:text-[#03203d] dark:hover:text-[#c9932a] font-bold text-xs transition-all flex items-center justify-center gap-1 min-h-[40px]"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-[#c9932a]" />
              <span>Presupuesto</span>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Executive Hero Header */}
      <div className="rounded-[2rem] bg-[#03203d] bg-architectural-grid text-white p-8 sm:p-12 border border-[#02172d] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#c9932a]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-[#c9932a]/40 text-[#c9932a] text-xs font-extrabold uppercase tracking-widest">
              <span>{services.length} Especialidades Técnicas en Madrid</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Catálogo de Servicios de Reformas en Madrid
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Ejecución profesional con personal propio cualificado, replanteo técnico previo y presupuesto cerrado por partidas desglosadas. Selecciona el servicio que necesitas y reserva tu visita directamente.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#c9932a]" /> Visita técnica en Madrid (CP 280–289)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#c9932a]" /> Presupuesto desglosado sin compromiso
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href={`/${locale}/reservar`}
              className="px-6 py-4 rounded-2xl bg-[#c9932a] hover:bg-amber-400 text-graphite-950 font-black text-sm shadow-lg shadow-[#c9932a]/25 transition-all flex items-center justify-center gap-2.5 min-h-[52px]"
            >
              <Calendar className="w-5 h-5 text-graphite-950" />
              <span>Reservar Visita Técnica</span>
            </Link>
            <Link
              href={`/${locale}/presupuesto`}
              className="px-6 py-4 rounded-2xl border-2 border-white/30 bg-white/5 hover:bg-white/15 text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5 min-h-[52px]"
            >
              <ClipboardCheck className="w-5 h-5 text-[#c9932a]" />
              <span>Solicitar Presupuesto Online</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category 1: Reformas de vivienda */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 dark:border-graphite-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[#c9932a] text-xs font-extrabold uppercase tracking-widest mb-1">
              <Home className="w-4 h-4" />
              <span>Bloque 01 · Interiorismo y Obra Civil</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-graphite-900 dark:text-white">
              Reformas de vivienda ({residential.length})
            </h2>
            <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400 mt-1">
              Baños, cocinas, redistribuciones integrales, suelos, pintura y carpintería interior
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {residential.map(renderServiceCard)}
        </div>
      </section>

      {/* Category 2: Instalaciones y confort */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 dark:border-graphite-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[#c9932a] text-xs font-extrabold uppercase tracking-widest mb-1">
              <Wrench className="w-4 h-4" />
              <span>Bloque 02 · Ingeniería Doméstica y Eficiencia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-graphite-900 dark:text-white">
              Instalaciones y confort ({installations.length})
            </h2>
            <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400 mt-1">
              Fontanería, electricidad, climatización, cerramientos, aislamientos y tratamiento de humedades
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {installations.map(renderServiceCard)}
        </div>
      </section>

      {/* Category 3: Accesibilidad y comunidades */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 dark:border-graphite-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[#c9932a] text-xs font-extrabold uppercase tracking-widest mb-1">
              <Building2 className="w-4 h-4" />
              <span>Bloque 03 · Rehabilitación, Accesibilidad y Locales</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-graphite-900 dark:text-white">
              Accesibilidad, comunidades y locales ({accessibility.length})
            </h2>
            <p className="text-xs sm:text-sm text-graphite-500 dark:text-slate-400 mt-1">
              Portales accesibles a cota cero, fachadas, cubiertas, comunidades de propietarios y locales comerciales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibility.map(renderServiceCard)}
        </div>
      </section>
    </div>
  );
}
