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
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as Locale;

  const titles: Record<Locale, string> = {
    es: "Reformas en Madrid · Baños y cocinas | GM REFORMA EXPRESS",
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
        return <Bath className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "reformas-cocinas-madrid":
        return <UtensilsCrossed className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "reformas-integrales-madrid":
        return <Home className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "cambio-banera-ducha-madrid":
        return <ShowerHead className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "suelos-tarima-madrid":
        return <Layers className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "fontaneria-madrid":
        return <Wrench className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "electricidad-iluminacion-madrid":
        return <Zap className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "ventanas-cerramientos-madrid":
        return <Wind className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      case "accesibilidad-viviendas-madrid":
        return <Accessibility className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
      default:
        return <Building2 className="w-6 h-6 text-petroleum-700 dark:text-petroleum-400" />;
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#03203d] p-8 sm:p-14 lg:p-16 border border-[#02172d] shadow-2xl text-white">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/10 border border-[#c9932a]/40 text-[#c9932a] text-xs font-bold uppercase tracking-wider">
              <span>{dict.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              {dict.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              {dict.hero.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={`/${locale}/presupuesto`}
                className="px-7 py-3.5 rounded-xl bg-secondary hover:bg-gold-600 text-graphite-950 font-black text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 min-h-[48px]"
              >
                <ClipboardCheck className="w-5 h-5 text-graphite-950" />
                <span>{dict.hero.primaryCta}</span>
              </Link>
              <Link
                href={`/${locale}/reservar`}
                className="px-6 py-3.5 rounded-xl border-2 border-white/80 text-white hover:bg-white/10 font-bold text-sm transition-all flex items-center gap-2 min-h-[48px]"
              >
                <Calendar className="w-5 h-5 text-white" />
                <span>{dict.hero.secondaryCta}</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c9932a]" />
                <span>Presupuestos cerrados sin sobrecostes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c9932a]" />
                <span>Personal propio y cualificado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c9932a]" />
                <span>Cobertura en toda la Comunidad de Madrid</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUOUS PHOTO CAROUSEL SECTION (PERMANENT WHITE BACKGROUND) */}
      <section className="w-full bg-white py-8 border-y border-slate-200/90 shadow-sm" aria-label="Galería de proyectos recientes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContinuousCarousel />
        </div>
      </section>

      {/* 2. VALUE PROPOSITION / FEATURES */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
            {dict.features.title}
          </h2>
          <p className="text-graphite-600 dark:text-slate-300 text-sm sm:text-base">
            {dict.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 flex items-center justify-center text-petroleum-800 dark:text-petroleum-400 font-bold">
              01
            </div>
            <h3 className="font-bold text-lg text-graphite-900 dark:text-white">
              {dict.features.card1Title}
            </h3>
            <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 leading-relaxed">
              {dict.features.card1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 flex items-center justify-center text-petroleum-800 dark:text-petroleum-400 font-bold">
              02
            </div>
            <h3 className="font-bold text-lg text-graphite-900 dark:text-white">
              {dict.features.card2Title}
            </h3>
            <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 leading-relaxed">
              {dict.features.card2Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 flex items-center justify-center text-petroleum-800 dark:text-petroleum-400 font-bold">
              03
            </div>
            <h3 className="font-bold text-lg text-graphite-900 dark:text-white">
              {dict.features.card3Title}
            </h3>
            <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 leading-relaxed">
              {dict.features.card3Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 flex items-center justify-center text-petroleum-800 dark:text-petroleum-400 font-bold">
              04
            </div>
            <h3 className="font-bold text-lg text-graphite-900 dark:text-white">
              {dict.features.card4Title}
            </h3>
            <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 leading-relaxed">
              {dict.features.card4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
              Servicios destacados de reformas
            </h2>
            <p className="text-graphite-600 dark:text-slate-300 text-sm mt-1">
              Soluciones técnicas para viviendas particulares y comunidades en Madrid
            </p>
          </div>
          <Link
            href={`/${locale}/servicios`}
            className="text-sm font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline flex items-center gap-1"
          >
            <span>Ver los 20 servicios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => {
            const trans = s.translations[0] || {};
            const serviceSlug = trans.slug || s.key;
            return (
              <div
                key={s.id}
                className="group p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-petroleum-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-petroleum-50 dark:bg-petroleum-950/60 flex items-center justify-center">
                    {getServiceIcon(s.key)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-graphite-900 dark:text-white group-hover:text-petroleum-800 dark:group-hover:text-petroleum-400 transition-colors">
                      {trans.navTitle || s.key}
                    </h3>
                    <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {trans.shortDesc || "Servicios profesionales en Madrid."}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-graphite-100 dark:border-graphite-800 mt-6 flex items-center justify-between">
                  <Link
                    href={`/${locale}/servicios/${serviceSlug}`}
                    className="text-xs font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline flex items-center gap-1 min-h-[44px]"
                  >
                    <span>Información y presupuesto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/${locale}/reservar?servicio=${s.key}`}
                    className="text-xs font-medium text-graphite-500 hover:text-graphite-800 dark:text-slate-400 dark:hover:text-white min-h-[44px] flex items-center"
                  >
                    Reservar visita
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WORK PROCESS TIMELINE (INTERACTIVE) */}
      <InteractiveProcessTimeline dict={dict.process} locale={locale} />

      {/* 5. EDITORIAL BLOG TEASER (SLIDABLE CAROUSEL IN BOTH DIRECTIONS) */}
      {recentPosts.length > 0 && (
        <BlogCarousel
          posts={recentPosts}
          locale={locale}
          title="Guías técnicas y consejos de reformas"
          subtitle="Artículos redactados por nuestro equipo técnico sobre normativas, materiales y presupuestos"
          viewAllLabel="Ver todos los artículos"
        />
      )}

      {/* 6. NEWSLETTER DOUBLE OPT-IN SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-warm-100 dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
              {dict.newsletter.title}
            </h2>
            <p className="text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
              {dict.newsletter.subtitle}
            </p>
            <div className="text-left pt-2">
              <NewsletterForm locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
