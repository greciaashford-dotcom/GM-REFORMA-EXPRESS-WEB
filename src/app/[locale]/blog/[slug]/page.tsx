import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Locale, BRAND } from "@/lib/constants";
import db from "@/lib/db";
import { Clock, Calendar, ArrowLeft, ArrowRight, User, ClipboardCheck, Phone } from "lucide-react";

interface BlogPostPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

async function resolvePostTranslation(locale: string, slug: string) {
  let translation = await db.postTranslation.findFirst({
    where: {
      locale,
      OR: [{ slug }, { post: { slug } }],
    },
    include: { post: true },
  });

  if (!translation) {
    const anyMatch = await db.postTranslation.findFirst({
      where: {
        OR: [{ slug }, { post: { slug } }],
      },
      include: { post: true },
    });

    if (anyMatch) {
      translation =
        (await db.postTranslation.findFirst({
          where: {
            postId: anyMatch.postId,
            locale,
          },
          include: { post: true },
        })) || anyMatch;
    }
  }

  return translation;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = params;

  const translation = await resolvePostTranslation(locale, slug);

  if (!translation) return {};

  const canonical = `${BRAND.canonicalDomain}/${locale}/blog/${translation.slug}`;

  // Fetch sibling translations for hreflang
  const allTranslations = await db.postTranslation.findMany({
    where: { postId: translation.postId },
  });

  const languageAlternates: Record<string, string> = {};
  for (const t of allTranslations) {
    languageAlternates[t.locale] = `${BRAND.canonicalDomain}/${t.locale}/blog/${t.slug}`;
  }
  languageAlternates["x-default"] = `${BRAND.canonicalDomain}/es/blog/${
    allTranslations.find((t) => t.locale === "es")?.slug || translation.slug
  }`;

  return {
    title: translation.seoTitle,
    description: translation.seoDesc,
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title: translation.seoTitle,
      description: translation.seoDesc,
      url: canonical,
      siteName: BRAND.name,
      locale,
      type: "article",
      publishedTime: translation.post.publishedAt?.toISOString(),
      authors: [translation.post.authorName],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { locale, slug } = params;

  const translation = await resolvePostTranslation(locale, slug);

  if (!translation || translation.post.status !== "APPROVED") {
    notFound();
  }

  const post = translation.post;

  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(post.publishedAt)
    : "Reciente";

  // Related posts
  const relatedPosts = await db.postTranslation.findMany({
    where: {
      locale,
      postId: { not: post.id },
    },
    take: 2,
    include: { post: true },
  });

  // Schema.org BlogPosting
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: translation.title,
    description: translation.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: post.authorName,
      url: BRAND.canonicalDomain,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: BRAND.canonicalDomain,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BRAND.canonicalDomain}/${locale}/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Breadcrumbs */}
        <nav aria-label="Migas de pan" className="text-xs text-graphite-500 dark:text-slate-400 flex items-center gap-2">
          <Link href={`/${locale}`} className="hover:underline">Inicio</Link>
          <span>/</span>
          <Link href={`/${locale}/blog`} className="hover:underline">Blog</Link>
          <span>/</span>
          <span className="text-graphite-900 dark:text-white font-medium truncate max-w-xs">{translation.title}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-graphite-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-petroleum-800 dark:text-petroleum-400 bg-petroleum-50 dark:bg-petroleum-950 px-2.5 py-1 rounded">
              {post.categoryKey}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} min de lectura
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {post.authorName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-graphite-900 dark:text-white tracking-tight leading-tight">
            {translation.title}
          </h1>

          <p className="text-base sm:text-lg text-graphite-600 dark:text-slate-300 font-medium leading-relaxed">
            {translation.excerpt}
          </p>
        </header>

        {/* Article Body Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-graphite-800 dark:text-slate-200 leading-relaxed space-y-6 pt-4 border-t border-graphite-200 dark:border-graphite-800">
          <div
            className="space-y-4 text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: translation.content
                .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-graphite-900 dark:text-white mt-8 mb-4">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-secondary mt-6 mb-2">$1</h3>')
                .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-secondary pl-4 py-2 italic text-graphite-700 dark:text-slate-300 my-4 bg-slate-50 dark:bg-graphite-800/60 rounded-r">$1</blockquote>')
                .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-graphite-700 dark:text-slate-300 mb-1">$1</li>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-secondary font-bold underline hover:opacity-80 transition-opacity">$1</a>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-graphite-900 dark:text-white">$1</strong>')
                .replace(/\n\n/g, '<p class="text-graphite-700 dark:text-slate-300 leading-relaxed mb-4">')
                .concat("</p>"),
            }}
          />
        </div>

        {/* Contextual CTA */}
        <div className="p-8 rounded-3xl bg-primary text-white space-y-4 text-center my-10 border border-secondary/30 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold">
            ¿Necesitas asesoramiento profesional para tu reforma en Madrid?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto">
            Elaboramos un presupuesto detallado por partidas y realizamos visita técnica previa en tu vivienda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={`/${locale}/presupuesto`}
              className="px-6 py-3 rounded-xl bg-secondary text-graphite-950 font-bold text-sm shadow hover:bg-yellow-500 transition-colors flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Solicitar presupuesto</span>
            </Link>
            <Link
              href={`/${locale}/reservar`}
              className="px-6 py-3 rounded-xl border border-secondary/50 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Reservar visita técnica
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-graphite-200 dark:border-graphite-800 space-y-4">
            <h3 className="text-xl font-bold text-graphite-900 dark:text-white">
              Artículos relacionados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${locale}/blog/${rel.slug}`}
                  className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-petroleum-600 transition-all shadow-sm space-y-2 group"
                >
                  <h4 className="font-bold text-sm text-graphite-900 dark:text-white group-hover:text-petroleum-800 dark:group-hover:text-petroleum-400 transition-colors">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-graphite-500 line-clamp-2">
                    {rel.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-6">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a todas las guías del blog</span>
          </Link>
        </div>
      </article>
    </>
  );
}
