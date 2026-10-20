import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      commercialName: "GM REFORMA EXPRESS",
      legalName: "ANDERSON BEJARANO VASQUEZ",
      taxAddress: "Calle Ramon Lujan 53, Madrid",
      taxId: "Y90137803D",
      taxIdVerified: false,
      taxIdNotes:
        "Identificador de 10 caracteres facilitado por el titular. Razón social: ANDERSON BEJARANO VASQUEZ, Domicilio fiscal: Calle Ramon Lujan 53, Madrid. Pendiente de comprobación documental y naturaleza jurídica ante la AEAT.",
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
      livePaymentsEnabled: false,
      fiscalIssuanceEnabled: false,
      marketingAutomationsEnabled: false,
      coveragePostalCodes: "28001-28055,28100-28991",
    },
    update: {
      legalName: "ANDERSON BEJARANO VASQUEZ",
      taxAddress: "Calle Ramon Lujan 53, Madrid",
      taxIdVerified: false,
      taxIdNotes:
        "Identificador de 10 caracteres facilitado por el titular. Razón social: ANDERSON BEJARANO VASQUEZ, Domicilio fiscal: Calle Ramon Lujan 53, Madrid. Pendiente de comprobación documental y naturaleza jurídica ante la AEAT.",
      livePaymentsEnabled: false,
      fiscalIssuanceEnabled: false,
    },
  });

  console.log("SiteSettings updated successfully:", updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
