import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { BookOpen, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default async function AdminBlogPage() {
  const posts = await db.post.findMany({
    include: {
      translations: {
        where: { locale: "es" },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
            12. Blog y Guías Técnicas de Reformas
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
            Artículos informativos, casos de éxito, optimización técnica y enlaces en Madrid.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
          Total: {posts.length} artículos
        </div>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Título del Artículo (ES)</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Lectura</th>
                <th className="px-6 py-4">Publicación</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-graphite-500">
                    No constan artículos de blog todavía.
                  </td>
                </tr>
              ) : (
                posts.map((p) => {
                  const trans = p.translations[0] || {};
                  return (
                    <tr key={p.id} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-graphite-900 dark:text-white block">
                          {trans.title || p.slug}
                        </span>
                        <span className="text-[11px] text-graphite-400 block font-mono">
                          /blog/{trans.slug || p.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-graphite-100 dark:bg-graphite-800 text-graphite-600 dark:text-slate-300 font-medium">
                          {p.categoryKey}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-graphite-600 dark:text-slate-300 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          {p.readingTime} min
                        </span>
                      </td>
                      <td className="px-6 py-4 text-graphite-500 text-[11px] whitespace-nowrap">
                        {p.publishedAt ? new Intl.DateTimeFormat("es-ES", { dateStyle: "short" }).format(p.publishedAt) : "Borrador"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/es/blog/${trans.slug || p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
