import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Locale } from "@/lib/constants";
import {
  LayoutDashboard,
  FileCheck2,
  Calendar,
  Receipt,
  FolderKanban,
  UserCheck,
  CreditCard,
  LogOut,
} from "lucide-react";

interface ClienteLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function ClienteLayout({ children, params }: ClienteLayoutProps) {
  const locale = params.locale as Locale;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login?callback=/${locale}/cliente`);
  }

  const navLinks = [
    { href: `/${locale}/cliente`, label: "Resumen", icon: LayoutDashboard },
    { href: `/${locale}/cliente/presupuestos`, label: "Presupuestos & Pagos", icon: FileCheck2 },
    { href: `/${locale}/cliente/reservas`, label: "Mis Citas", icon: Calendar },
    { href: `/${locale}/cliente/facturas`, label: "Facturas y Recibos", icon: Receipt },
    { href: `/${locale}/cliente/perfil`, label: "Datos y Preferencias", icon: UserCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-2xl p-4 shadow-sm space-y-6 flex-shrink-0">
          <div className="px-3 py-2 border-b border-graphite-100 dark:border-graphite-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-petroleum-800 dark:text-petroleum-400">
              Área Privada de Cliente
            </span>
            <h2 className="text-base font-bold text-graphite-900 dark:text-white truncate mt-0.5">
              {user.name}
            </h2>
            <p className="text-xs text-graphite-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-graphite-700 dark:text-slate-200 hover:bg-warm-50 dark:hover:bg-graphite-800 hover:text-petroleum-800 transition-colors min-h-[44px]"
                >
                  <Icon className="w-4 h-4 text-petroleum-700 dark:text-petroleum-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-graphite-100 dark:border-graphite-800">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
