import React from "react";
import { FolderKanban, Star, CheckCircle2 } from "lucide-react";

export default function AdminTestimoniosPage() {
  const testimonials = [
    {
      author: "Carlos M. (Madrid Centro)",
      project: "Reforma Integral de Cocina y Baño",
      review: "Cumplimiento exacto de plazos y presupuesto cerrado sin ninguna desviación. El resultado ha superado las expectativas.",
      rating: 5,
      date: "Octubre 2026",
    },
    {
      author: "Elena G. (Chamberí, Madrid)",
      project: "Cambio de Bañera por Plato de Ducha Antideslizante",
      review: "Rápidos, limpios y muy coordinados. En solo 48 horas el baño estaba completamente terminado y funcionando.",
      rating: 5,
      date: "Septiembre 2026",
    },
    {
      author: "Javier R. (Pozuelo de Alarcón)",
      project: "Renovación de Fontanería y Suelo de Tarima",
      review: "Gran profesionalidad de los técnicos. Asesoramiento honesto en la elección de materiales.",
      rating: 5,
      date: "Agosto 2026",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          13. Proyectos Públicos y Opiniones Verificadas
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Casos reales de clientes con reformas ejecutadas en la Comunidad de Madrid.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-secondary">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="text-sm font-bold">★</span>
                ))}
              </div>
              <h3 className="font-bold text-sm text-graphite-900 dark:text-white">
                {t.project}
              </h3>
              <p className="text-xs text-graphite-600 dark:text-slate-300 leading-relaxed italic">
                &quot;{t.review}&quot;
              </p>
            </div>
            <div className="pt-3 border-t border-graphite-100 dark:border-graphite-800 text-[11px] text-graphite-500 flex items-center justify-between">
              <span className="font-semibold text-graphite-700 dark:text-slate-200">{t.author}</span>
              <span>{t.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
