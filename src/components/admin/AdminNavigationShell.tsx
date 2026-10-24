"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/brand/Logo";
import {
  LayoutDashboard,
  BarChart3,
  Inbox,
  Users,
  FileCheck2,
  Calendar,
  FolderKanban,
  CreditCard,
  Receipt,
  Layers,
  FileCode2,
  BookOpen,
  Image as ImageIcon,
  Compass,
  Languages,
  Mail,
  Send,
  ShieldCheck,
  Cpu,
  UserCog,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Search,
  Sparkles,
  Activity,
} from "lucide-react";

interface AdminShellProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

const adminNavSections = [
  {
    group: "Operativa Comercial",
    items: [
      { href: "/admin", label: "1. Resumen Ejecutivo", icon: LayoutDashboard },
      { href: "/admin/analitica", label: "2. Analítica y Conversiones", icon: BarChart3 },
      { href: "/admin/solicitudes", label: "3. Solicitudes y Leads", icon: Inbox },
      { href: "/admin/clientes", label: "4. Clientes", icon: Users },
      { href: "/admin/presupuestos", label: "5. Presupuestos y Contratos", icon: FileCheck2 },
      { href: "/admin/reservas", label: "6. Reservas y Agenda", icon: Calendar },
      { href: "/admin/proyectos", label: "7. Proyectos y Seguimiento", icon: FolderKanban },
    ],
  },
  {
    group: "Finanzas & Facturación",
    items: [
      { href: "/admin/pagos", label: "8. Pagos y Reembolsos", icon: CreditCard },
      { href: "/admin/facturas", label: "9. Facturas y Series", icon: Receipt },
    ],
  },
  {
    group: "Gestión de Contenido (CMS)",
    items: [
      { href: "/admin/servicios", label: "10. Catálogo de Servicios", icon: Layers },
      { href: "/admin/paginas", label: "11. Páginas y Bloques", icon: FileCode2 },
      { href: "/admin/blog", label: "12. Blog y Categorías", icon: BookOpen },
      { href: "/admin/testimonios", label: "13. Proyectos Públicos", icon: FolderKanban },
      { href: "/admin/imagenes", label: "14. Biblioteca Imágenes URL", icon: ImageIcon },
      { href: "/admin/seo", label: "15. SEO y Redirecciones", icon: Compass },
      { href: "/admin/traducciones", label: "16. Traducciones", icon: Languages },
    ],
  },
  {
    group: "Marketing & Comunicación",
    items: [
      { href: "/admin/newsletter", label: "17. Newsletter y Segmentos", icon: Mail },
      { href: "/admin/campanas", label: "18. Campañas y Automatizaciones", icon: Send },
      { href: "/admin/consentimientos", label: "19. Consentimientos RGPD", icon: ShieldCheck },
    ],
  },
  {
    group: "Sistema & Configuración",
    items: [
      { href: "/admin/integraciones", label: "20. Integraciones y Estado", icon: Cpu },
      { href: "/admin/usuarios", label: "21. Usuarios y Auditoría", icon: UserCog },
      { href: "/admin/configuracion", label: "22. Configuración General", icon: Settings },
    ],
  },
];

export default function AdminNavigationShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  const isRouteActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const filteredSections = adminNavSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) =>
        item.label.toLowerCase().includes(filterQuery.toLowerCase())
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Executive Dark Top Header */}
      <header className="min-h-[76px] py-2 bg-[#03203d] border-b border-[#02172d] px-4 sm:px-6 flex items-center justify-between text-white shadow-md z-30">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Abrir menú de administración"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-3">
            <Logo className="h-12 sm:h-14 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#c9932a]/40 text-[#c9932a] text-xs font-extrabold tracking-wide">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Centro de Control Enterprise · v2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <Link
            href="/es"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#c9932a] text-slate-100 hover:text-graphite-950 font-bold transition-all"
          >
            <span>Ver web pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
            <div className="w-8 h-8 rounded-xl bg-[#c9932a] text-graphite-950 font-black flex items-center justify-center text-xs shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-bold text-white block leading-none">{user.name}</span>
              <span className="text-[10px] uppercase font-extrabold text-[#c9932a] tracking-wider mt-0.5 block">
                {user.role}
              </span>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="p-2.5 text-red-300 hover:text-white hover:bg-red-600/80 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop & Mobile Sidebar */}
        <nav
          aria-label="Menú de administración"
          className={`${
            mobileMenuOpen
              ? "fixed inset-y-0 left-0 z-40 w-72 block pt-20"
              : "hidden lg:block w-72"
          } bg-[#03203d] text-slate-200 border-r border-[#02172d] overflow-y-auto p-4 space-y-5 flex-shrink-0 scrollbar-thin shadow-xl lg:shadow-none`}
        >
          {/* Quick Module Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrar módulo (1–22)..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#02172d] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#c9932a]"
            />
          </div>

          {filteredSections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c9932a]/90 px-3 block">
                {sec.group}
              </span>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = isRouteActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-[#c9932a] text-graphite-950 shadow-md shadow-[#c9932a]/20"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          active ? "text-graphite-950" : "text-[#c9932a]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Backdrop for Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 bg-slate-50/80 dark:bg-[#020d1a] bg-light-grid">
          {children}
        </main>
      </div>
    </div>
  );
}
