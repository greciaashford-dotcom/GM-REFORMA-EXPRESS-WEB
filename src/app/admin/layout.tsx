import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import db from "@/lib/db";
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
  AlertTriangle,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role === "CUSTOMER") {
    redirect("/es/login?callback=/admin");
  }

  // Fetch site settings to check tax verification status
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });

  const isTaxUnverified = !settings?.taxIdVerified || !settings?.legalName || !settings?.taxAddress;

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

  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-warm-50/40 dark:bg-graphite-950 font-sans antialiased text-graphite-900 dark:text-slate-100">
        <div className="min-h-screen bg-warm-50 dark:bg-graphite-950 text-graphite-900 dark:text-slate-100 flex flex-col">
      {/* 1. MANDATORY TAX WARNING BANNER IF UNVERIFIED */}
      {isTaxUnverified && (
        <aside aria-label="Alerta de datos fiscales pendientes de verificación" className="bg-amber-500 text-graphite-950 px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-graphite-950" />
            <span>
              <strong>ATENCIÓN — DATOS FISCALES PENDIENTES DE VERIFICACIÓN:</strong> El identificador{" "}
              <code>{settings?.taxId || "Y90137803D"}</code> tiene 10 caracteres y está pendiente de verificación documental ante la AEAT. Faltan razón social y domicilio fiscal. Los cobros reales y la emisión fiscal activa están bloqueados por seguridad legal.
            </span>
          </div>
          <Link
            href="/admin/configuracion"
            className="underline font-bold text-graphite-950 hover:text-black flex-shrink-0 ml-4"
          >
            Completar datos fiscales →
          </Link>
        </aside>
      )}

      {/* Top Header */}
      <header className="min-h-[72px] py-1.5 bg-white dark:bg-graphite-900 border-b border-graphite-200 dark:border-graphite-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Logo className="h-12 sm:h-14 w-auto" />
          </Link>
          <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
            Panel de Operaciones v1.0
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/es"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-graphite-600 dark:text-slate-300 hover:text-petroleum-800"
          >
            <span>Ver web pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2 pl-3 border-l border-graphite-200 dark:border-graphite-800">
            <span className="font-semibold text-graphite-900 dark:text-white">{user.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-graphite-200 dark:bg-graphite-800 text-graphite-700 dark:text-slate-300">
              {user.role}
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Admin Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left 22-Sections Navigation Sidebar */}
        <nav aria-label="Menú de administración" className="w-72 bg-white dark:bg-graphite-900 border-r border-graphite-200 dark:border-graphite-800 overflow-y-auto p-4 space-y-6 flex-shrink-0 hidden lg:block">
          {adminNavSections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-graphite-400 dark:text-slate-500 px-3">
                {sec.group}
              </span>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-graphite-700 dark:text-slate-300 hover:bg-warm-50 dark:hover:bg-graphite-800 hover:text-petroleum-800 dark:hover:text-petroleum-400 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-petroleum-700 dark:text-petroleum-400 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">{children}</main>
      </div>
    </div>
      </body>
    </html>
  );
}
