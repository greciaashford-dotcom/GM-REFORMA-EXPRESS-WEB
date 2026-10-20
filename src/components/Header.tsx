"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BRAND, Locale } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Logo from "./brand/Logo";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { Phone, Calendar, ClipboardCheck, Menu, X, ChevronDown, User } from "lucide-react";

interface HeaderProps {
  locale: Locale;
  session?: {
    userId: string;
    name: string;
    role: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ locale, session }) => {
  const dict = getDictionary(locale).nav;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#03203d] border-b border-[#02172d] shadow-md transition-colors">
      {/* Top micro-bar for phone & area info - Always dark background #02172d */}
      <div className="bg-[#02172d] text-slate-300 text-xs py-1.5 px-4 hidden sm:block border-b border-[#04284d]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Servicio de reformas en Madrid y Comunidad
            </span>
            <a
              href={BRAND.phoneTel}
              className="flex items-center gap-1.5 text-secondary hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-secondary" />
              <span>{BRAND.phoneVisible}</span>
            </a>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Lun a Vie: 09:00 - 19:00 | Sáb: 10:00 - 14:00</span>
            <span className="text-secondary/90 font-medium">Atención técnica personalizada</span>
          </div>
        </div>
      </div>

      {/* Main navigation bar - Always dark #03203d */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[88px] sm:min-h-[104px] md:min-h-[120px] py-1.5">
          {/* Brand Logo - 3x Larger */}
          <Link
            href={`/${locale}`}
            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-secondary rounded-lg py-1"
            aria-label="GM REFORMA EXPRESS - Página de inicio"
          >
            <Logo className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto" />
          </Link>

          {/* Desktop Navigation Links - High Contrast on #03203d */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <Link
                href={`/${locale}/servicios`}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-semibold text-slate-100 hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <span>{dict.services}</span>
                <ChevronDown className="w-4 h-4 text-secondary/80" />
              </Link>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-80 bg-[#03203d] border border-[#05386b] shadow-2xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-secondary px-3 py-1.5 border-b border-[#04284d]">
                    {dict.allServices}
                  </div>
                  <div className="py-1">
                    <Link
                      href={`/${locale}/servicios/reformas-banos-madrid`}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
                    >
                      Reformas de baños
                    </Link>
                    <Link
                      href={`/${locale}/servicios/reformas-cocinas-madrid`}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
                    >
                      Reformas de cocinas
                    </Link>
                    <Link
                      href={`/${locale}/servicios/reformas-integrales-madrid`}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
                    >
                      Reformas integrales
                    </Link>
                    <Link
                      href={`/${locale}/servicios/cambio-banera-ducha-madrid`}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
                    >
                      Cambio de bañera por ducha
                    </Link>
                    <Link
                      href={`/${locale}/servicios/suelos-tarima-madrid`}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
                    >
                      Suelos y tarima
                    </Link>
                    <Link
                      href={`/${locale}/servicios/fontaneria-madrid`}
                      className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
                    >
                      Fontanería e instalaciones
                    </Link>
                    <Link
                      href={`/${locale}/servicios`}
                      className="block px-3 py-2 mt-1 rounded-lg text-xs font-bold text-secondary bg-[#02172d] hover:bg-[#04284d] border border-[#043360] transition-colors"
                    >
                      Ver el catálogo completo de 20 servicios →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={`/${locale}/como-trabajamos`}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-100 hover:text-secondary transition-colors"
            >
              {dict.howWeWork}
            </Link>
            <Link
              href={`/${locale}/sobre-nosotros`}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-100 hover:text-secondary transition-colors"
            >
              {dict.aboutUs}
            </Link>
            <Link
              href={`/${locale}/zonas-servicio`}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-100 hover:text-secondary transition-colors"
            >
              {dict.coverage}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-100 hover:text-secondary transition-colors"
            >
              {dict.blog}
            </Link>
            <Link
              href={`/${locale}/contacto`}
              className="px-3 py-2 rounded-md text-sm font-semibold text-slate-100 hover:text-secondary transition-colors"
            >
              {dict.contact}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector currentLocale={locale} />
            <ThemeToggle />

            {/* Client Portal Link */}
            {session ? (
              <Link
                href={session.role !== "CUSTOMER" ? "/admin" : `/${locale}/cliente`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
              >
                <User className="w-4 h-4 text-secondary" />
                <span className="max-w-[120px] truncate">{session.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-[#04284d] hover:text-secondary transition-colors"
              >
                <User className="w-4 h-4 text-secondary" />
                <span>{dict.clientPortal}</span>
              </Link>
            )}

            {/* Secondary CTA: Reservar visita */}
            <Link
              href={`/${locale}/reservar`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border-2 border-secondary text-secondary hover:bg-secondary/15 transition-all min-h-[44px]"
            >
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>{dict.bookCta}</span>
            </Link>

            {/* Primary CTA: Solicitar presupuesto */}
            <Link
              href={`/${locale}/presupuesto`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black bg-secondary hover:bg-amber-400 text-graphite-950 shadow-md transition-all hover:scale-[1.02] min-h-[44px]"
            >
              <ClipboardCheck className="w-4 h-4 text-graphite-950" />
              <span>{dict.quoteCta}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <LanguageSelector currentLocale={locale} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:bg-[#04284d] hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label={mobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Always dark background #03203d */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#04284d] bg-[#03203d] px-4 pt-4 pb-8 space-y-4 shadow-2xl">
          <div className="flex flex-col gap-2">
            <Link
              href={`/${locale}/servicios`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-slate-100 hover:bg-[#04284d] hover:text-secondary transition-colors"
            >
              {dict.allServices}
            </Link>
            <Link
              href={`/${locale}/como-trabajamos`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-slate-100 hover:bg-[#04284d] hover:text-secondary transition-colors"
            >
              {dict.howWeWork}
            </Link>
            <Link
              href={`/${locale}/sobre-nosotros`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-slate-100 hover:bg-[#04284d] hover:text-secondary transition-colors"
            >
              {dict.aboutUs}
            </Link>
            <Link
              href={`/${locale}/zonas-servicio`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-slate-100 hover:bg-[#04284d] hover:text-secondary transition-colors"
            >
              {dict.coverage}
            </Link>
            <Link
              href={`/${locale}/blog`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-slate-100 hover:bg-[#04284d] hover:text-secondary transition-colors"
            >
              {dict.blog}
            </Link>
            <Link
              href={`/${locale}/contacto`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-slate-100 hover:bg-[#04284d] hover:text-secondary transition-colors"
            >
              {dict.contact}
            </Link>
            <Link
              href={session ? (session.role !== "CUSTOMER" ? "/admin" : `/${locale}/cliente`) : `/${locale}/login`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-semibold text-secondary hover:bg-[#04284d] flex items-center gap-2 transition-colors"
            >
              <User className="w-5 h-5 text-secondary" />
              <span>{session ? `Mi cuenta (${session.name.split(" ")[0]})` : dict.clientPortal}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#04284d] flex flex-col gap-3">
            <Link
              href={`/${locale}/presupuesto`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg font-black bg-secondary text-graphite-950 shadow min-h-[44px] flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-5 h-5 text-graphite-950" />
              <span>{dict.quoteCta}</span>
            </Link>
            <Link
              href={`/${locale}/reservar`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg font-bold border-2 border-secondary text-secondary hover:bg-secondary/15 min-h-[44px] flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar className="w-5 h-5 text-secondary" />
              <span>{dict.bookCta}</span>
            </Link>

            <a
              href={BRAND.phoneTel}
              className="w-full text-center py-2.5 rounded-lg font-medium text-slate-300 hover:text-white text-sm flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-secondary" />
              <span>{BRAND.phoneVisible}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
