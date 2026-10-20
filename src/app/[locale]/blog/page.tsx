import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Locale, BRAND } from "@/lib/constants";
import db from "@/lib/db";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

interface BlogPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const canonical = `${BRAND.canonicalDomain}/${locale}/blog`;

  return {
    title: "Blog y Guías Técnicas de Reformas en Madrid | GM REFORMA EXPRESS",
    description:
      "Consejos técnicos, normativas, presupuestos y recomendaciones prácticas para reformar tu vivienda en Madrid redactados por profesionales.",
    alternates: {
      canonical,
      languages: {
        es: `${BRAND.canonicalDomain}/es/blog`,
        en: `${BRAND.canonicalDomain}/en/blog`,
        fr: `${BRAND.canonicalDomain}/fr/blog`,
        de: `${BRAND.canonicalDomain}/de/blog`,
        "x-default": `${BRAND.canonicalDomain}/es/blog`,
      },
    },
  };
}

export default async function BlogIndexPage({ params }: BlogPageProps) {
  const locale = params.locale as Locale;

  let posts: any[] = [];
  try {
    posts = await db.post.findMany({
      where: { status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      include: {
        translations: {
          where: { locale },
        },
      },
    });
  } catch (err) {
    console.warn("[BlogIndex] Database query fallback:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary dark:text-gold-400 text-xs font-bold uppercase tracking-wider border border-secondary/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Blog Editorial GM REFORMA EXPRESS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-graphite-900 dark:text-white tracking-tight">
          Guías y Consejos Técnicos de Reformas en Madrid
        </h1>
        <p className="text-base sm:text-lg text-graphite-600 dark:text-slate-300 leading-relaxed">
          Artículos objetivos y recomendaciones prácticas para orientar la planificación, normativa y presupuesto de las obras en tu inmueble.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          const trans = post.translations[0] || {};
          const slug = trans.slug || post.slug;
          return (
            <article
              key={post.id}
              className="group rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-secondary transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between text-xs text-graphite-500 dark:text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-secondary">
                    {post.categoryKey}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readingTime} min
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-graphite-900 dark:text-white group-hover:text-secondary transition-colors leading-snug">
                  <Link href={`/${locale}/blog/${slug}`}>
                    {trans.title || post.slug}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {trans.excerpt}
                </p>
              </div>

              <div className="p-6 sm:p-8 pt-0 flex items-center justify-between border-t border-graphite-100 dark:border-graphite-800 mt-4">
                <span className="text-xs text-graphite-500 dark:text-slate-500">
                  {post.authorName}
                </span>
                <Link
                  href={`/${locale}/blog/${slug}`}
                  className="text-xs font-bold text-secondary group-hover:underline flex items-center gap-1 min-h-[44px]"
                >
                  <span>Leer artículo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
