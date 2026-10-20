import React from "react";
import Link from "next/link";
import { Compass, Globe, ExternalLink, CheckCircle2 } from "lucide-react";
import { BRAND } from "@/lib/constants";

export default function AdminSeoPage() {
  const seoItems = [
    { name: "Sitemap XML Canónico", url: `${BRAND.canonicalDomain}/sitemap.xml`, status: "ACTIVO" },
    { name: "Robots TXT Indexación", url: `${BRAND.canonicalDomain}/robots.txt`, status: "ACTIVO" },
    { name: "Etiquetas Hreflang (4 Idiomas)", url: `${BRAND.canonicalDomain}/es`, status: "ES, EN, FR, DE" },
    { name: "JSON-LD Schema Org (HomeAndConstructionBusiness)", url: `${BRAND.canonicalDomain}/es`, status: "CONFIGURADO" },
    { name: "OpenGraph y Twitter Cards", url: `${BRAND.canonicalDomain}/es`, status: "CONFIGURADO" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          15. SEO Técnico y Marcado Estructurado
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Configuración para motores de búsqueda, sitemap.xml, robots.txt y geolocalización en Madrid.
        </p>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Recurso SEO</th>
                <th className="px-6 py-4">URL Canónica</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Enlace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {seoItems.map((s, idx) => (
                <tr key={idx} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40">
                  <td className="px-6 py-4 font-bold text-graphite-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-graphite-500">
                    {s.url}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={s.url}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
