import React from "react";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import {
  Inbox,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  Archive,
} from "lucide-react";

async function updateLeadStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as "NEW" | "CONTACTED" | "QUOTED" | "ARCHIVED";
  if (!id || !status) return;

  await db.lead.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
}

export default async function AdminSolicitudesPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = leads.filter((l) => l.status === "NEW").length;
  const contactedCount = leads.filter((l) => l.status === "CONTACTED").length;
  const quotedCount = leads.filter((l) => l.status === "QUOTED").length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Executive Header */}
      <div className="rounded-3xl bg-[#03203d] text-white p-6 md:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#c9932a] text-[11px] font-bold uppercase tracking-widest mb-2.5">
            Módulo 03 · Embudo Comercial
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Solicitudes y Captación Comercial (Leads)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Gestión de solicitudes entrantes de presupuesto y contacto procedentes de la web en Madrid y alrededores. Cambia el estado en un clic para actualizar el seguimiento.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Nuevas
            </span>
            <span className="text-xl font-black text-white">{newCount}</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              Contactadas
            </span>
            <span className="text-xl font-black text-white">{contactedCount}</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Presupuestadas
            </span>
            <span className="text-xl font-black text-white">{quotedCount}</span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#c9932a]" />
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Listado de Solicitudes ({leads.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Ordenado por fecha más reciente
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente / Contacto Directo</th>
                <th className="px-6 py-4">Especialidad & Zona</th>
                <th className="px-6 py-4">Detalle de la Solicitud</th>
                <th className="px-6 py-4">Estado Actual</th>
                <th className="px-6 py-4 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-700 dark:text-slate-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-400">
                    No constan solicitudes entrantes todavía.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(l.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {l.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <a
                          href={`tel:${l.phone}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#c9932a]/15 hover:text-[#c9932a] font-semibold transition-colors"
                        >
                          <Phone className="w-3 h-3" /> {l.phone}
                        </a>
                        <a
                          href={`mailto:${l.email}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-[#c9932a]/15 hover:text-[#c9932a] font-semibold transition-colors"
                        >
                          <Mail className="w-3 h-3" /> {l.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#03203d] dark:text-amber-300 block">
                        {l.serviceName || l.serviceSlug || "Reforma General"}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#c9932a]" />
                        {l.postalCode ? `CP ${l.postalCode} · Madrid` : "Madrid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {l.description}
                      </p>
                      {l.preferredContactTime && (
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                          Horario preferido: {l.preferredContactTime}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          l.status === "NEW"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            : l.status === "CONTACTED"
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
                            : l.status === "QUOTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {l.status === "NEW" && <Clock className="w-3 h-3" />}
                        {l.status === "CONTACTED" && <Send className="w-3 h-3" />}
                        {l.status === "QUOTED" && <CheckCircle2 className="w-3 h-3" />}
                        {l.status === "ARCHIVED" && <Archive className="w-3 h-3" />}
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <form action={updateLeadStatus} className="inline-flex items-center gap-1.5">
                        <input type="hidden" name="id" value={l.id} />
                        <select
                          name="status"
                          defaultValue={l.status}
                          aria-label="Cambiar estado de solicitud"
                          className="text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-[#c9932a]"
                        >
                          <option value="NEW">NEW (Nueva)</option>
                          <option value="CONTACTED">CONTACTED (Contactado)</option>
                          <option value="QUOTED">QUOTED (Presupuestado)</option>
                          <option value="ARCHIVED">ARCHIVED (Archivado)</option>
                        </select>
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 rounded-lg bg-[#03203d] hover:bg-[#c9932a] text-white hover:text-[#03203d] font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Guardar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
