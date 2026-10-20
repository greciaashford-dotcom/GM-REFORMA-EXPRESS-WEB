import React from "react";
import Link from "next/link";
import { FileCode2, Eye, CheckCircle2 } from "lucide-react";

export default function AdminPaginasPage() {
  const pages = [
    { title: "Inicio / Landing Principal", path: "/es", status: "PUBLICADA", type: "Home" },
    { title: "Catálogo de Servicios (20)", path: "/es/servicios", status: "PUBLICADA", type: "Catálogo" },
    { title: "Cómo Trabajamos (5 pasos)", path: "/es/como-trabajamos", status: "PUBLICADA", type: "Informativa" },
    { title: "Calculadora de Presupuesto", path: "/es/presupuesto", status: "PUBLICADA", type: "Conversión" },
    { title: "Reserva de Citas y Visitas", path: "/es/reservar", status: "PUBLICADA", type: "Agenda" },
    { title: "Blog Técnico y Guías", path: "/es/blog", status: "PUBLICADA", type: "Editorial" },
    { title: "Contacto y Localización", path: "/es/contacto", status: "PUBLICADA", type: "Contacto" },
    { title: "Aviso Legal e Identidad", path: "/es/aviso-legal", status: "PUBLICADA", type: "Legal" },
    { title: "Política de Privacidad", path: "/es/privacidad", status: "PUBLICADA", type: "Legal" },
    { title: "Política de Cookies", path: "/es/cookies", status: "PUBLICADA", type: "Legal" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          11. Páginas y Secciones Públicas (CMS)
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Inventario de rutas públicas renderizadas en Next.js con soporte multilingüe en Madrid.
        </p>
      </div>

      <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-100 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Página</th>
                <th className="px-6 py-4">Ruta Base</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800 text-graphite-700 dark:text-slate-200">
              {pages.map((p, idx) => (
                <tr key={idx} className="hover:bg-warm-50/50 dark:hover:bg-graphite-800/40">
                  <td className="px-6 py-4 font-bold text-graphite-900 dark:text-white">
                    {p.title}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-graphite-500">
                    {p.path}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-graphite-100 dark:bg-graphite-800 text-graphite-600 dark:text-slate-300 font-medium text-[11px]">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={p.path}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-petroleum-800 dark:text-petroleum-400 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver página</span>
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
