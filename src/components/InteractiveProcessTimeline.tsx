"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CalendarCheck,
  Ruler,
  FileText,
  Hammer,
  CheckCircle2,
  Pause,
  Play,
  ArrowRight,
} from "lucide-react";

interface StepItem {
  id: number;
  stepNum: string;
  phaseLabel: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProcessDict {
  title?: string;
  subtitle?: string;
  step1Title?: string;
  step1Desc?: string;
  step2Title?: string;
  step2Desc?: string;
  step3Title?: string;
  step3Desc?: string;
  step4Title?: string;
  step4Desc?: string;
  step5Title?: string;
  step5Desc?: string;
}

interface InteractiveProcessTimelineProps {
  dict?: ProcessDict;
  locale?: string;
}

export const InteractiveProcessTimeline: React.FC<InteractiveProcessTimelineProps> = ({
  dict,
  locale = "es",
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Exact step definitions preserving required texts
  const steps: StepItem[] = [
    {
      id: 0,
      stepNum: "01",
      phaseLabel: "Paso 1 · Consulta o reserva",
      title: dict?.step1Title?.replace(/^\d+\.\s*/, "") || "Consulta o reserva",
      description:
        dict?.step1Desc ||
        "Solicita presupuesto o reserva una llamada o visita técnica según tus necesidades.",
      icon: CalendarCheck,
    },
    {
      id: 1,
      stepNum: "02",
      phaseLabel: "Paso 2 · Diagnóstico y replanteo",
      title: dict?.step2Title?.replace(/^\d+\.\s*/, "") || "Diagnóstico y replanteo",
      description:
        dict?.step2Desc ||
        "Tomamos medidas precisas y comprobamos el estado real de las instalaciones en tu vivienda de Madrid.",
      icon: Ruler,
    },
    {
      id: 2,
      stepNum: "03",
      phaseLabel: "Paso 3 · Presupuesto detallado",
      title: dict?.step3Title?.replace(/^\d+\.\s*/, "") || "Presupuesto detallado",
      description:
        dict?.step3Desc ||
        "Entregamos una propuesta por partidas claras con alcance, plazos estimados e hitos de pago acordados.",
      icon: FileText,
    },
    {
      id: 3,
      stepNum: "04",
      phaseLabel: "Paso 4 · Ejecución coordinada",
      title: dict?.step4Title?.replace(/^\d+\.\s*/, "") || "Ejecución coordinada",
      description:
        dict?.step4Desc ||
        "Planificación de trabajos, protección de zonas comunes y limpieza continua de obra.",
      icon: Hammer,
    },
    {
      id: 4,
      stepNum: "05",
      phaseLabel: "Paso 5 · Entrega y factura",
      title: dict?.step5Title?.replace(/^\d+\.\s*/, "") || "Entrega y factura",
      description:
        dict?.step5Desc ||
        "Revisión conjunta de acabados, entrega de documentación técnica y factura oficial.",
      icon: CheckCircle2,
    },
  ];

  // Scroll in-view trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    const currentElem = containerRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  // Automatic progression: exactly 3 seconds (3000ms) per step
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, activeStep, steps.length]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  const progressPercent = (activeStep / (steps.length - 1)) * 100;

  return (
    <section
      ref={containerRef}
      aria-label="Proceso de trabajo en 5 pasos"
      className="bg-warm-100/70 dark:bg-graphite-950 py-16 sm:py-24 border-y border-graphite-200 dark:border-graphite-800 relative overflow-hidden transition-colors"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-secondary/15 text-secondary dark:text-gold-400 text-xs font-bold uppercase tracking-wider border border-secondary/30 shadow-sm">
            <span>Metodología Certificada GM REFORMA EXPRESS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-graphite-900 dark:text-white tracking-tight leading-tight">
            {dict?.title || "Nuestro proceso en 5 pasos"}
          </h2>
          <p className="text-sm sm:text-base text-graphite-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {dict?.subtitle || "Desde la primera consulta hasta la entrega con garantía"}
          </p>

          {/* Step indicator & Pause/Play toggle without any time displayed */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-graphite-800/90 border border-slate-300 dark:border-graphite-700 hover:border-secondary transition-all shadow-sm focus:outline-none"
              aria-label={isPaused ? "Reanudar avance automático" : "Pausar avance automático"}
              title={isPaused ? "Reanudar avance automático" : "Pausar avance automático"}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  <span>Reanudar</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  <span className="flex items-center gap-1.5">
                    <span>Avance automático</span>
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  </span>
                </>
              )}
            </button>
            <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
              Paso {activeStep + 1} de {steps.length}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP TIMELINE (lg & xl screens): Horizontal Continuous Timeline Line   */}
        {/* ========================================================================= */}
        <div className="hidden lg:block">
          {/* Timeline Track with Animated Fill */}
          <div className="relative mb-10 mx-12">
            {/* Background base track */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2 bg-slate-200 dark:bg-graphite-800 rounded-full" />

            {/* Active filled progress gradient track */}
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-2 bg-gradient-to-r from-secondary via-amber-400 to-secondary rounded-full transition-all duration-700 ease-out shadow-md shadow-secondary/40"
              style={{
                width: `${progressPercent}%`,
              }}
            />

            {/* Nodes on top of the continuous line */}
            <div className="relative flex justify-between items-center z-10">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isSelected = activeStep === idx;
                const isCompleted = activeStep > idx;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    className="group relative flex flex-col items-center focus:outline-none cursor-pointer"
                    aria-label={`Paso ${s.stepNum}: ${s.title}`}
                  >
                    {/* Interactive Node Circle */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 font-black text-sm select-none ${
                        isSelected
                          ? "bg-secondary text-graphite-950 scale-125 ring-4 ring-secondary/50 shadow-xl shadow-secondary/40 rotate-3 z-20"
                          : isCompleted
                          ? "bg-primary text-white border-2 border-secondary shadow-md"
                          : "bg-white dark:bg-graphite-900 border-2 border-slate-300 dark:border-graphite-700 text-slate-500 dark:text-slate-400 group-hover:border-secondary group-hover:text-secondary group-hover:scale-110"
                      }`}
                    >
                      <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Step number badge below node */}
                    <span
                      className={`mt-2 text-xs font-black tracking-wider uppercase transition-colors ${
                        isSelected
                          ? "text-secondary font-extrabold scale-110"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-secondary"
                      }`}
                    >
                      {s.stepNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 Desktop Step Cards Grid */}
          <div className="grid grid-cols-5 gap-5 items-stretch">
            {steps.map((s, idx) => {
              const isSelected = activeStep === idx;

              return (
                <div
                  key={s.id}
                  onClick={() => handleStepClick(idx)}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 cursor-pointer text-left relative overflow-hidden ${
                    isSelected
                      ? "bg-white dark:bg-graphite-900 border-2 border-secondary shadow-xl shadow-secondary/20 ring-2 ring-secondary/30 scale-[1.04] -translate-y-2.5 z-10"
                      : "bg-white/80 dark:bg-graphite-900/80 border border-slate-200 dark:border-graphite-800 shadow-sm hover:border-secondary/60 hover:-translate-y-1.5 hover:shadow-md opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* 3-Second Active Progress Bar inside the card */}
                  {isSelected && !isPaused && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary/20 overflow-hidden">
                      <div
                        key={`bar-${activeStep}`}
                        className="h-full bg-gradient-to-r from-secondary to-amber-400 animate-fill-bar"
                      />
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-secondary tracking-wider uppercase">
                        {s.phaseLabel}
                      </span>
                      {isSelected && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-graphite-900 dark:text-white leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs text-graphite-600 dark:text-slate-300 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-graphite-800/80 mt-4 flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={
                        isSelected
                          ? "text-secondary font-black"
                          : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                      }
                    >
                      {isSelected ? "Fase activa" : "Seleccionar"}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? "text-secondary translate-x-1"
                          : "text-slate-400 opacity-60"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE / TABLET TIMELINE (< lg screens): Responsive Connected Vertical    */}
        {/* Stepper with Quick Jump Pills and Full-Width Readable Cards               */}
        {/* ========================================================================= */}
        <div className="lg:hidden space-y-6">
          {/* Quick jump step pill switcher for mobile */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
            {steps.map((s, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={`flex-1 min-w-[54px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border min-h-[44px] ${
                    isSelected
                      ? "bg-secondary text-graphite-950 border-secondary shadow-md scale-105"
                      : "bg-white dark:bg-graphite-900 border-slate-200 dark:border-graphite-800 text-slate-700 dark:text-slate-300"
                  }`}
                  aria-label={`Ir al paso ${s.stepNum}`}
                >
                  <span>{s.stepNum}</span>
                </button>
              );
            })}
          </div>

          {/* Connected Vertical Timeline List */}
          <div className="relative pl-6 sm:pl-8 space-y-6">
            {/* Continuous vertical timeline connector line */}
            <div className="absolute left-[18px] sm:left-[23px] top-6 bottom-6 w-1.5 bg-slate-200 dark:bg-graphite-800 rounded-full">
              {/* Progress fill */}
              <div
                className="w-full bg-gradient-to-b from-secondary via-amber-400 to-secondary rounded-full transition-all duration-700 ease-out"
                style={{
                  height: `${progressPercent}%`,
                }}
              />
            </div>

            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isSelected = activeStep === idx;
              const isCompleted = activeStep > idx;

              return (
                <div
                  key={s.id}
                  onClick={() => handleStepClick(idx)}
                  className="relative transition-all duration-500 cursor-pointer"
                >
                  {/* Vertical Node Indicator */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[34px] top-4 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs transition-all z-10 ${
                      isSelected
                        ? "bg-secondary text-graphite-950 ring-4 ring-secondary/40 shadow-md scale-110"
                        : isCompleted
                        ? "bg-primary text-white border-2 border-secondary"
                        : "bg-white dark:bg-graphite-900 border-2 border-slate-300 dark:border-graphite-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Card content */}
                  <div
                    className={`p-5 sm:p-6 rounded-2xl transition-all relative overflow-hidden ${
                      isSelected
                        ? "bg-white dark:bg-graphite-900 border-2 border-secondary shadow-lg shadow-secondary/10 ring-1 ring-secondary/30 scale-[1.01]"
                        : "bg-white/80 dark:bg-graphite-900/80 border border-slate-200 dark:border-graphite-800 shadow-sm"
                    }`}
                  >
                    {/* 3-Second Active Progress Bar inside the card on mobile */}
                    {isSelected && !isPaused && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/20 overflow-hidden">
                        <div
                          key={`mob-bar-${activeStep}`}
                          className="h-full bg-gradient-to-r from-secondary to-amber-400 animate-fill-bar"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2 pt-1">
                      <span className="text-[11px] font-extrabold text-secondary tracking-wider uppercase">
                        {s.phaseLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {s.stepNum}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-graphite-900 dark:text-white mb-2">
                      {s.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Interactive Call to Action bar */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 rounded-3xl bg-primary text-white shadow-xl border border-secondary/30 max-w-2xl mx-auto">
            <div className="text-left flex-1 space-y-1">
              <p className="font-bold text-sm sm:text-base text-white">
                ¿Quieres iniciar tu proyecto con este método probado?
              </p>
              <p className="text-xs text-slate-300">
                Pide presupuesto online o agenda tu visita técnica en Madrid sin coste.
              </p>
            </div>
            <a
              href={`/${locale}/presupuesto`}
              className="px-6 py-3 rounded-xl bg-secondary hover:bg-gold-600 text-graphite-950 font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap min-h-[44px]"
            >
              <span>Solicitar presupuesto</span>
              <ArrowRight className="w-4 h-4 text-graphite-950" />
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fillBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-fill-bar {
          animation: fillBar 3000ms linear forwards;
        }
      `}</style>
    </section>
  );
};

export default InteractiveProcessTimeline;
