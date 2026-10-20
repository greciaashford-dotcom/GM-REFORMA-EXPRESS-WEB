import React from "react";
import Link from "next/link";
import { Locale, BRAND } from "@/lib/constants";
import { Award, ShieldCheck, Users, Clock, ArrowRight } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default function SobreNosotrosPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";

  const values = [
    {
      icon: Clock,
      title: "Agilidad y Cumplimiento de Plazos",
      desc: "Optimizamos los tiempos de ejecución mediante una planificación cronometrada de los gremios para que disfrute de su nuevo espacio sin demoras injustificadas.",
    },
    {
      icon: ShieldCheck,
      title: "Rigor Técnico y Garantía",
      desc: "Materiales certificados por las principales marcas europeas y mano de obra cualificada en todas las ramas de la construcción.",
    },
    {
      icon: Users,
      title: "Trato Cercano y Transparente",
      desc: "Un único interlocutor técnico asignado a su proyecto para resolver dudas, coordinar detalles y mantenerle informado en todo momento.",
    },
    {
      icon: Award,
      title: "Especialización Multidisciplinar",
      desc: "20 servicios técnicos integrados bajo una misma dirección: desde baños y cocinas hasta climatización, domótica y envolventes térmicas.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950/60 text-petroleum-800 dark:text-petroleum-300 text-xs font-bold">
          Sobre GM REFORMA EXPRESS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-graphite-900 dark:text-white tracking-tight">
          Transformamos espacios en Madrid con precisión, rapidez y compromiso
        </h1>
        <p className="text-sm sm:text-base text-graphite-600 dark:text-slate-300 leading-relaxed">
          Nacimos para dar una respuesta ágil y profesional a quienes buscan renovar su vivienda o local en la Comunidad de Madrid sin las fricciones tradicionales del sector.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-graphite-900 dark:text-white">
            Nuestra Filosofía
          </h2>
          <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
            Creemos que una reforma no tiene por qué ser una fuente de estrés. Combinamos la experiencia técnica de nuestros oficiales de obra con herramientas digitales modernas que permiten a cada cliente seguir sus presupuestos, reservas y facturas en tiempo real.
          </p>
          <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
            Nuestro equipo actúa con rigor en cada fase: desde la demolición controlada y la renovación integral de suministros hasta la colocación milimétrica de alicatados, tarimas y carpinterías.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-petroleum-800 text-white shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Compromiso de Calidad en Madrid
            </h2>
            <p className="text-xs sm:text-sm text-petroleum-100 mt-3 leading-relaxed">
              Operamos en toda la capital y municipios de la corona metropolitana. Gestionamos licencias, residuos conforme al Plan de Gestión de Residuos de la CAM y aseguramos todas las intervenciones con póliza de Responsabilidad Civil.
            </p>
          </div>
          <div className="pt-4 border-t border-petroleum-700/60 flex items-center justify-between text-xs text-petroleum-200">
            <span>Atención telefónica directa</span>
            <span className="font-bold text-white">{BRAND.phoneVisible}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-graphite-900 dark:text-white text-center mb-8">
          Nuestros Valores Fundamentales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-graphite-800 flex items-center justify-center text-petroleum-800 dark:text-petroleum-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-graphite-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs text-graphite-600 dark:text-slate-300 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href={`/${locale}/servicios`}
          className="px-8 py-3.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm transition-all inline-flex items-center gap-2 shadow-md"
        >
          Explorar los 20 Servicios Disponibles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
