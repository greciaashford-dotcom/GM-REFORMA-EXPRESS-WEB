import React from "react";
import Link from "next/link";
import { Locale } from "@/lib/constants";
import { CheckCircle2, ArrowRight, ShieldCheck, Clock, Hammer, ClipboardList } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default function ComoTrabajamosPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";

  const steps = [
    {
      num: "01",
      icon: ClipboardList,
      title: "Asesoramiento inicial y visita técnica",
      desc: "Contacte con nosotros o reserve online una llamada de orientación o una visita presencial en su inmueble de Madrid. Tomamos medidas exhaustivas, analizamos sus prioridades y valoramos el estado real de las instalaciones.",
    },
    {
      num: "02",
      icon: Clock,
      title: "Presupuesto detallado y transparente",
      desc: "Elaboramos una propuesta económica desglosada por capítulos y partidas: demoliciones, albañilería, fontanería, electricidad, climatización y acabados. Sin costes ocultos ni sorpresas de última hora.",
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Contrato vinculante e hitos de pago",
      desc: "Formalizamos el acuerdo mediante contrato con fecha de inicio, plazo de finalización garantizado y pagos fraccionados vinculados a hitos de avance de obra efectivamente completados.",
    },
    {
      num: "04",
      icon: Hammer,
      title: "Ejecución con jefe de obra asignado",
      desc: "Un técnico especializado supervisa diariamente a los operarios en Madrid, gestiona los pedidos de material y le mantiene informado de cada fase del proyecto con reportes fotográficos en su portal de cliente.",
    },
    {
      num: "05",
      icon: CheckCircle2,
      title: "Entrega limpia y garantía por escrito",
      desc: "Finalizamos la obra realizando una limpieza profesional profunda. Revisamos conjuntamente cada detalle en el acta de recepción y le entregamos las certificaciones y garantías correspondientes.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950/60 text-petroleum-800 dark:text-petroleum-300 text-xs font-bold">
          Metodología GM REFORMA EXPRESS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-graphite-900 dark:text-white tracking-tight">
          Cómo trabajamos: rigor técnico de principio a fin
        </h1>
        <p className="text-sm sm:text-base text-graphite-600 dark:text-slate-300 leading-relaxed">
          Un proceso ordenado, predecible y con comunicación continua para que su reforma en Madrid sea una experiencia ágil y sin sobresaltos.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="flex-shrink-0 flex items-center gap-4">
                <span className="text-3xl font-black text-petroleum-700 dark:text-petroleum-400">
                  {s.num}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-graphite-800 flex items-center justify-center text-petroleum-800 dark:text-petroleum-300">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-graphite-900 dark:text-white">
                  {s.title}
                </h2>
                <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-petroleum-900 to-graphite-900 text-white text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          ¿Listo para iniciar su proyecto en Madrid?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Reserve ahora una visita técnica sin compromiso o solicite un presupuesto estimado online en 2 minutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/reservar`}
            className="px-8 py-3.5 rounded-xl bg-warm-400 hover:bg-warm-500 text-graphite-950 font-extrabold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2"
          >
            Reservar Visita o Llamada <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/presupuesto`}
            className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 inline-flex items-center justify-center"
          >
            Pedir Presupuesto Detallado
          </Link>
        </div>
      </div>
    </div>
  );
}
