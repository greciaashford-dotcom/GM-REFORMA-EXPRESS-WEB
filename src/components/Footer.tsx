"use client";

import React from "react";
import Link from "next/link";
import { BRAND, Locale } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Logo from "./brand/Logo";
import { Phone, Mail, MapPin, ShieldAlert, ShieldCheck, Sliders } from "lucide-react";

interface FooterProps {
  locale: Locale;
}

export const Footer: React.FC<FooterProps> = ({ locale }) => {
  const dict = getDictionary(locale).footer;

  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent("open_cookie_preferences"));
  };

  return (
    <footer className="bg-primary text-slate-300 border-t border-[#02172d] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={`/${locale}`} aria-label="GM REFORMA EXPRESS Inicio">
              <Logo variant="full" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mt-3">
              {dict.about}
            </p>
            <div className="pt-2 space-y-2.5 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>{BRAND.area}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                <a
                  href={BRAND.phoneTel}
                  className="hover:text-white transition-colors"
                >
                  {BRAND.phoneVisible}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                <a
                  href={BRAND.emailMailto}
                  className="hover:text-white transition-colors"
                >
                  {BRAND.email}
                </a>
              </div>
            </div>


            {/* Tax compliance notice banner */}
            <div className="mt-4 p-3 rounded-lg bg-graphite-800/80 border border-graphite-700 text-xs text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-300">Titularidad y Domicilio Fiscal</span>
                <p className="text-[11px] leading-tight text-slate-400">
                  {BRAND.legalName} · NIF: {BRAND.taxId} · {BRAND.fiscalAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Reformas de Vivienda */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Reformas de vivienda
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href={`/${locale}/servicios/reformas-banos-madrid`} className="hover:text-white transition-colors">
                  Reformas de baños
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/reformas-cocinas-madrid`} className="hover:text-white transition-colors">
                  Reformas de cocinas
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/reformas-integrales-madrid`} className="hover:text-white transition-colors">
                  Reformas integrales
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/cambio-banera-ducha-madrid`} className="hover:text-white transition-colors">
                  Bañera por ducha
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/suelos-tarima-madrid`} className="hover:text-white transition-colors">
                  Suelos y tarima
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/pintura-alisado-madrid`} className="hover:text-white transition-colors">
                  Pintura y alisado
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/carpinteria-puertas-madrid`} className="hover:text-white transition-colors">
                  Puertas y carpintería
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Instalaciones y Comunidades */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Instalaciones & Comunidades
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href={`/${locale}/servicios/fontaneria-madrid`} className="hover:text-white transition-colors">
                  Fontanería y tuberías
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/electricidad-iluminacion-madrid`} className="hover:text-white transition-colors">
                  Electricidad e iluminación
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/ventanas-cerramientos-madrid`} className="hover:text-white transition-colors">
                  Ventanas y cerramientos
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/climatizacion-aerotermia-madrid`} className="hover:text-white transition-colors">
                  Climatización y aerotermia
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/accesibilidad-viviendas-madrid`} className="hover:text-white transition-colors">
                  Viviendas accesibles
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/rehabilitacion-fachadas-madrid`} className="hover:text-white transition-colors">
                  Fachadas y cubiertas
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/servicios/accesibilidad-portales-madrid`} className="hover:text-white transition-colors">
                  Accesibilidad en portales
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Información & Políticas Legales */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {dict.legal}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href={`/${locale}/aviso-legal`} className="hover:text-white transition-colors">
                  {dict.legalNotice}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacidad`} className="hover:text-white transition-colors">
                  {dict.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="hover:text-white transition-colors">
                  {dict.cookies}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/condiciones-contratacion`} className="hover:text-white transition-colors">
                  {dict.contractTerms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/condiciones-uso`} className="hover:text-white transition-colors">
                  {dict.termsOfUse}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/desistimiento`} className="hover:text-white transition-colors">
                  {dict.withdrawal}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/accesibilidad`} className="hover:text-white transition-colors">
                  {dict.accessibility}
                </Link>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="flex items-center gap-1.5 text-xs text-petroleum-400 hover:text-petroleum-300 transition-colors py-1 focus:outline-none focus:ring-1 focus:ring-petroleum-400 rounded"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{dict.cookiePreferences}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal disclaimer */}
        <div className="mt-12 pt-8 border-t border-graphite-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} GM REFORMA EXPRESS. {dict.rightsReserved}</p>
          <p className="text-center md:text-right text-[11px] text-slate-400">
            {dict.coverageText} · Diseñado con accesibilidad WCAG 2.2 AA
          </p>
        </div>

        {/* Footer credits: DESTACA EN LINEA LLC */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-slate-300 font-medium">
              Diseño, Desarrollo Web y Estrategia Digital por:
            </span>
            <a
              href="https://destacaenlinea.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 hover:border-secondary/60 transition-all group shadow-sm"
              title="DESTACA EN LINEA LLC - Desarrollo Web y Soluciones Digitales"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://assets.zyrosite.com/YyvDQR7w2xsGZbE9/logo_blanco_2000x800-A3QlD2M82RiRG7Xp.png"
                alt="DESTACA EN LINEA LLC"
                className="h-5 sm:h-6 w-auto object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="font-semibold text-slate-100 group-hover:text-secondary text-xs transition-colors">
                DESTACA EN LINEA LLC
              </span>
            </a>
          </div>

          <a
            href="https://destacaenlinea.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-slate-300 hover:text-secondary transition-colors underline-offset-4 hover:underline font-medium"
          >
            destacaenlinea.com →
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
