import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Locale, BRAND } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import NewsletterForm from "@/components/NewsletterForm";
import ContinuousCarousel from "@/components/ContinuousCarousel";
import InteractiveProcessTimeline from "@/components/InteractiveProcessTimeline";
import BlogCarousel from "@/components/BlogCarousel";
import db from "@/lib/db";

import {
  ClipboardCheck,
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bath,
  UtensilsCrossed,
  Home,
  ShowerHead,
  Layers,
  Wrench,
  Zap,
  Wind,
  Accessibility,
  Building2,
  MapPin,
  FileCheck2,
  Ruler,
  Award,
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as Locale;

  const titles: Record<Locale, string> = {
    es: "Reformas en Madrid · Baños, Cocinas e Integrales | GM REFORMA EXPRESS",
    en: "Home Renovations in Madrid · Bathrooms & Kitchens | GM REFORMA EXPRESS",
    fr: "Rénovations à Madrid · Salles de bain et cuisines | GM REFORMA EXPRESS",
    de: "Renovierungen in Madrid · Bäder und Küchen | GM REFORMA EXPRESS",
  };

  const descriptions: Record<Locale, string> = {
    es: "Reformas de baños, cocinas y viviendas en Madrid. Cuéntanos tu proyecto, reserva una visita y solicita una propuesta adaptada con GM REFORMA EXPRESS.",
    en: "Bathroom, kitchen, and complete home renovations in Madrid. Tell us about your project and book a technical visit.",
    fr: "Rénovation de salles de bain, cuisines et appartements complets à Madrid. Devis par postes et délais convenus.",
    de: "Badsanierung, Küchenumbau und Wohnungsrenovierung in Madrid mit GM REFORMA EXPRESS. Angebot anfordern und Besichtigung buchen.",
  };

  const canonical = `${BRAND.canonicalDomain}/${locale}`;

  return {
    title: titles[locale] || titles.es,
    description: descriptions[locale] || descriptions.es,
    alternates: {
      canonical,
      languages: {
        es: `${BRAND.canonicalDomain}/es`,
        en: `${BRAND.canonicalDomain}/en`,
        fr: `${BRAND.canonicalDomain}/fr`,
        de: `${BRAND.canonicalDomain}/de`,
        "x-default": `${BRAND.canonicalDomain}/es`,
      },
    },
    openGraph: {
      title: titles[locale] || titles.es,
      description: descriptions[locale] || descriptions.es,
      url: canonical,
      siteName: BRAND.name,
      locale,
      type: "website",
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  // Fetch featured services from DB
  let services: any[] = [];
  try {
    services = await db.service.findMany({
      where: { status: "APPROVED" },
      orderBy: { orderIndex: "asc" },
      take: 6,
      include: {
        translations: {
          where: { locale },
        },
      },
    });
  } catch (err) {
    console.warn("[HomePage] Services query fallback:", err);
  }

  // Fetch up to 12 recent approved blog posts for the interactive carousel
  let recentPosts: any[] = [];
  try {
    recentPosts = await db.post.findMany({
      where: { status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      take: 12,
      include: {
        translations: {
          where: { locale },
        },
      },
    });
  } catch (err) {
    console.warn("[HomePage] Blog posts query fallback:", err);
  }

  const getServiceIcon = (key: string) => {
    switch (key) {
      case "reformas-banos-madrid":
        return <Bath className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "reformas-cocinas-madrid":
        return <UtensilsCrossed className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "reformas-integrales-madrid":
      case "reformas-integrales-viviendas":
        return <Home className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "cambio-banera-ducha-madrid":
      case "cambio-banera-por-plato-ducha":
        return <ShowerHead className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "suelos-tarima-madrid":
      case "suelos-tarimas-madrid":
        return <Layers className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "fontaneria-madrid":
      case "fontaneria-saneamiento-calefaccion":
        return <Wrench className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "electricidad-iluminacion-madrid":
      case "electricidad-boletines-madrid":
        return <Zap className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "ventanas-cerramientos-madrid":
      case "carpinteria-aluminio-pvc":
        return <Wind className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      case "accesibilidad-viviendas-madrid":
      case "accesibilidad-reformas-adaptadas":
        return <Accessibility className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
      default:
        return <Building2 className="w-6 h-6 text-[#03203d] dark:text-[#c9932a] group-hover:text-graphite-950 transition-colors" />;
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION (PERMANENT #03203d BACKGROUND, ARCHITECTURAL SPLIT DESIGN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#03203d] bg-architectural-grid p-8 sm:p-12 lg:p-16 border border-[#02172d] shadow-2xl text-white">
          {/* Subtle architectural golden ambient lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#c9932a]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#c9932a]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Main Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-[#c9932a]/40 text-[#c9932a] text-xs font-extrabold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#c9932a]" />
                <span>{dict.hero.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.1]">
                {dict.hero.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
                {dict.hero.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={`/${locale}/presupuesto`}
                  className="px-7 py-4 rounded-2xl bg-[#c9932a] hover:bg-amber-500 text-graphite-950 font-black text-sm shadow-lg shadow-[#c9932a]/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 min-h-[52px]"
                >
                  <ClipboardCheck className="w-5 h-5 text-graphite-950" />
                  <span>{dict.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 text-graphite-950" />
                </Link>
                <Link
                  href={`/${locale}/reservar`}
                  className="px-6 py-4 rounded-2xl border-2 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:border-white/60 font-bold text-sm transition-all flex items-center gap-2.5 min-h-[52px]"
                >
                  <Calendar className="w-5 h-5 text-[#c9932a]" />
                  <span>{dict.hero.secondaryCta}</span>
                </Link>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200 border-t border-white/10">
                <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#c9932a] flex-shrink-0" />
                  <span className="font-medium">Presupuestos cerrados sin sobrecostes</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#c9932a] flex-shrink-0" />
                  <span className="font-medium">Personal propio y cualificado</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#c9932a] flex-shrink-0" />
                  <span className="font-medium">Toda la Comunidad de Madrid</span>
                </div>
              </div>
            </div>

            {/* Right Column: Executive Architectural Control Panel Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#02172d]/90 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#c9932a] block">
                      Dirección Técnica · Madrid
                    </span>
                    <h2 className="text-lg font-extrabold text-white mt-0.5">
                      Especialistas en Ejecución Rápida
                    </h2>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[#c9932a]/20 border border-[#c9932a]/40 flex items-center justify-center text-[#c9932a]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                {/* Key Performance Guarantees */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-2xl font-black text-[#c9932a]">100%</span>
                    <p className="text-xs text-slate-300 font-medium leading-snug">
                      Desglose por partidas y plazos por contrato
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-2xl font-black text-white">24–48h</span>
                    <p className="text-xs text-slate-300 font-medium leading-snug">
                      Visita técnica y replanteo en Madrid
                    </p>
                  </div>
                </div>

                {/* Quick Service Access */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Intervenciones más solicitadas
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9932a]/50 transition-all">
                      <Link
                        href={`/${locale}/servicios/reformas-banos-madrid`}
                        className="flex items-center gap-2.5 flex-1 min-w-0 group"
                      >
                        <Bath className="w-4 h-4 text-[#c9932a] shrink-0" />
                        <span className="text-xs font-bold text-white group-hover:text-[#c9932a] transition-colors truncate">
                          Reforma Integral de Baño y Ducha
                        </span>
                      </Link>
                      <Link
                        href={`/${locale}/reservar?servicio=reformas-banos-madrid`}
                        className="px-2.5 py-1 rounded-lg bg-[#c9932a] hover:bg-amber-400 text-graphite-950 font-black text-[11px] flex items-center gap-1 shrink-0 shadow-xs transition-all"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Reservar</span>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9932a]/50 transition-all">
                      <Link
                        href={`/${locale}/servicios/reformas-cocinas-madrid`}
                        className="flex items-center gap-2.5 flex-1 min-w-0 group"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-[#c9932a] shrink-0" />
                        <span className="text-xs font-bold text-white group-hover:text-[#c9932a] transition-colors truncate">
                          Reforma de Cocina e Instalaciones
                        </span>
                      </Link>
                      <Link
                        href={`/${locale}/reservar?servicio=reformas-cocinas-madrid`}
                        className="px-2.5 py-1 rounded-lg bg-[#c9932a] hover:bg-amber-400 text-graphite-950 font-black text-[11px] flex items-center gap-1 shrink-0 shadow-xs transition-all"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Reservar</span>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9932a]/50 transition-all">
                      <Link
                        href={`/${locale}/servicios/reformas-integrales-madrid`}
                        className="flex items-center gap-2.5 flex-1 min-w-0 group"
                      >
                        <Home className="w-4 h-4 text-[#c9932a] shrink-0" />
                        <span className="text-xs font-bold text-white group-hover:text-[#c9932a] transition-colors truncate">
                          Reforma Integral de Vivienda en Madrid
                        </span>
                      </Link>
                      <Link
                        href={`/${locale}/reservar?servicio=reformas-integrales-madrid`}
                        className="px-2.5 py-1 rounded-lg bg-[#c9932a] hover:bg-amber-400 text-graphite-950 font-black text-[11px] flex items-center gap-1 shrink-0 shadow-xs transition-all"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Reservar</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Footer inside Hero Card */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-[#c9932a]" />
                    <span>CP 28001–28991 Madrid</span>
                  </div>
                  <a
                    href={BRAND.phoneTel}
                    className="font-bold text-[#c9932a] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{BRAND.phoneVisible}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTINUOUS PHOTO CAROUSEL SECTION (PERMANENT WHITE BACKGROUND) */}
      <section className="w-full bg-white py-8 border-y border-slate-200/90 shadow-sm" aria-label="Galería de proyectos recientes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContinuousCarousel />
        </div>
      </section>

      {/* 3. VALUE PROPOSITION / FEATURES (MODERN BENTO ARCHITECTURE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c9932a] block">
              Rigor Técnico y Transparencia
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
              {dict.features.title}
            </h2>
          </div>
          <p className="text-graphite-600 dark:text-slate-300 text-sm sm:text-base max-w-md">
            {dict.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: "01",
              title: dict.features.card1Title,
              desc: dict.features.card1Desc,
              icon: FileCheck2,
            },
            {
              num: "02",
              title: dict.features.card2Title,
              desc: dict.features.card2Desc,
              icon: Ruler,
            },
            {
              num: "03",
              title: dict.features.card3Title,
              desc: dict.features.card3Desc,
              icon: ShieldCheck,
            },
            {
              num: "04",
              title: dict.features.card4Title,
              desc: dict.features.card4Desc,
              icon: Award,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="group relative p-7 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 hover:border-[#c9932a] dark:hover:border-[#c9932a] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#03203d] via-[#c9932a] to-[#03203d] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#03203d] text-white group-hover:bg-[#c9932a] group-hover:text-graphite-950 transition-colors flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 dark:text-graphite-800 group-hover:text-[#c9932a]/40 transition-colors font-mono">
                      {card.num}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-graphite-900 dark:text-white leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED SERVICES CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c9932a] block">
              Especialidades Constructivas
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
              Servicios destacados de reformas
            </h2>
            <p className="text-graphite-600 dark:text-slate-300 text-sm sm:text-base">
              Soluciones técnicas integrales para viviendas particulares, locales y comunidades en Madrid
            </p>
          </div>
          <Link
            href={`/${locale}/servicios`}
            className="px-5 py-2.5 rounded-xl bg-[#03203d] hover:bg-[#05305a] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Ver los 20 servicios</span>
            <ArrowRight className="w-4 h-4 text-[#c9932a]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => {
            const trans = s.translations[0] || {};
            const serviceSlug = trans.slug || s.key;
            return (
              <div
                key={s.id}
                className="group p-7 rounded-3xl bg-white dark:bg-graphite-900 border border-slate-200/90 dark:border-graphite-800 hover:border-[#c9932a] dark:hover:border-[#c9932a] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 p-3.5 rounded-2xl bg-slate-100 dark:bg-graphite-800 group-hover:bg-[#c9932a] transition-colors flex items-center justify-center shadow-xs">
                      {getServiceIcon(s.key)}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-graphite-800 text-slate-600 dark:text-slate-300">
                      0{idx + 1} · Madrid
                    </span>
                  </div>
                  <div>
                    <Link href={`/${locale}/servicios/${serviceSlug}`}>
                      <h3 className="font-extrabold text-xl text-graphite-900 dark:text-white group-hover:text-[#03203d] dark:group-hover:text-[#c9932a] transition-colors">
                        {trans.navTitle || s.key}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                      {trans.shortDesc || "Ejecución profesional con mediciones detalladas y garantía escrita en Madrid."}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-graphite-800 mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <Link
                    href={`/${locale}/reservar?servicio=${s.key}`}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#c9932a] hover:bg-amber-400 text-graphite-950 font-black text-xs sm:text-sm shadow-md shadow-[#c9932a]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Calendar className="w-4 h-4 text-graphite-950 shrink-0" />
                    <span>Reservar visita</span>
                  </Link>
                  <Link
                    href={`/${locale}/servicios/${serviceSlug}`}
                    className="px-4 py-3 rounded-xl bg-[#03203d] hover:bg-[#05305a] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>Ver servicio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c9932a] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WORK PROCESS TIMELINE (INTERACTIVE, AUTO-ADVANCE EVERY 3S WITHOUT TIME TEXT) */}
      <InteractiveProcessTimeline dict={dict.process} locale={locale} />

      {/* 6. EDITORIAL BLOG TEASER (SLIDABLE CAROUSEL IN BOTH DIRECTIONS) */}
      {recentPosts.length > 0 && (
        <BlogCarousel
          posts={recentPosts}
          locale={locale}
          title="Guías técnicas y consejos de reformas"
          subtitle="Artículos redactados por nuestro equipo técnico sobre normativas, materiales y presupuestos"
          viewAllLabel="Ver todos los artículos"
        />
      )}

      {/* 7. NEWSLETTER DOUBLE OPT-IN & DIRECT PROJECT CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#03203d] via-[#02182e] to-[#011020] border border-[#02172d] p-8 sm:p-12 lg:p-16 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#c9932a]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#c9932a]/20 border border-[#c9932a]/40 text-[#c9932a] text-xs font-extrabold uppercase tracking-wider">
                Boletín Técnico · Comunidad de Madrid
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {dict.newsletter.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {dict.newsletter.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c9932a]" /> Confirmación doble RGPD
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c9932a]" /> Baja inmediata en 1 clic
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white dark:bg-graphite-900 text-graphite-900 dark:text-slate-100 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-graphite-800">
              <NewsletterForm locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
