# GM REFORMA EXPRESS — Web App de Producción

Plataforma web de producción para **GM REFORMA EXPRESS**, empresa de reformas rápidas, integrales y parciales en la Comunidad de Madrid. Diseñada y construida con arquitectura moderna Next.js 14 App Router, PostgreSQL con Prisma ORM, control de acceso basado en roles (RBAC), internacionalización cuatrilingüe (`es`, `en`, `fr`, `de`), sistema de agenda con reserva en tiempo real, validación crítica del importe acordado antifraude y panel de administración completo de 22 secciones.

---

## 1. Identidad de Marca y Advertencia Regulatoria

- **Nombre Comercial:** `GM REFORMA EXPRESS`
- **Área Geográfica de Operación:** Comunidad de Madrid (Madrid Capital CP 28001–28055 y Corona Metropolitana CP 28100–28991)
- **Teléfono Oficial:** `+34 640 677 948` (`tel:+34640677948`)
- **Correo Electrónico:** `notificaciones.info@reformaexpress.com`
- **WhatsApp Oficial:** `https://wa.me/34640677948` (botón sin rastreadores de terceros)
- **Identificador Fiscal:** `Y90137803D`
  > ⚠️ **ADVERTENCIA TRIBUTARIA Y JURÍDICA:** El literal facilitado `Y90137803D` posee 10 caracteres alfanuméricos, por lo que no se ajusta a la estructura canónica estándar de 9 caracteres de los NIE/NIF expedidos por la AEAT. Se mantiene registrado bajo el estado expreso de **"pendiente de verificación documental"**. Los cobros reales y la expedición fiscal formal se encuentran bloqueados en el sistema (`LIVE_PAYMENTS_ENABLED=false`, `FISCAL_ISSUANCE_ENABLED=false`). Todas las facturas de prueba emitidas incluyen por diseño la marca de agua:
  > **`PRUEBA / NO VÁLIDO COMO FACTURA FISCAL`**.

---

## 2. Pila Tecnológica

- **Framework Web:** Next.js 14.2.15 (App Router, Server Components y Server Actions).
- **Base de Datos:** PostgreSQL 16 con Prisma ORM 5.21.
- **Tipado y Validación:** TypeScript 5.6 + Zod 3.23.
- **Diseño y Estilos:** Tailwind CSS 3.4 con paleta temática corporativa (Petróleo `#0f4c5c`, Grafito `#1e293b`, Blanco cálido `#fafaf9`), soporte nativo de modo claro / modo oscuro (`dark mode`).
- **Seguridad y Criptografía:** Bcrypt.js (coste 12), JSON Web Tokens (JWT), validación anti-SSRF para recursos externos con resolución DNS contra redes privadas y metadatos cloud.
- **Pagos:** Servidor Stripe Checkout con reconciliación por Webhooks y adaptador de prueba local.
- **Testing:** Vitest 2.1 con suites de pruebas unitarias y de aceptación.

---

## 3. Catálogo de los 20 Servicios Especializados

El catálogo abarca 20 disciplinas agrupadas en 3 sectores estratégicos, disponibles en 4 idiomas (`es`, `en`, `fr`, `de`) con esquemas JSON-LD (`Service` y `BreadcrumbList`):

### Sector Residencial Clave
1. `reformas-banos-madrid` — Reformas de Baños
2. `reformas-cocinas-madrid` — Reformas de Cocinas
3. `reformas-integrales-viviendas` — Reformas Integrales de Pisos y Chalets
4. `cambio-banera-por-plato-ducha` — Cambio de Bañera por Plato de Ducha
5. `pintura-alisado-paredes` — Pintura Profesional y Alisado de Gotelé
6. `suelos-tarimas-madrid` — Instalación de Suelos Vinílicos y Tarimas Flotantes
7. `carpinteria-aluminio-pvc` — Ventanas de PVC y Carpintería de Aluminio RPT
8. `puertas-armarios-medida` — Puertas de Paso y Armarios Empotrados a Medida

### Instalaciones Técnicas y Eficiencia
9. `electricidad-boletines-madrid` — Instalaciones Eléctricas y Boletines (CIE)
10. `fontaneria-saneamiento-calefaccion` — Fontanería, Desagües y Calefacción
11. `climatizacion-aerotermia-aire` — Aire Acondicionado y Climatización por Aerotermia
12. `impermeabilizacion-terrazas-cubiertas` — Impermeabilización de Terrazas y Cubiertas
13. `aislamiento-termico-acustico-sate` — Aislamiento Térmico SATE y Acústico
14. `pladur-falsos-techos-tabiqueria` — Tabiquería de Cartón-Yeso (Pladur) y Techos Técnicos
15. `iluminacion-led-diseno-domotica` — Iluminación LED Arquitectónica y Domótica

### Comercial, Accesibilidad y Exteriores
16. `reformas-locales-oficinas` — Adecuación de Locales Comerciales y Oficinas
17. `accesibilidad-reformas-adaptadas` — Reformas Adaptadas y Accesibilidad PMR
18. `insonorizacion-acustica-espacios` — Insonorización Acústica Certificada
19. `albanileria-reparaciones-express` — Albañilería Rápida y Reparaciones Urgentes
20. `reparacion-fachadas-patios` — Rehabilitación de Fachadas y Patios de Luces

---

## 4. Estructura de Credenciales de Prueba

Para verificar y operar en el entorno de desarrollo y pruebas:

| Rol | Correo Electrónico | Contraseña | Acceso |
|---|---|---|---|
| **Superadministrador** | `admin@reformaexpress.com` | `Admin2026!Express` | Panel Admin 22 secciones (`/admin`) |
| **Cliente de Prueba** | `cliente.madrid@example.com` | `Cliente2026!` | Portal Privado (`/es/cliente`) |

### Presupuesto Semilla para Pruebas del Importe Acordado:
- **Referencia:** `PRE-2026-001`
- **Importe Aprobado:** `4.800,00 €` (480.000 céntimos enteros, Base 4.363,64 € + IVA 10% 436,36 €).
- **Comprobación Antifraude:** Si en el portal de cliente se introduce cualquier cantidad distinta de 4.800,00 €, el sistema bloquea inmediatamente la pasarela y registra un expediente en la tabla `AgreedAmountVerificationRequest`.

---

## 5. Puesta en Marcha y Ejecución

```powershell
# 1. Configurar variables de entorno (ver .env.example)
cp .env.example .env

# 2. Generar cliente Prisma y sincronizar base de datos
npx prisma generate
npx prisma db push

# 3. Sembrar catálogo, campañas, blog y usuarios
node scripts/seed.mjs

# 4. Ejecutar suite de pruebas de aceptación
npm test

# 5. Compilar para producción
npm run build

# 6. Iniciar servidor
npm start
```

---

## 6. Procedimiento para Habilitar Pagos e Facturación Real

Antes de activar `LIVE_PAYMENTS_ENABLED=true` y `FISCAL_ISSUANCE_ENABLED=true`, el administrador debe completar en el panel (`/admin/configuracion`):

1. Solicitar y verificar el certificado censal de la AEAT acreditando la personalidad jurídica o alta censal (Modelo 036/037).
2. Ratificar si el identificador `Y90137803D` corresponde a un NIE válido o corregir al NIF/CIF definitivo de 9 caracteres.
3. Registrar la razón social completa del titular y su domicilio fiscal fehaciente en Madrid.
4. Conectar la clave de producción de Stripe (`STRIPE_SECRET_KEY`) y la API fiscal homologada.
