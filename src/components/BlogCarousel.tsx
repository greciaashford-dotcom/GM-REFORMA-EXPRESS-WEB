"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, BookOpen } from "lucide-react";

export interface BlogPostItem {
  id: string;
  slug: string;
  categoryKey: string;
  readingTime: number;
  featuredImage?: string | null;
  publishedAt?: Date | string | null;
  translations?: Array<{
    title?: string | null;
    excerpt?: string | null;
    slug?: string | null;
  }>;
}

interface BlogCarouselProps {
  posts: BlogPostItem[];
  locale: string;
  title?: string;
  subtitle?: string;
  viewAllLabel?: string;
}

export default function BlogCarousel({
  posts,
  locale,
  title = "Guías técnicas y consejos de reformas",
  subtitle = "Artículos redactados por nuestro equipo técnico sobre normativas, materiales y presupuestos",
  viewAllLabel = "Ver todos los artículos",
}: BlogCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);

    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [posts]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    // Scroll roughly the width of one card plus gap
    const scrollAmount = container.clientWidth >= 1024 
      ? container.clientWidth * 0.7 
      : container.clientWidth * 0.85;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Mouse Drag to Scroll (Desktop UX Enhancement)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (!posts || posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label={title}>
      {/* Header with Title and Navigation Arrow Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-graphite-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <Link
            href={`/${locale}/blog`}
            className="text-xs sm:text-sm font-bold text-petroleum-800 dark:text-petroleum-300 hover:text-secondary dark:hover:text-secondary hover:underline flex items-center gap-1 transition-colors min-h-[44px]"
          >
            <span>{viewAllLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Left & Right Carousel Slide Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-slate-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-800 dark:text-slate-100 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-graphite-700 hover:border-secondary transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Deslizar artículos anteriores hacia la izquierda"
              title="Deslizar artículos hacia la izquierda"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-slate-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-graphite-800 dark:text-slate-100 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-graphite-700 hover:border-secondary transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Deslizar artículos siguientes hacia la derecha"
              title="Deslizar artículos hacia la derecha"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slidable Carousel Track */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {posts.map((post) => {
            const trans = post.translations?.[0] || {};
            const postSlug = trans.slug || post.slug;
            const postTitle = trans.title || post.slug;
            const postExcerpt = trans.excerpt || "";

            return (
              <article
                key={post.id}
                className="w-[85vw] sm:w-[340px] md:w-[360px] lg:w-[380px] flex-shrink-0 snap-start rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-secondary/70 dark:hover:border-secondary/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5"
              >
                {/* Optional Card Top Visual / Image */}
                {post.featuredImage ? (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-graphite-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.featuredImage}
                      alt={postTitle}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 dark:bg-graphite-900/95 text-petroleum-800 dark:text-secondary shadow-md border border-slate-200/50 dark:border-graphite-700">
                        {post.categoryKey}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-3 bg-gradient-to-r from-petroleum-800 via-secondary to-amber-500" />
                )}

                <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-graphite-500 dark:text-slate-400">
                      {!post.featuredImage && (
                        <>
                          <span className="font-extrabold uppercase tracking-wider text-petroleum-800 dark:text-secondary">
                            {post.categoryKey}
                          </span>
                          <span>·</span>
                        </>
                      )}
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        {post.readingTime} min de lectura
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-graphite-900 dark:text-white leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                      <Link
                        href={`/${locale}/blog/${postSlug}`}
                        className="focus:outline-none"
                      >
                        {postTitle}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {postExcerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-graphite-800/80 mt-4">
                    <Link
                      href={`/${locale}/blog/${postSlug}`}
                      className="text-xs font-bold text-petroleum-800 dark:text-secondary hover:underline inline-flex items-center gap-1.5 min-h-[44px] group-hover:translate-x-1 transition-transform"
                    >
                      <span>Leer artículo completo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
