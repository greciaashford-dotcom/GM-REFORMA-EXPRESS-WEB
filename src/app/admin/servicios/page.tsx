import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { Layers, CheckCircle2, Edit3, Eye, Clock, RefreshCw } from "lucide-react";

async function toggleServiceStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const nextStatus = formData.get("nextStatus") as "APPROVED" | "DRAFT";
  if (!id || !nextStatus) return;

  await db.service.update({
    where: { id },
    data: { status: nextStatus },
  });

  revalidatePath("/admin/servicios");
  revalidatePath("/admin");
  revalidatePath("/es/servicios");
  revalidatePath("/es");
}

export default async function AdminServiciosPage() {
  const services = await db.service.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      translations: {
        where: { locale: "es" },
      },
    },
  });

  const approvedCount = services.filter((s) => s.status === "APPROVED").length;
  const draftCount = services.length - approvedCount;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Executive Header */}
      <div className="rounded-3xl bg-[#03203d] text-white p-6 md:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#c9932a] text-[11px] font-bold uppercase tracking-widest mb-2.5">
            Módulo 10 · Arquitectura de Contenidos y SEO
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Catálogo de Servicios y Revisión Técnica ({services.length} Especialidades)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Edita títulos, subtítulos, alcances técnicos, preguntas frecuentes y metadatos multi-idioma (ES, EN, FR, DE, IT, PT) o alterna su estado de publicación en vivo.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Aprobados (Web)
            </span>
            <span className="text-xl font-black text-white">{approvedCount}</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              En Revisión
            </span>
            <span className="text-xl font-black text-white">{draftCount}</span>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c9932a]" />
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Matriz de Especialidades GM Reforma Express
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Haz clic en &ldquo;Editar&rdquo; para modificar textos y traducciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="px-6 py-4">Orden</th>
                <th className="px-6 py-4">Servicio & Identificador</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Estado de Publicación</th>
                <th className="px-6 py-4">Encabezado H1 (ES)</th>
                <th className="px-6 py-4 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-700 dark:text-slate-200">
              {services.map((s) => {
                const trans = s.translations[0] || {};
                const isApproved = s.status === "APPROVED";
                const nextStatus = isApproved ? "DRAFT" : "APPROVED";

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-extrabold text-[#03203d] dark:text-[#c9932a]">
                      #{String(s.orderIndex).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {trans.navTitle || s.key}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                        {s.key}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {isApproved ? "APROBADO" : "BORRADOR"}
                        </span>

                        <form action={toggleServiceStatus}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="nextStatus" value={nextStatus} />
                          <button
                            type="submit"
                            title={
                              isApproved
                                ? "Cambiar a Borrador / Revisión"
                                : "Aprobar y Publicar"
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#03203d] dark:hover:text-white hover:border-[#c9932a] transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>{isApproved ? "Pasar a Borrador" : "Aprobar"}</span>
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-600 dark:text-slate-300 font-medium">
                      {trans.h1 || "-"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/admin/servicios/${s.id}/editar`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#03203d] hover:bg-[#c9932a] hover:text-[#03203d] transition-colors px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#c9932a] group-hover:text-[#03203d]" />
                        <span>Editar</span>
                      </Link>
                      <Link
                        href={`/es/servicios/${trans.slug || s.key}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#c9932a] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#c9932a]/50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver web</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
