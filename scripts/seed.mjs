import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { servicesData } from "./services-data.mjs";
import { blogPostsData } from "./blog-data.mjs";
import { campaignsData } from "./campaigns-data.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando sembrado de datos en PostgreSQL para GM REFORMA EXPRESS...");

  // 1. SiteSettings
  console.log("Configurando SiteSettings...");
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      commercialName: "GM REFORMA EXPRESS",
      taxId: "Y90137803D",
      taxIdVerified: true,
      taxIdNotes: "Datos verificados conforme a documentación del titular.",
      legalName: "ANDERSON BEJARANO VASQUEZ",
      taxAddress: "Calle Ramon Lujan 53, Madrid",
      phone: "+34640677948",
      phoneVisible: "+34 640 677 948",
      email: "notificaciones.info@reformaexpress.com",
      domainCanonical: "https://www.reformaexpress.com",
      commercialArea: "Madrid, España",
      whatsappUrl: "https://wa.me/34640677948",
      whatsappEnabled: true,
      timezone: "Europe/Madrid",
      defaultCurrency: "EUR",
      publicBookingsEnabled: true,
      livePaymentsEnabled: false, // Bloqueado hasta validación fiscal
      fiscalIssuanceEnabled: false, // Bloqueado hasta validación fiscal
      marketingAutomationsEnabled: false,
      coveragePostalCodes: "28001-28055,28100-28991",
    },
    update: {
      taxId: "Y90137803D",
      phone: "+34640677948",
      email: "notificaciones.info@reformaexpress.com",
    },
  });

  // 2. Administrador principal
  console.log("Creando usuario administrador...");
  const adminPasswordHash = await bcrypt.hash("Admin2026!Express", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@reformaexpress.com" },
    create: {
      email: "admin@reformaexpress.com",
      name: "Administrador Principal GM",
      passwordHash: adminPasswordHash,
      role: "SUPERADMIN",
      isEmailVerified: true,
      twoFactorEnabled: false,
    },
    update: {
      role: "SUPERADMIN",
      passwordHash: adminPasswordHash,
    },
  });

  // 3. Cliente de prueba con presupuesto aprobado
  console.log("Creando cliente de prueba y presupuesto aprobado...");
  const clientPasswordHash = await bcrypt.hash("Cliente2026!", 12);
  const clientUser = await prisma.user.upsert({
    where: { email: "cliente.madrid@example.com" },
    create: {
      email: "cliente.madrid@example.com",
      name: "Carlos Mendoza",
      passwordHash: clientPasswordHash,
      role: "CUSTOMER",
      isEmailVerified: true,
      customerProfile: {
        create: {
          phone: "+34 611 223 344",
          workAddress: "Calle de Alcalá 120, 3º B",
          workPostalCode: "28009",
          workCity: "Madrid",
          billingName: "Carlos Mendoza",
          billingTaxId: "53412345K",
          billingAddress: "Calle de Alcalá 120, 3º B",
          billingPostalCode: "28009",
          billingCity: "Madrid",
          preferredLocale: "es",
          electronicInvoiceConsent: true,
          marketingConsent: true,
        },
      },
    },
    update: {},
  });

  // Presupuesto aprobado para probar flujo de importe acordado y pasarela de pago
  const existingQuote = await prisma.quote.findUnique({
    where: { quoteNumber: "PRE-2026-001" },
  });

  if (!existingQuote) {
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: "PRE-2026-001",
        customerId: clientUser.id,
        authorId: adminUser.id,
        title: "Reforma completa de cuarto de baño principal",
        status: "ACCEPTED", // Aprobado para habilitar Checkout exacto
        currentVersion: 1,
        subtotalCents: 436364, // 4.363,64 €
        vatRatePercent: 10,
        vatAmountCents: 43636,  // 436,36 €
        totalCents: 480000,     // 4.800,00 €
        currency: "EUR",
        validUntil: validUntilDate,
        notes: "Presupuesto aprobado por el cliente con partidas detalladas de fontanería, alicatado y plato de ducha.",
        versions: {
          create: {
            versionNumber: 1,
            subtotalCents: 436364,
            vatRatePercent: 10,
            vatAmountCents: 43636,
            totalCents: 480000,
            notes: "Versión 1 inicial aprobada.",
            lines: {
              create: [
                {
                  concept: "Demolición y desescombro de revestimientos y sanitarios antiguos",
                  quantity: 1,
                  unit: "pa",
                  unitPriceCents: 65000,
                  totalCents: 65000,
                },
                {
                  concept: "Renovación completa de tuberías de fontanería en multicapa y desagües",
                  quantity: 1,
                  unit: "pa",
                  unitPriceCents: 115000,
                  totalCents: 115000,
                },
                {
                  concept: "Alicatado y solado porcelánico rectificado con adhesivo C2TE",
                  quantity: 25,
                  unit: "m²",
                  unitPriceCents: 5000,
                  totalCents: 125000,
                },
                {
                  concept: "Suministro e instalación de plato de ducha resina C3 140x70 y mampara",
                  quantity: 1,
                  unit: "ud",
                  unitPriceCents: 95000,
                  totalCents: 95000,
                },
                {
                  concept: "Montaje de inodoro compacto, mueble de lavabo 80cm y grifería monomando",
                  quantity: 1,
                  unit: "pa",
                  unitPriceCents: 36364,
                  totalCents: 36364,
                },
              ],
            },
          },
        },
        contractAcceptance: {
          create: {
            versionNumber: 1,
            acceptedByUserId: clientUser.id,
            acceptedByName: "Carlos Mendoza",
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0 Acceptance Test",
            contractTermsVersion: "1.0",
            contractTextSnapshot:
              "Condiciones contractuales aceptadas electrónicamente: Pago por hitos de obra. 10% IVA aplicable a obras de renovación en vivienda habitual.",
          },
        },
      },
    });
    console.log(`Presupuesto creado con éxito: ${quote.quoteNumber} (Total: ${(quote.totalCents / 100).toFixed(2)} €)`);
  }

  // 4. Catálogo de los 20 Servicios con traducciones
  console.log(`Insertando catálogo de ${servicesData.length} servicios con traducciones...`);
  for (const s of servicesData) {
    const existing = await prisma.service.findUnique({
      where: { key: s.key },
    });

    let serviceId = existing?.id;
    if (!existing) {
      const created = await prisma.service.create({
        data: {
          key: s.key,
          category: s.category,
          status: s.status,
          orderIndex: s.orderIndex,
          featuredImage: s.featuredImage,
        },
      });
      serviceId = created.id;
    }

    // Insert or update translations
    for (const [locale, t] of Object.entries(s.translations)) {
      await prisma.serviceTranslation.upsert({
        where: {
          serviceId_locale: {
            serviceId: serviceId,
            locale,
          },
        },
        create: {
          serviceId: serviceId,
          locale,
          slug: t.slug,
          h1: t.h1,
          navTitle: t.navTitle,
          shortDesc: t.shortDesc,
          seoTitle: t.seoTitle,
          seoDesc: t.seoDesc,
          introProblem: t.introProblem,
          introSolution: t.introSolution,
          introScope: t.introScope,
          includedItems: t.includedItems,
          excludedItems: t.excludedItems,
          serviceVariants: t.serviceVariants,
          processSteps: t.processSteps,
          priceFactors: t.priceFactors,
          technicalRequirements: t.technicalRequirements,
          faqs: t.faqs,
          relatedSlugs: t.relatedSlugs,
        },
        update: {
          h1: t.h1,
          navTitle: t.navTitle,
          seoTitle: t.seoTitle,
          seoDesc: t.seoDesc,
          shortDesc: t.shortDesc,
        },
      });
    }
  }

  // 5. Blog y Artículos editoriales
  console.log(`Insertando ${blogPostsData.length} artículos editoriales en el Blog...`);
  for (const p of blogPostsData) {
    const existingPost = await prisma.post.findUnique({
      where: { slug: p.slug },
    });

    let postId = existingPost?.id;
    if (!existingPost) {
      const created = await prisma.post.create({
        data: {
          slug: p.slug,
          categoryKey: p.categoryKey,
          authorName: p.authorName,
          status: p.status,
          featuredImage: p.featuredImage,
          readingTime: p.readingTime,
          publishedAt: p.publishedAt,
        },
      });
      postId = created.id;
    }

    for (const [locale, t] of Object.entries(p.translations)) {
      await prisma.postTranslation.upsert({
        where: {
          postId_locale: {
            postId: postId,
            locale,
          },
        },
        create: {
          postId: postId,
          locale,
          slug: t.slug,
          title: t.title,
          excerpt: t.excerpt,
          content: t.content,
          seoTitle: t.seoTitle,
          seoDesc: t.seoDesc,
        },
        update: {
          title: t.title,
          excerpt: t.excerpt,
          content: t.content,
          seoTitle: t.seoTitle,
          seoDesc: t.seoDesc,
        },
      });
    }
  }

  // 6. Campañas de email marketing (4 semanas, 8 campañas)
  console.log(`Insertando calendario de email marketing (${campaignsData.length} campañas)...`);
  for (const c of campaignsData) {
    const existingCampaign = await prisma.campaign.findFirst({
      where: { internalName: c.internalName },
    });

    let campaignId = existingCampaign?.id;
    if (!existingCampaign) {
      const created = await prisma.campaign.create({
        data: {
          internalName: c.internalName,
          weekNumber: c.weekNumber,
          slotNumber: c.slotNumber,
          status: c.status,
          targetSegment: c.targetSegment,
        },
      });
      campaignId = created.id;
    }

    for (const [locale, t] of Object.entries(c.translations)) {
      await prisma.campaignTranslation.upsert({
        where: {
          campaignId_locale: {
            campaignId: campaignId,
            locale,
          },
        },
        create: {
          campaignId: campaignId,
          locale,
          subject: t.subject,
          preheader: t.preheader,
          headline: t.headline,
          bodyContent: t.bodyContent,
          imageUrl: t.imageUrl,
          imageAlt: t.imageAlt,
          ctaText: t.ctaText,
          ctaUrl: t.ctaUrl,
        },
        update: {
          subject: t.subject,
          preheader: t.preheader,
          headline: t.headline,
        },
      });
    }
  }

  // 7. Documentos legales en los 4 idiomas
  console.log("Configurando documentos legales obligatorios...");
  const legalDocs = [
    {
      type: "aviso-legal",
      title: "Aviso Legal",
      contentEs: `
# Aviso Legal — GM REFORMA EXPRESS

En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los datos identificativos del titular del sitio web:

- **Nombre comercial:** GM REFORMA EXPRESS
- **Identificador fiscal facilitado por el titular:** Y90137803D (Pendiente de verificación documental y determinación de naturaleza jurídica ante la AEAT)
- **Área comercial:** Madrid, España
- **Teléfono de contacto:** +34 640 677 948
- **Correo electrónico:** notificaciones.info@reformaexpress.com
- **Dominio web:** https://www.reformaexpress.com/

### Nota sobre verificación jurídica del emisor
Conforme a la política de cumplimiento normativo interno, los datos de razón social definitiva y domicilio fiscal completo del titular se encuentran en proceso de acreditación formal ante los organismos tributarios competentes. Hasta la culminación de dicha verificación, el sistema opera con limitaciones de cobro y emisión fiscal activa en entorno de producción.
      `,
      contentEn: "# Legal Notice — GM REFORMA EXPRESS\n\nIdentification and company details in accordance with Spanish Law 34/2002 (LSSI). Tax ID: Y90137803D (under formal verification).",
      contentFr: "# Mentions Légales — GM REFORMA EXPRESS\n\nMentions obligatoires conformément à la législation espagnole LSSI. Numéro fiscal : Y90137803D (en cours de vérification).",
      contentDe: "# Impressum — GM REFORMA EXPRESS\n\nAngaben gemäß spanischem Telemediengesetz (LSSI). Steuer-ID: Y90137803D (in formaler Überprüfung).",
    },
    {
      type: "privacidad",
      title: "Política de Privacidad",
      contentEs: `
# Política de Privacidad — GM REFORMA EXPRESS

En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018 (LOPDGDD), le informamos sobre el tratamiento de sus datos personales:

- **Responsable del tratamiento:** GM REFORMA EXPRESS (Identificador Y90137803D, pendiente de verificación).
- **Finalidades:**
  1. Atención de solicitudes de presupuesto y reservas de visita técnica (Base jurídica: Ejecución de medidas precontractuales a petición del interesado, art. 6.1.b RGPD).
  2. Gestión contable, administrativa y facturación (Base jurídica: Cumplimiento de obligaciones legales, art. 6.1.c RGPD).
  3. Envío de newsletter comercial (Base jurídica: Consentimiento expreso del interesado mediante doble opt-in, art. 6.1.a RGPD).
- **Derechos:** Acceso, rectificación, supresión, limitación, oposición y portabilidad mediante escrito a notificaciones.info@reformaexpress.com o ante la Agencia Española de Protección de Datos (AEPD).
      `,
      contentEn: "# Privacy Policy — GM REFORMA EXPRESS\n\nGDPR compliant privacy policy covering precontractual quote requests, account management, and double opt-in marketing.",
      contentFr: "# Politique de Confidentialité — GM REFORMA EXPRESS\n\nTraitement des données personnelles conformément au RGPD.",
      contentDe: "# Datenschutzerklärung — GM REFORMA EXPRESS\n\nInformationen zur Datenverarbeitung nach DSGVO.",
    },
    {
      type: "cookies",
      title: "Política de Cookies",
      contentEs: `
# Política de Cookies — GM REFORMA EXPRESS

Utilizamos cookies técnicas necesarias para el funcionamiento seguro de la sesión y cookies analíticas y de preferencias que requieren su consentimiento expreso:

- **Cookies técnicas esenciales:** Sesión de autenticación HttpOnly ('gm_session'), preferencias de idioma y token CSRF. No requieren consentimiento.
- **Cookies analíticas (Google Analytics 4):** Solo se activan tras aceptar explícitamente en el panel de configuración de cookies.
- **Cookies de personalización:** Almacenan si ha aceptado o rechazado la política de cookies.
      `,
      contentEn: "# Cookie Policy — GM REFORMA EXPRESS\n\nDetailed breakdown of necessary, analytical, and marketing cookies according to AEPD guidelines.",
      contentFr: "# Politique de Cookies — GM REFORMA EXPRESS\n\nInformation sur les traceurs et gestion du consentement.",
      contentDe: "# Cookie-Richtlinie — GM REFORMA EXPRESS\n\nGranulare Cookie-Einstellungen nach europäischen Vorgaben.",
    },
    {
      type: "condiciones-contratacion",
      title: "Condiciones de Contratación y Desistimiento",
      contentEs: `
# Condiciones de Contratación, Pagos y Desistimiento

- **Procedimiento de aceptación:** La contratación de obras de reforma se formaliza mediante la aceptación expresa del presupuesto detallado por partidas y versiones.
- **Importe acordado:** Cualquier importe consignado por el cliente requiere validación previa contra un presupuesto emitido por GM REFORMA EXPRESS.
- **Estructura de pagos:** Anticipos vinculados a acopio de materiales y pagos escalonados por hitos de obra ejecutados.
- **Derecho de desistimiento:** De conformidad con el Real Decreto Legislativo 1/2007, el consumidor dispone de un plazo de 14 días naturales para desistir del contrato celebrado a distancia. En caso de solicitar el inicio inmediato de las obras durante dicho plazo, el cliente deberá formular petición expresa y abonará el importe proporcional a los trabajos efectivamente ejecutados hasta el momento de la comunicación del desistimiento.
      `,
      contentEn: "# Terms of Contracting and Right of Withdrawal\n\nPhased payment rules, quote acceptance, and 14-day statutory consumer right of withdrawal under Spanish law.",
      contentFr: "# Conditions Générales de Vente et Droit de Rétractation\n\nRègles contractuelles, acomptes et droit de rétractation de 14 jours.",
      contentDe: "# Allgemeine Geschäftsbedingungen & Widerrufsbelehrung\n\nVertragsabschluss, Meilensteinzahlungen und gesetzliches Widerrufsrecht.",
    },
  ];

  for (const doc of legalDocs) {
    await prisma.legalDocument.upsert({
      where: { type: doc.type },
      create: doc,
      update: {
        title: doc.title,
        contentEs: doc.contentEs,
        contentEn: doc.contentEn,
        contentFr: doc.contentFr,
        contentDe: doc.contentDe,
      },
    });
  }

  console.log("¡Sembrado completado con éxito!");
}

main()
  .catch((e) => {
    console.error("Error durante el sembrado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
